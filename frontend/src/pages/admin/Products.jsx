import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { categoryService, productImageService, productService } from '../../services/api';
import { getCachedOrFetch, listCacheKey, CACHE_KEYS, invalidateProducts } from '../../services/adminDataCache';
import { Eye, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, AlertTriangle, Package, Download, Upload, Star } from 'lucide-react';
import AdminLoader from '../../components/AdminLoader';
import AdminModal from '../../components/AdminModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres et Tri
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortStock, setSortStock] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Action states
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: '',
    stock_quantity: 0,
    category_id: '',
    is_active: true,
    description: '',
    active_ingredients: '',
    inci_list: '',
    usage_instructions: '',
    skin_type: '',
    application_time: '',
    low_stock_threshold: 10,
  });

  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageIsMain, setImageIsMain] = useState(true);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const imageFileInputRef = useRef(null);
  const createImageFileInputRef = useRef(null);
  const editImageFileInputRef = useRef(null);

  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImageIsMain, setEditImageIsMain] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [editImageError, setEditImageError] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: search.trim() || undefined,
        category_id: filterCategory || undefined,
        is_active: filterStatus === 'active' ? 1 : (filterStatus === 'inactive' ? 0 : undefined),
        sort_stock: sortStock || undefined,
      };

      const cacheKey = listCacheKey(CACHE_KEYS.productsPrefix, params);
      const response = await getCachedOrFetch(cacheKey, () => productService.list(params));

      // Laravel pagination structure
      if (response && response.data) {
        setProducts(response.data);
        setTotalPages(response.last_page || 1);
        setTotalResults(response.total || 0);
      } else {
        setProducts(Array.isArray(response) ? response : []);
        setTotalPages(1);
        setTotalResults(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      const message = err?.message || err?.error || "Impossible de charger les produits";
      setError(typeof message === 'string' ? message : "Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCachedOrFetch(CACHE_KEYS.categories, () => categoryService.list());
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error("Categories load error", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus, sortStock]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, filterCategory, filterStatus, sortStock]);

  const paginatedProducts = products;

  const handleOpenModal = () => {
    setFormError(null);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setSelectedFiles([]);
    if (createImageFileInputRef.current) {
      createImageFileInputRef.current.value = '';
    }
    if (!categories.length) {
      setFormError('Veuillez d\'abord créer au moins une catégorie avant d\'ajouter un produit.');
      return;
    }
    setNewProduct({
      name: '',
      sku: '',
      price: '',
      stock_quantity: 0,
      category_id: categories[0]?.id || '',
      is_active: true,
      description: '',
      active_ingredients: '',
      inci_list: '',
      usage_instructions: '',
      skin_type: '',
      application_time: '',
      low_stock_threshold: 10,
    });
    setIsModalOpen(true);
  };

  const handleFileLocalPreview = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    const combined = [...selectedFiles, ...newFiles];
    if (combined.length > 8) {
      setFormError(`Maximum 8 images autorisées. Vous en avez déjà ${selectedFiles.length} sélectionnée(s).`);
      e.target.value = '';
      return;
    }
    setFormError(null);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    const previews = combined.map(file => URL.createObjectURL(file));
    setSelectedFiles(combined);
    setImagePreviews(previews);
    e.target.value = '';
  };

  const handleRemoveSelectedImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Vous devez être connecté pour exporter les produits', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      toast.info('Export en cours...', {
        position: 'top-right',
        autoClose: 2000,
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/products/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv, application/csv',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur lors de l\'export' }));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export CSV réussi ! Le fichier a été téléchargé.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Erreur lors de l\'export CSV: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Veuillez sélectionner un fichier CSV (.csv ou .txt)', {
        position: 'top-right',
        autoClose: 3000,
      });
      e.target.value = '';
      return;
    }

    // Demander confirmation avant l'import
    const confirmed = window.confirm('Voulez-vous importer ce fichier CSV ?\n\nLes produits existants avec le même SKU seront mis à jour.\nLes nouveaux produits seront créés.');
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Vous devez être connecté pour importer des produits', {
          position: 'top-right',
          autoClose: 3000,
        });
        e.target.value = '';
        return;
      }

      toast.info('Import en cours...', {
        position: 'top-right',
        autoClose: false,
        toastId: 'import-progress',
      });

      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/products/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        throw new Error(`Erreur serveur: ${text || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      // Refresh products list
      const productsData = await productService.list();
      setProducts(Array.isArray(productsData) ? productsData : []);

      toast.dismiss('import-progress');

      // Afficher le résultat de l'import avec les erreurs détaillées
      const importedCount = data.imported || 0;
      const updatedCount = data.updated || 0;
      const errorCount = data.errors?.length || 0;

      if (errorCount > 0) {
        toast.warning(
          <div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
              Import terminé avec {errorCount} erreur(s)
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
              • {importedCount} produit(s) créé(s)
              <br />
              • {updatedCount} produit(s) mis à jour
            </div>
            <details style={{ fontSize: '0.8rem', marginTop: '8px' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--accent-deep)', fontWeight: 600 }}>
                Voir les erreurs ({errorCount})
              </summary>
              <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '6px' }}>
                {data.errors.slice(0, 10).map((error, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', fontSize: '0.75rem' }}>
                    • {error}
                  </div>
                ))}
                {data.errors.length > 10 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                    ... et {data.errors.length - 10} autres erreurs
                  </div>
                )}
              </div>
            </details>
          </div>,
          {
            position: 'top-right',
            autoClose: 10000,
          }
        );
      } else {
        toast.success(
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Import réussi !</div>
            <div style={{ fontSize: '0.85rem' }}>
              • {importedCount} produit(s) créé(s)
              <br />
              • {updatedCount} produit(s) mis à jour
            </div>
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
      }
    } catch (err) {
      console.error('Import CSV error:', err);
      toast.dismiss('import-progress');
      toast.error('Erreur lors de l\'import CSV: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 6000,
      });
    } finally {
      e.target.value = '';
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteId) return;
    try {
      await productService.remove(deleteId);
      invalidateProducts();
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      toast.success('Produit supprimé avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de la suppression du produit: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };


  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newProduct.name || !newProduct.sku || !newProduct.price || !newProduct.category_id) {
      setFormError('Merci de remplir au minimum le nom, le SKU, le prix et la catégorie.');
      return;
    }

    try {
      setIsSubmitting(true);
      let created = await productService.create(newProduct);

      if (selectedFiles.length > 0) {
        let uploaded = await productImageService.uploadFiles(created.id, selectedFiles, { is_main: true });
        if (!Array.isArray(uploaded)) {
          uploaded = [uploaded];
        }
        created = { ...created, images: uploaded };
      }

      invalidateProducts();
      setProducts((prev) => [created, ...prev]);
      setIsModalOpen(false);
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);
      setSelectedFiles([]);
      if (createImageFileInputRef.current) {
        createImageFileInputRef.current.value = '';
      }
    } catch (err) {
      const apiError = err?.message || err?.error || err?.errors;
      if (typeof apiError === 'string') {
        setFormError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        const firstKey = Object.keys(apiError)[0];
        const firstMsg = Array.isArray(apiError[firstKey]) ? apiError[firstKey][0] : apiError[firstKey];
        setFormError(firstMsg || "Erreur lors de la création du produit");
      } else {
        setFormError("Erreur lors de la création du produit");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    setEditFormError(null);
    setEditImageError(null);

    if (!editProduct.name || !editProduct.sku || !editProduct.price || !editProduct.category_id) {
      setEditFormError('Merci de remplir au minimum le nom, le SKU, le prix et la catégorie.');
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedProduct = await productService.update(editProduct.id, editProduct);

      // Handle image uploads for the edit modal
      const files = editImageFileInputRef.current?.files;
      let uploadedImages = [];
      if (files && files.length > 0) {
        uploadedImages = await productImageService.uploadFiles(editProduct.id, Array.from(files), {
          is_main: editImageIsMain,
        });
        if (!Array.isArray(uploadedImages)) {
          uploadedImages = [uploadedImages];
        }
      } else if (editImageUrl) {
        const created = await productImageService.create({
          product_id: editProduct.id,
          image_url: editImageUrl,
          is_main: editImageIsMain,
        });
        uploadedImages = [created];
      }

      // Update product images in state
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === updatedProduct.id) {
            let currentImages = Array.isArray(p.images) ? p.images : [];
            let newImages = [...currentImages];

            uploadedImages.forEach((img) => {
              if (img.is_main) {
                newImages = newImages.map((existing) => ({ ...existing, is_main: false }));
              }
              newImages.push(img);
            });

            return { ...updatedProduct, images: newImages };
          }
          return p;
        })
      );

      invalidateProducts();
      setEditProduct(null);
      setEditImageUrl('');
      if (editImageFileInputRef.current) {
        editImageFileInputRef.current.value = '';
      }
      setEditImageIsMain(false);

      toast.success('Produit mis à jour avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      const apiError = err?.message || err?.error || err?.errors;
      if (typeof apiError === 'string') {
        setEditFormError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        const firstKey = Object.keys(apiError)[0];
        const firstMsg = Array.isArray(apiError[firstKey]) ? apiError[firstKey][0] : apiError[firstKey];
        setEditFormError(firstMsg || "Erreur lors de la mise à jour du produit");
      } else {
        setEditFormError("Erreur lors de la mise à jour du produit");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = async (productId, imageId) => {
    try {
      await productImageService.remove(imageId);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, images: p.images.filter((img) => img.id !== imageId) }
            : p
        )
      );
      setEditProduct((prev) =>
        prev ? { ...prev, images: prev.images.filter((img) => img.id !== imageId) } : null
      );
      toast.success('Image supprimée avec succès', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error('Erreur lors de la suppression de l\'image: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleSetMainImage = async (productId, imageId) => {
    try {
      await productImageService.setMain(productId, imageId);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              images: p.images.map((img) => ({
                ...img,
                is_main: img.id === imageId,
              })),
            };
          }
          return p;
        })
      );
      setEditProduct((prev) =>
        prev
          ? {
            ...prev,
            images: prev.images.map((img) => ({
              ...img,
              is_main: img.id === imageId,
            })),
          }
          : null
      );
      toast.success('Image principale définie avec succès', {
        position: 'top-right',
        autoClose: 2000,
      });
    } catch (err) {
      toast.error('Erreur lors de la définition de l\'image principale: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  const handleViewProduct = async (id) => {
    try {
      const fullProduct = await productService.get(id);
      setViewProduct(fullProduct);
    } catch (err) {
      toast.error("Erreur lors de la récupération des détails");
    }
  };

  const handleEditProduct = async (id) => {
    try {
      setEditFormError(null);
      const fullProduct = await productService.get(id);
      setEditProduct({
        ...fullProduct,
        stock_quantity: fullProduct.stock_quantity ?? 0,
        low_stock_threshold: fullProduct.low_stock_threshold ?? 10,
      });
    } catch (err) {
      toast.error("Erreur lors du chargement du produit pour modification");
      console.error(err);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p
            style={{
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--text-light)',
              marginBottom: '6px',
            }}
          >
            Catalogue
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Produits skincare</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gérez les fiches produits, catégories, stocks et imports CSV.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-export-pro"
          >
            <Download size={18} />
            Export CSV
          </button>
          <label className="btn-import-pro">
            <Upload size={18} />
            Import CSV
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </label>
          <button
            type="button"
            className="btn-new-pro"
            onClick={handleOpenModal}
          >
            + Nouveau produit
          </button>
        </div>
      </header>

      <div
        style={{
          borderRadius: '18px',
          border: '1px solid var(--divider)',
          background: 'var(--white)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '420px' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <input
                type="search"
                placeholder="Rechercher par nom, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  border: '1px solid var(--divider)',
                  padding: '12px 16px 12px 42px',
                  fontSize: '0.9rem',
                  background: 'var(--white)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--divider)'}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Filtre Catégorie */}
              <div style={{ position: 'relative' }}>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    padding: '10px 36px 10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--divider)',
                    fontSize: '0.85rem',
                    background: 'var(--white)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              {/* Filtre Statut */}
              <div style={{ position: 'relative' }}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '10px 36px 10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--divider)',
                    fontSize: '0.85rem',
                    background: 'var(--white)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Désactivé</option>
                </select>
                <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              {/* Tri Stock */}
              <div style={{ position: 'relative' }}>
                <select
                  value={sortStock}
                  onChange={(e) => setSortStock(e.target.value)}
                  style={{
                    padding: '10px 36px 10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--divider)',
                    fontSize: '0.85rem',
                    background: 'var(--white)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="">Trier par défaut</option>
                  <option value="asc">Stock (↗ Croissant)</option>
                  <option value="desc">Stock (↘ Décroissant)</option>
                </select>
                <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-light)', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', justifyContent: 'flex-end', fontWeight: 500 }}>
            {loading ? '...' : `${paginatedProducts.length} résultat(s) affiché(s) sur ${totalResults}`}
          </div>
        </div>

        {error && (
          <div style={{ padding: '8px 16px', color: '#b91c1c', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <AdminLoader message="Synchronisation de votre catalogue produits skincare..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    <th style={{ width: 56, padding: '10px 16px' }}></th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Produit</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Catégorie</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Prix</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Stock</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Statut</th>
                    <th style={{ width: 150 }} />
                  </tr>
                </thead>
                <tbody>
                  {!loading && paginatedProducts.map((p) => {
                    const stock = p.stock_quantity ?? 0;
                    const categoryName = p.category?.name || '—';
                    const isActive = p.is_active;

                    let stockBadgeBg;
                    let stockBadgeColor;
                    let stockLabel;

                    if (stock === 0) {
                      stockBadgeBg = 'rgba(248, 113, 113, 0.12)';
                      stockBadgeColor = '#b91c1c';
                      stockLabel = 'Rupture';
                    } else if (stock < 10) {
                      stockBadgeBg = 'rgba(251, 191, 36, 0.12)';
                      stockBadgeColor = '#92400e';
                      stockLabel = `${stock} en stock (bas)`;
                    } else {
                      stockBadgeBg = 'rgba(34, 197, 94, 0.08)';
                      stockBadgeColor = '#166534';
                      stockLabel = `${stock} en stock`;
                    }

                    const statusLabel = isActive ? 'Actif' : 'Désactivé';

                    const mainImage = Array.isArray(p.images) && p.images.length > 0
                      ? (p.images.find(img => img.is_main)?.image_url || p.images[0].image_url)
                      : null;

                    return (
                      <tr key={p.id}>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              backgroundColor: 'var(--surface)',
                              backgroundImage: mainImage ? `url(${mainImage})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--text-light)',
                              fontSize: '0.7rem'
                            }}
                          >
                            {!mainImage && 'No img'}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                          <div style={{ fontWeight: 500 }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            ID : {p.id} · SKU : {p.sku || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{categoryName}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', fontWeight: 600 }}>
                          {Number(p.price).toFixed(2)} €
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              padding: '2px 10px',
                              borderRadius: '999px',
                              background: stockBadgeBg,
                              color: stockBadgeColor,
                              fontWeight: 600,
                            }}
                          >
                            {stockLabel}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{statusLabel}</td>
                        <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              title="Analyser le produit (Détails)"
                              type="button"
                              onClick={() => handleViewProduct(p.id)}
                              style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              title="Modifier"
                              type="button"
                              onClick={() => handleEditProduct(p.id)}
                              style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              title="Supprimer"
                              type="button"
                              onClick={() => setDeleteId(p.id)}
                              style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--divider)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Affiche {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalResults)} sur {totalResults}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--divider)', background: currentPage === 1 ? 'var(--surface)' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--divider)', background: currentPage === totalPages ? 'var(--surface)' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal création produit — centré, design pro (grandes marques) */}
      {isModalOpen && createPortal(
        <div
          className="admin-add-product-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            minHeight: '100vh',
            background: 'rgba(26, 26, 30, 0.32)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            zIndex: 90,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              maxHeight: 'min(88vh, 900px)',
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              boxShadow: '0 32px 64px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <header style={{ flexShrink: 0, padding: '24px 28px 20px', borderBottom: '1px solid #EBE8E4', background: '#FFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C8782', marginBottom: 6, fontWeight: 600 }}>
                    Nouveau produit
                  </p>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1C1C1E', letterSpacing: '-0.02em', margin: 0 }}>
                    Ajouter un produit
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className="admin-modal-close-btn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid #E5E2DE',
                    background: '#FFF',
                    color: '#6B6560',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </header>

            <form onSubmit={handleCreateProduct} className="admin-product-form" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '28px 28px 32px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Nom du produit</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Sérum Hydratant Intense"
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, sku: e.target.value }))}
                    placeholder="Ex: SER-HYD-50"
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Statut</label>
                  <select
                    value={newProduct.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, is_active: e.target.value === 'active' }))}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, background: '#FAFAF9', color: '#1C1C1E' }}
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Désactivé</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Catégorie</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category_id: e.target.value }))}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, background: '#FAFAF9', color: '#1C1C1E' }}
                  required
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Description (optionnelle)</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez les bienfaits de ce soin..."
                  rows={4}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Type de peau</label>
                  <select
                    value={newProduct.skin_type}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, skin_type: e.target.value }))}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, background: '#FAFAF9', color: '#1C1C1E' }}
                  >
                    <option value="">Sélectionner</option>
                    <option value="sèche">Sèche</option>
                    <option value="grasse">Grasse</option>
                    <option value="mixte">Mixte</option>
                    <option value="sensible">Sensible</option>
                    <option value="normale">Normale</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Moment d'application</label>
                  <select
                    value={newProduct.application_time}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, application_time: e.target.value }))}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, background: '#FAFAF9', color: '#1C1C1E' }}
                  >
                    <option value="">Sélectionner</option>
                    <option value="matin">Matin</option>
                    <option value="soir">Soir</option>
                    <option value="jour/nuit">Jour/Nuit</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Ingrédients actifs</label>
                <textarea
                  value={newProduct.active_ingredients}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, active_ingredients: e.target.value }))}
                  placeholder="Acide hyaluronique, Vitamine C..."
                  rows={2}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Liste INCI</label>
                <textarea
                  value={newProduct.inci_list}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, inci_list: e.target.value }))}
                  placeholder="Nomenclature internationale des ingrédients..."
                  rows={3}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 8 }}>Mode d'emploi</label>
                <textarea
                  value={newProduct.usage_instructions}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, usage_instructions: e.target.value }))}
                  placeholder="Application, fréquence..."
                  rows={3}
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #E5E2DE', padding: '12px 14px', fontSize: 15, color: '#1C1C1E', background: '#FAFAF9', resize: 'vertical' }}
                />
              </div>

              <div style={{ padding: 20, borderRadius: 12, border: '1px dashed #D8D4CF', background: '#FAFAF9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B6560' }}>
                    Images du produit
                  </label>
                  <span style={{ fontSize: 12, color: selectedFiles.length >= 8 ? '#B91C1C' : '#8C8782', fontWeight: 500 }}>
                    {selectedFiles.length}/8
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#8C8782', margin: '0 0 14px 0' }}>
                  Jusqu'à 8 images. La première = image principale.
                </p>
                <label
                  htmlFor="create-image-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1px solid #E5E2DE',
                    background: '#FFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: selectedFiles.length >= 8 ? 'not-allowed' : 'pointer',
                    opacity: selectedFiles.length >= 8 ? 0.5 : 1,
                    color: '#1C1C1E',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <ImageIcon size={16} strokeWidth={1.8} />
                  Ajouter des images
                </label>
                <input id="create-image-upload" ref={createImageFileInputRef} type="file" accept="image/*" onChange={handleFileLocalPreview} multiple disabled={selectedFiles.length >= 8} style={{ display: 'none' }} />

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                    {imagePreviews.map((url, index) => (
                      <div key={index} style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', border: index === 0 ? '2px solid #A8874A' : '1px solid #E5E2DE', flexShrink: 0 }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        {index === 0 && (
                          <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(168,135,74,0.9)', color: '#FFF', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center', padding: '3px 4px' }}>PRINCIPALE</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedImage(index)}
                          style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 6, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          title="Retirer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <div style={{ fontSize: 13, color: '#B91C1C', padding: '10px 14px', background: '#FEF2F2', borderRadius: 10 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  style={{
                    padding: '12px 22px',
                    borderRadius: 10,
                    border: '1px solid #E5E2DE',
                    background: '#FFF',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#1C1C1E',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#1C1C1E',
                    color: '#FFF',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'opacity 0.2s, background 0.2s',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                      Publication...
                    </>
                  ) : 'Publier le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Product Modal */}
      <AdminModal
        isOpen={!!viewProduct}
        onClose={() => setViewProduct(null)}
        title="Détails du produit"
        subtitle={`SKU: ${viewProduct?.sku || 'N/A'}`}
        icon={Package}
      >
        {viewProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  backgroundColor: 'var(--surface)',
                  backgroundImage: viewProduct.images && viewProduct.images.length > 0
                    ? `url(${viewProduct.images.find(img => img.is_main)?.image_url || viewProduct.images[0].image_url})`
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid var(--divider)',
                }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 4px 0' }}>{viewProduct.name}</h4>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '0 0 8px 0' }}>{viewProduct.category?.name || 'Sans catégorie'}</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-deep)' }}>{Number(viewProduct.price).toFixed(2)} €</span>
                  <span style={{ color: viewProduct.stock_quantity > 0 ? '#166534' : '#b91c1c', fontSize: '0.85rem', fontWeight: 500 }}>
                    {viewProduct.stock_quantity > 0 ? `${viewProduct.stock_quantity} en stock` : 'Rupture de stock'}
                  </span>
                </div>
              </div>
            </div>

            {(viewProduct.description || viewProduct.ingredients) && (
              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--divider)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6 }}>Description</p>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{viewProduct.description || 'Aucune description disponible.'}</p>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Avis clients récents</h4>
              {viewProduct.reviews && viewProduct.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {viewProduct.reviews.slice(0, 3).map(review => (
                    <div key={review.id} style={{ padding: '12px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--divider)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{review.user?.first_name} {review.user?.last_name?.[0]}.</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < review.rating ? "#C5A059" : "none"} color={i < review.rating ? "#C5A059" : "#D4C9BF"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0 }}>{review.comment}</p>
                    </div>
                  ))}
                  {viewProduct.reviews.length > 3 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-deep)', textAlign: 'center', margin: 0 }}>+ {viewProduct.reviews.length - 3} autres avis</p>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center' }}>Aucun avis pour ce produit.</p>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* Edit Product Modal */}
      <AdminModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Modifier le produit"
        subtitle="Mise à jour des informations"
        icon={Edit}
      >
        {editProduct && (
          <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Nom du produit</label>
              <input
                type="text"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Stock</label>
                <input
                  type="number"
                  min="0"
                  value={editProduct.stock_quantity}
                  onChange={(e) => setEditProduct({ ...editProduct, stock_quantity: e.target.value })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Seuil Alerte Stock</label>
                <input
                  type="number"
                  min="0"
                  value={editProduct.low_stock_threshold}
                  onChange={(e) => setEditProduct({ ...editProduct, low_stock_threshold: e.target.value })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Catégorie</label>
              <select
                value={editProduct.category_id || ''}
                onChange={(e) => setEditProduct({ ...editProduct, category_id: e.target.value })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
              >
                <option value="">Sélectionner...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Statut</label>
              <select
                value={editProduct.is_active ? 'active' : 'inactive'}
                onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.value === 'active' })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
              >
                <option value="active">Actif</option>
                <option value="inactive">Désactivé</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Description</label>
              <textarea
                value={editProduct.description || ''}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                rows={3}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Type de peau</label>
                <select
                  value={editProduct.skin_type || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, skin_type: e.target.value || null })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="sèche">Sèche</option>
                  <option value="grasse">Grasse</option>
                  <option value="mixte">Mixte</option>
                  <option value="sensible">Sensible</option>
                  <option value="normale">Normale</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Moment d'application</label>
                <select
                  value={editProduct.application_time || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, application_time: e.target.value || null })}
                  style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                >
                  <option value="">Sélectionner...</option>
                  <option value="matin">Matin</option>
                  <option value="soir">Soir</option>
                  <option value="jour/nuit">Jour/Nuit</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Ingrédients actifs principaux</label>
              <textarea
                value={editProduct.active_ingredients || ''}
                onChange={(e) => setEditProduct({ ...editProduct, active_ingredients: e.target.value })}
                rows={2}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Liste INCI complète</label>
              <textarea
                value={editProduct.inci_list || ''}
                onChange={(e) => setEditProduct({ ...editProduct, inci_list: e.target.value })}
                rows={3}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)', resize: 'vertical' }}
              />
            </div>

            {/* Section Gestion des Images */}
            <div style={{ borderTop: '1px solid var(--divider)', paddingTop: 16 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: 12 }}>
                Gestion des Images
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 16 }}>
                {editProduct.images && editProduct.images.map((img) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--divider)', aspectRatio: '1/1' }}>
                    <img
                      src={img.image_url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {img.is_main && (
                      <div style={{ position: 'absolute', top: 4, left: 4, background: '#166534', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>
                        Principale
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(editProduct.id, img.id)}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', padding: 4, borderRadius: 6, cursor: 'pointer', display: 'flex' }}
                    >
                      <Trash2 size={12} />
                    </button>
                    {!img.is_main && (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(editProduct.id, img.id)}
                        style={{ position: 'absolute', bottom: 4, left: 4, right: 4, background: 'rgba(255, 255, 255, 0.9)', color: 'var(--text-main)', border: '1px solid var(--divider)', fontSize: '9px', padding: '2px', borderRadius: 4, cursor: 'pointer' }}
                      >
                        Principale
                      </button>
                    )}
                  </div>
                ))}

                {(!editProduct.images || editProduct.images.length === 0) && (
                  <div style={{ gridColumn: 'span 12', padding: '20px', border: '1px dashed var(--divider)', borderRadius: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Aucune image enregistrée
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 8, display: 'block' }}>Ajouter de nouvelles images</label>
                <div style={{ border: '1px dashed var(--divider)', borderRadius: 12, padding: '16px', textAlign: 'center', background: 'var(--surface)' }}>
                  <input
                    ref={editImageFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    id="edit-product-images"
                  />
                  <label htmlFor="edit-product-images" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <Upload size={24} color="var(--accent-deep)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Parcourir les fichiers</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Glissez-déposez vos images ici</span>
                  </label>
                </div>
              </div>
            </div>

            {editFormError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 8 }}>{editFormError}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                style={{ padding: '10px 18px', borderRadius: 999, border: '1px solid var(--divider)', background: 'white', cursor: 'pointer', fontWeight: 500 }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: 'var(--accent-deep)', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Product Modal */}
      <AdminModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer ce produit ?"
        subtitle="Cette action est irréversible."
        icon={AlertTriangle}
        color="#ef4444"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer définitivement ce produit ? Cela le retirera du catalogue pour les clients.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            onClick={() => setDeleteId(null)}
            style={{ padding: '10px 18px', borderRadius: 999, border: '1px solid var(--divider)', background: 'white', cursor: 'pointer', fontWeight: 500 }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={confirmDeleteProduct}
            style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            Oui, supprimer
          </button>
        </div>
      </AdminModal>
    </div >
  );
};

export default Products;


