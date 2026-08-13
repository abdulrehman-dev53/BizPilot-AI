import { useEffect, useState } from 'react';
import { Package, Plus, Trash2, Pencil, X } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading, EmptyState } from '../components/UI';

const EMPTY = { name: '', description: '', category: '', price: '', targetAudience: '', features: '', uniqueSellingPoints: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/products')
      .then((res) => setProducts(res.data.data.products))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      price: p.price ?? '',
      targetAudience: p.targetAudience || '',
      features: (p.features || []).join(', '),
      uniqueSellingPoints: (p.uniqueSellingPoints || []).join(', '),
    });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: form.price === '' ? 0 : Number(form.price),
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      uniqueSellingPoints: form.uniqueSellingPoints.split(',').map((f) => f.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Payload</div>
          <h1 className="page-title">Products & services</h1>
          <p className="page-sub">What you sell — used as context for marketing copy and business analysis.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus /> Add product
        </button>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <div className="card">
          <EmptyState icon={Package} title="No products yet" body="Add your first product or service to give the AI something concrete to work with." action={<button className="btn btn-primary" onClick={openNew}><Plus /> Add product</button>} />
        </div>
      ) : (
        <div className="grid grid-3">
          {products.map((p) => (
            <div className="card card-pad" key={p._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div className="list-title">{p.name}</div>
                  {p.category && <div className="list-meta">{p.category}</div>}
                </div>
                {p.price > 0 && <span className="badge badge-amber">Rs {p.price}</span>}
              </div>
              {p.description && <p className="out-text" style={{ marginTop: 10, color: 'var(--text-dim)' }}>{p.description}</p>}
              {p.features?.length > 0 && (
                <div className="tag-row" style={{ marginTop: 10 }}>
                  {p.features.map((f, i) => (
                    <span className="pill" key={i}>{f}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                  <Pencil /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(p._id)}>
                  <Trash2 /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="card modal-box card-pad" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label>Name</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="field">
                  <label>Price</label>
                  <input className="input" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field">
                <label>Target audience</label>
                <input className="input" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
              </div>
              <div className="field">
                <label>Features <span className="hint">(comma-separated)</span></label>
                <input className="input" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
              </div>
              <div className="field">
                <label>Unique selling points <span className="hint">(comma-separated)</span></label>
                <input className="input" value={form.uniqueSellingPoints} onChange={(e) => setForm({ ...form, uniqueSellingPoints: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
