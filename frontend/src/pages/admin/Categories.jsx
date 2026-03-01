import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { categoryService } from '../../services/api';
import { Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import AdminLoader from '../../components/AdminLoader';
import AdminModal from '../../components/AdminModal';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    parent_id: '',
  });

  // Action states
  const [editCategory, setEditCategory] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await categoryService.list();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          const message = err?.message || err?.error || "Impossible de charger les catégories";
          setError(typeof message === 'string' ? message : "Impossible de charger les catégories");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const slug = (c.slug || '').toLowerCase();
      return name.includes(term) || slug.includes(term);
    });
  }, [categories, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(start, start + itemsPerPage);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const confirmDeleteCategory = async () => {
    if (!deleteId) return;
    try {
      await categoryService.remove(deleteId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      toast.success('Catégorie supprimée avec succès', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Erreur lors de la suppression. Assurez-vous qu'aucun produit n'y est rattaché: " + (err.message || 'Erreur inconnue'), {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategory) return;
    try {
      setIsUpdating(true);
      const updated = await categoryService.update(editCategory.id, {
        name: editCategory.name,
        slug: editCategory.slug,
        parent_id: editCategory.parent_id || null,
      });
      setCategories((prev) => prev.map(c => c.id === updated.id ? updated : c));
      setEditCategory(null);
      toast.success('Catégorie mise à jour avec succès', {
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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newCategory.name) {
      setFormError('Le nom de la catégorie est requis.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await categoryService.create(newCategory);
      setCategories((prev) => [created, ...prev]);
      setNewCategory({ name: '', slug: '', parent_id: '' });
    } catch (err) {
      const apiError = err?.message || err?.error || err?.errors;
      if (typeof apiError === 'string') {
        setFormError(apiError);
      } else if (apiError && typeof apiError === 'object') {
        const firstKey = Object.keys(apiError)[0];
        const firstMsg = Array.isArray(apiError[firstKey]) ? apiError[firstKey][0] : apiError[firstKey];
        setFormError(firstMsg || "Erreur lors de la création de la catégorie");
      } else {
        setFormError("Erreur lors de la création de la catégorie");
      }
    } finally {
      setIsSubmitting(false);
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
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Catégories</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Organisez vos gammes : sérums, nettoyants, hydratants, SPF, etc.
          </p>
        </div>
      </header>

      <div
        style={{
          borderRadius: '18px',
          border: '1px solid var(--divider)',
          background: 'var(--white)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="search"
              placeholder="Rechercher une catégorie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                borderRadius: '999px',
                border: '1px solid var(--divider)',
                padding: '8px 14px',
                fontSize: '0.85rem',
                minWidth: '220px',
                flex: 1,
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {loading ? '...' : `${filteredCategories.length} catégories`}
            </span>
          </div>

          <form
            onSubmit={handleCreateCategory}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 6 }}
          >
            <input
              type="text"
              placeholder="Nouvelle catégorie (ex: Sérums, SPF…)"
              value={newCategory.name}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
              style={{
                borderRadius: '999px',
                border: '1px solid var(--divider)',
                padding: '8px 14px',
                fontSize: '0.85rem',
                flex: 1,
                minWidth: '200px',
              }}
              required
            />
            <input
              type="text"
              placeholder="Slug (optionnel)"
              value={newCategory.slug}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, slug: e.target.value }))}
              style={{
                borderRadius: '999px',
                border: '1px solid var(--divider)',
                padding: '8px 14px',
                fontSize: '0.85rem',
                minWidth: '180px',
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 18px',
                borderRadius: 999,
                border: 'none',
                background: 'var(--accent-deep)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Ajout…' : 'Ajouter'}
            </button>
          </form>

          {formError && (
            <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
              {formError}
            </div>
          )}

          {error && (
            <div style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
              {error}
            </div>
          )}
        </div>

        {loading ? (
          <AdminLoader message="Chargement de vos catégories de produits..." />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ minWidth: '700px', width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Nom</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Parent</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Slug</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'var(--text-light)' }}>Produits</th>
                    <th style={{ width: 100 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && paginatedCategories.map((c) => (
                    <tr key={c.id}>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                        <div style={{ fontWeight: 500, paddingLeft: c.parent_id ? '20px' : '0' }}>
                          {c.parent_id && <span style={{ color: 'var(--text-light)', marginRight: '6px' }}>└</span>}
                          {c.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>ID : {c.id}</div>
                      </td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                        {c.parent?.name || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>{c.slug}</td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
                        {c.products_count ?? 0}
                      </td>
                      <td style={{ padding: '10px 16px', borderTop: '1px solid var(--divider)', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            title="Modifier"
                            type="button"
                            onClick={() => setEditCategory(c)}
                            style={{ border: 'none', background: 'var(--surface)', padding: '8px', borderRadius: '10px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="Supprimer"
                            type="button"
                            onClick={() => setDeleteId(c.id)}
                            style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--divider)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Affiche {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredCategories.length)} sur {filteredCategories.length}
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

      <AdminModal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        title="Modifier la catégorie"
        icon={Edit}
      >
        {editCategory && (
          <form onSubmit={handleUpdateCategory} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Nom de la catégorie</label>
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Catégorie parente</label>
              <select
                value={editCategory.parent_id || ''}
                onChange={(e) => setEditCategory({ ...editCategory, parent_id: e.target.value || null })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
              >
                <option value="">Catégorie principale</option>
                {categories.filter(c => c.id !== editCategory.id && !c.parent_id).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: 6, display: 'block' }}>Slug (optionnel)</label>
              <input
                type="text"
                value={editCategory.slug || ''}
                onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                style={{ width: '100%', borderRadius: 12, border: '1px solid var(--divider)', padding: '10px 14px', fontSize: '0.9rem', background: 'var(--surface)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setEditCategory(null)}
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

      <AdminModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer cette catégorie ?"
        subtitle="Cette action est irréversible."
        icon={AlertTriangle}
        color="#ef4444"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.5 }}>
          Êtes-vous sûr de vouloir supprimer définitivement cette catégorie ? Assurez-vous qu'elle ne contient plus de produits avant de continuer.
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
            onClick={confirmDeleteCategory}
            style={{ padding: '10px 24px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            Oui, supprimer
          </button>
        </div>
      </AdminModal>
    </div>
  );
};

export default Categories;


