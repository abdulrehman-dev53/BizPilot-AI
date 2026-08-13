import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading } from '../components/UI';

const EMPTY = {
  businessName: '',
  industry: '',
  description: '',
  website: '',
  targetAudience: '',
  location: '',
  brandTone: '',
  businessGoals: '',
};

export default function BusinessProfile() {
  const [exists, setExists] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState([]);
  const [competitors, setCompetitors] = useState([]);

  useEffect(() => {
    api
      .get('/business')
      .then((res) => {
        const b = res.data.data.business;
        setExists(true);
        setForm({
          businessName: b.businessName || '',
          industry: b.industry || '',
          description: b.description || '',
          website: b.website || '',
          targetAudience: b.targetAudience || '',
          location: b.location || '',
          brandTone: b.brandTone || '',
          businessGoals: (b.businessGoals || []).join(', '),
        });
        setProducts(b.products || []);
        setCompetitors(b.competitors || []);
      })
      .catch((err) => {
        if (err?.response?.status !== 404) setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const onChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const payload = {
      ...form,
      businessGoals: form.businessGoals
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean),
    };
    try {
      if (exists) {
        await api.put('/business', payload);
        setSuccess('Business profile updated.');
      } else {
        await api.post('/business', payload);
        setExists(true);
        setSuccess('Business profile created. You can now use the AI studio.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete your business profile? This cannot be undone.')) return;
    try {
      await api.delete('/business');
      setExists(false);
      setForm(EMPTY);
      setSuccess('Business profile deleted.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loading label="Loading your business profile…" />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Flight plan</div>
          <h1 className="page-title">Business profile</h1>
          <p className="page-sub">This context grounds every AI feature — analysis, marketing copy, and the chat assistant.</p>
        </div>
      </div>

      {error && <Banner type="error">{error}</Banner>}
      {success && <Banner type="success">{success}</Banner>}

      <div className="grid" style={{ gridTemplateColumns: exists ? '1.6fr 1fr' : '1fr', alignItems: 'start' }}>
        <div className="card card-pad">
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="field">
                <label>Business name</label>
                <input className="input" required value={form.businessName} onChange={onChange('businessName')} placeholder="Ayesha's Leather Co." />
              </div>
              <div className="field">
                <label>Industry</label>
                <input className="input" required value={form.industry} onChange={onChange('industry')} placeholder="Retail / E-commerce" />
              </div>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea className="textarea" value={form.description} onChange={onChange('description')} placeholder="What does the business do, and what makes it distinct?" />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Website</label>
                <input className="input" value={form.website} onChange={onChange('website')} placeholder="https://example.com" />
              </div>
              <div className="field">
                <label>Location</label>
                <input className="input" value={form.location} onChange={onChange('location')} placeholder="Faisalabad, Pakistan" />
              </div>
            </div>

            <div className="field">
              <label>Target audience</label>
              <input className="input" value={form.targetAudience} onChange={onChange('targetAudience')} placeholder="Men aged 25–45 who value craftsmanship" />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Brand tone</label>
                <input className="input" value={form.brandTone} onChange={onChange('brandTone')} placeholder="Warm, premium, direct" />
              </div>
              <div className="field">
                <label>Business goals</label>
                <input className="input" value={form.businessGoals} onChange={onChange('businessGoals')} placeholder="Comma-separated: grow online sales, expand to Lahore" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Save /> {saving ? 'Saving…' : exists ? 'Save changes' : 'Create profile'}
              </button>
              {exists && (
                <button className="btn btn-danger" type="button" onClick={onDelete}>
                  <Trash2 /> Delete profile
                </button>
              )}
            </div>
          </form>
        </div>

        {exists && (
          <div className="card card-pad">
            <div className="out-label">Linked to this profile</div>
            <div className="list-row">
              <span className="list-title">Products & services</span>
              <span className="badge badge-cyan">{products.length}</span>
            </div>
            <div className="list-row">
              <span className="list-title">Tracked competitors</span>
              <span className="badge badge-violet">{competitors.length}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
