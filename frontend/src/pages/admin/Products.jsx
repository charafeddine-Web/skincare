import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { categoryService, productImageService, productService } from '../../services/api';
import { Eye, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, AlertTriangle, Package } from 'lucide-react';
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
  });

  const [imageModalProduct, setImageModalProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageIsMain, setImageIsMain] = useState(true);
  const [imageSubmitting, setImageSubmitting] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const imageFileInputRef = useRef(null);
  const createImageFileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData] = await Promise.all([
          productService.list(),
          categoryService.list(),
        ]);

        if (!isMounted) return;

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        if (isMounted) {
          const message = err?.message || err?.error || "Impossible de charger les produits";
          setError(typeof message === 'string' ? message : "Impossible de charger les produits");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const categoryName = (p.category?.name || '').toLowerCase();
        return name.includes(term) || sku.includes(term) || categoryName.includes(term);
      });
    }

    if (filterCategory) {
      result = result.filter((p) => Number(p.category_id) === Number(filterCategory) || Number(p.category?.id) === Number(filterCategory));
    }

    if (filterStatus === 'active') {
      result = result.filter((p) => p.is_active);
    } else if (filterStatus === 'inactive') {
      result = result.filter((p) => !p.is_active);
    }

    if (sortStock === 'asc') {
      result = [...result].sort((a, b) => (Number(a.stock_quantity) || 0) - (Number(b.stock_quantity) || 0));
    } else if (sortStock === 'desc') {
      result = [...result].sort((a, b) => (Number(b.stock_quantity) || 0) - (Number(a.stock_quantity) || 0));
    }

    return result;
  }, [products, search, filterCategory, filterStatus, sortStock]);

  // Réinitialiser la page si les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory, filterStatus, sortStock]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleOpenModal = () => {
    setFormError(null);
    setImagePreviews([]);
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
    });
    setIsModalOpen(true);
  };

  const handleFileLocalPreview = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setFormError('Vous pouvez sélectionner au maximum 5 images.');
      setImagePreviews([]);
      return;
    }
    setFormError(null);
    // Cleanup old object URLs
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
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

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      setIsUpdating(true);
      const updated = await productService.update(editProduct.id, {
        name: editProduct.name,
        price: editProduct.price,
        stock_quantity: editProduct.stock_quantity,
        is_active: editProduct.is_active,
        category_id: editProduct.category_id,
        description: editProduct.description,
        active_ingredients: editProduct.active_ingredients || '',
        inci_list: editProduct.inci_list || '',
        usage_instructions: editProduct.usage_instructions || '',
        skin_type: editProduct.skin_type || null,
        application_time: editProduct.application_time || null,
      });
      setProducts((prev) => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      setEditProduct(null);
      toast.success('Produit mis à jour avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour: ' + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 4000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newProduct.name || !newProduct.sku || !newProduct.price || !newProduct.category_id) {
      setFormError('Merci de remplir au minimum le nom, le SKU, le prix et la catégorie.');
      return;
    }

    const files = createImageFileInputRef.current?.files;
    if (files && files.length > 5) {
      setFormError(`Vous pouvez téléverser au maximum 5 images (vous en avez sélectionné ${files.length}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      let created = await productService.create(newProduct);

      // Upload d'images vers Cloudinary si des fichiers ont été choisis
      if (files && files.length > 0) {
        const limitedFiles = Array.from(files).slice(0, 5);
        let uploaded = await productImageService.uploadFiles(created.id, limitedFiles, { is_main: true });
        if (!Array.isArray(uploaded)) {
          uploaded = [uploaded];
        }
        created = { ...created, images: uploaded };
      }

      setProducts((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setImagePreviews((prevUrls) => {
        prevUrls.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
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

  const openImagesModal = (product) => {
    setImageError(null);
    setImageUrl('');
    setImageIsMain(true);
    setImageModalProduct(product);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!imageModalProduct) return;

    const files = imageFileInputRef.current?.files;

    if ((!files || files.length === 0) && !imageUrl) {
      setImageError("Choisissez au moins un fichier ou renseignez une URL d'image.");
      return;
    }

    try {
      setImageSubmitting(true);
      setImageError(null);

      let createdImages = [];

      // Priorité à l'upload de fichiers vers Cloudinary
      if (files && files.length > 0) {
        createdImages = await productImageService.uploadFiles(imageModalProduct.id, files, {
          is_main: imageIsMain,
        });
      } else if (imageUrl) {
        const created = await productImageService.create({
          product_id: imageModalProduct.id,
          image_url: imageUrl,
          is_main: imageIsMain,
        });
        createdImages = [created];
      }

      if (!Array.isArray(createdImages)) {
        createdImages = [createdImages];
      }

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== imageModalProduct.id) return p;
          let currentImages = Array.isArray(p.images) ? p.images : [];

          createdImages.forEach((img) => {
            if (img.is_main) {
              currentImages = currentImages.map((existing) => ({ ...existing, is_main: false }));
            }
            currentImages = [...currentImages, img];
          });

          return {
            ...p,
            images: currentImages,
          };
        }),
      );

      setImageUrl('');
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
      setImageIsMain(false);
    } catch (err) {
      const apiError = err?.message || err?.error || err?.errors;
      if (typeof apiError === 'string') {
        setImageError(apiError);
      } else {
        setImageError("Erreur lors de l'ajout de l'image");
      }
    } finally {
      setImageSubmitting(false);
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', maxWidth: 320 }}>
            Les données sont chargées depuis l&apos;API Laravel (`/api/products`). Vous devez être connecté en admin
            pour créer ou modifier des produits.
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              background: 'white',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
          <label
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              border: '1px solid var(--divider)',
              background: 'white',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
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
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--accent-deep)',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: 0.95,
              boxShadow: 'var(--shadow-sm)',
            }}
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
            {loading ? '...' : `${paginatedProducts.length} résultat(s) affiché(s) sur ${filteredProducts.length}`}
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
                              title="Images du produit"
                              type="button"
                              onClick={() => openImagesModal(p)}
                              style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                            >
                              <ImageIcon size={16} />
                            </button>
                            <button
                              title="Analyser le produit (Détails)"
                              type="button"
                              onClick={() => setViewProduct(p)}
                              style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              title="Modifier"
                              type="button"
                              onClick={() => setEditProduct(p)}
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
                  Affiche {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length}
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

      {/* Modal création produit */}
      {isModalOpen && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 650,
              borderRadius: 24,
              background: 'var(--white)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--divider)',
              padding: '24px 28px',
              margin: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 4 }}>
                  Nouveau produit
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Ajouter un produit skincare</h3>
              </div>
              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.9rem',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Nom du produit</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Sérum Hydratant Intense"
                    style={{
                      width: '100%',
                      marginTop: 6,
                      borderRadius: 12,
                      border: '1px solid var(--divider)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      background: 'var(--surface)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, sku: e.target.value }))}
                    placeholder="Ex: SER-HYD-50"
                    style={{
                      width: '100%',
                      marginTop: 6,
                      borderRadius: 12,
                      border: '1px solid var(--divider)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      background: 'var(--surface)'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      borderRadius: 999,
                      border: '1px solid var(--divider)',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      borderRadius: 999,
                      border: '1px solid var(--divider)',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Statut</label>
                  <select
                    value={newProduct.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, is_active: e.target.value === 'active' }))}
                    style={{
                      width: '100%',
                      marginTop: 4,
                      borderRadius: 999,
                      border: '1px solid var(--divider)',
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      background: 'white',
                    }}
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Désactivé</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Catégorie</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category_id: e.target.value }))}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    borderRadius: 999,
                    border: '1px solid var(--divider)',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    background: 'white',
                  }}
                  required
                >
                  <option value="">Choisir une catégorie…</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Description (optionnelle)</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez les bienfaits de ce soin..."
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: 4,
                    borderRadius: 16,
                    border: '1px solid var(--divider)',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* New Product Detail Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Type de peau</label>
                  <select
                    value={newProduct.skin_type}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, skin_type: e.target.value }))}
                    style={{
                      width: '100%',
                      marginTop: 6,
                      borderRadius: 12,
                      border: '1px solid var(--divider)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      background: 'var(--surface)'
                    }}
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Moment d'application</label>
                  <select
                    value={newProduct.application_time}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, application_time: e.target.value }))}
                    style={{
                      width: '100%',
                      marginTop: 6,
                      borderRadius: 12,
                      border: '1px solid var(--divider)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      background: 'var(--surface)'
                    }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="matin">Matin</option>
                    <option value="soir">Soir</option>
                    <option value="jour/nuit">Jour/Nuit</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Ingrédients actifs principaux</label>
                <textarea
                  value={newProduct.active_ingredients}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, active_ingredients: e.target.value }))}
                  placeholder="Ex: Acide hyaluronique, Vitamine C, Niacinamide..."
                  rows={2}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    borderRadius: 12,
                    border: '1px solid var(--divider)',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Liste INCI complète</label>
                <textarea
                  value={newProduct.inci_list}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, inci_list: e.target.value }))}
                  placeholder="Liste INCI complète des ingrédients (nomenclature internationale)..."
                  rows={3}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    borderRadius: 12,
                    border: '1px solid var(--divider)',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Mode d'emploi et fréquence</label>
                <textarea
                  value={newProduct.usage_instructions}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, usage_instructions: e.target.value }))}
                  placeholder="Ex: Appliquer matin et soir sur peau propre. Masser délicatement jusqu'à pénétration complète..."
                  rows={3}
                  style={{
                    width: '100%',
                    marginTop: 6,
                    borderRadius: 12,
                    border: '1px solid var(--divider)',
                    padding: '10px 14px',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: 16, border: '1px dashed var(--divider)' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>Images du produit</label>
                <input
                  ref={createImageFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileLocalPreview}
                  multiple
                  style={{
                    width: '100%',
                    marginTop: 8,
                    fontSize: '0.85rem',
                    padding: '8px 0'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>
                  Recommandé : jusqu'à 5 images de haute qualité (fond blanc ou lifestyle). La première sera l'image principale.
                </div>
                {/* Images Preview section */}
                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {imagePreviews.map((url, index) => (
                      <div key={index} style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        backgroundImage: `url(${url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid var(--divider)',
                        position: 'relative'
                      }}>
                        {index === 0 && (
                          <div style={{
                            position: 'absolute',
                            bottom: -6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'white',
                            color: 'var(--accent)',
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>Principal</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formError && (
                <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: 4 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1px solid var(--divider)',
                    background: 'white',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'var(--accent-deep)',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'Publication...' : 'Publier le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal gestion des images produit */}
      {imageModalProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 40,
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 600,
              borderRadius: 20,
              background: 'var(--white)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--divider)',
              padding: '20px 22px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 4 }}>
                  Images produit
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{imageModalProduct.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  Ajoutez des URLs d&apos;images hébergées (CDN, Cloudinary, etc.).
                </p>
              </div>
                  <button
                    type="button"
                onClick={() => !imageSubmitting && setImageModalProduct(null)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                  fontSize: '0.9rem',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16 }}>
              <div style={{ maxHeight: 260, overflow: 'auto', paddingRight: 6 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 6 }}>Images existantes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Array.isArray(imageModalProduct.images) && imageModalProduct.images.length > 0 ? (
                    imageModalProduct.images.map((img) => (
                      <div
                        key={img.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 12,
                          border: '1px solid var(--divider)',
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            backgroundImage: `url(${img.image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: 'var(--surface)',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {img.image_url}
                          </div>
                          {img.is_main && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: 'rgba(34, 197, 94, 0.12)',
                                color: '#166534',
                                fontWeight: 600,
                              }}
                            >
                              Principale
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Aucune image pour le moment.</div>
                  )}
                </div>
              </div>

              <form onSubmit={handleAddImage} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      Upload d&apos;images (Cloudinary)
                    </label>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{
                        width: '100%',
                        marginTop: 4,
                        fontSize: '0.8rem',
                      }}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 2 }}>
                      Vous pouvez sélectionner une ou plusieurs images. Elles seront stockées sur Cloudinary.
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Ou URL directe (optionnel)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      style={{
                        width: '100%',
                        marginTop: 4,
                        borderRadius: 999,
                        border: '1px solid var(--divider)',
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  <input
                    type="checkbox"
                    checked={imageIsMain}
                    onChange={(e) => setImageIsMain(e.target.checked)}
                  />
                  Définir comme image principale
                </label>

                {imageError && (
                  <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                    {imageError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => !imageSubmitting && setImageModalProduct(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 999,
                      border: '1px solid var(--divider)',
                      background: 'white',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    disabled={imageSubmitting}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      border: 'none',
                      background: 'var(--accent-deep)',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: imageSubmitting ? 0.6 : 1,
                    }}
                  >
                    {imageSubmitting ? 'Ajout…' : 'Ajouter l&apos;image'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Mode d'emploi et fréquence</label>
              <textarea
                value={editProduct.usage_instructions || ''}
                onChange={(e) => setEditProduct({ ...editProduct, usage_instructions: e.target.value })}
                rows={3}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)', resize: 'vertical' }}
              />
            </div>
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
                disabled={isUpdating}
                style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: 'var(--accent-deep)', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: isUpdating ? 0.7 : 1 }}
              >
                {isUpdating ? 'Sauvegarde...' : 'Enregistrer'}
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
    </div>
  );
};

export default Products;


