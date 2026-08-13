import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Pencil, Sparkles, X } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading, EmptyState } from '../components/UI';
import AIResultView from '../components/AIResultView';

const STATUSES = ['draft', 'active', 'paused', 'completed'];
const STATUS_BADGE = { draft: 'badge-neutral', active: 'badge-green', paused: 'badge-amber', completed: 'badge-cyan' };

const EMPTY = { name: '', platform: '', objective: '', budget: '', status: 'draft' };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [genFor, setGenFor] = useState(null);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/campaigns', { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setCampaigns(res.data.data.campaigns))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, platform: c.platform, objective: c.objective || '', budget: c.budget ?? '', status: c.status });
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, budget: form.budget === '' ? 0 : Number(form.budget) };
    try {
      if (editingId) {
        await api.put(`/campaigns/${editingId}`, payload);
      } else {
        await api.post('/campaigns', payload);
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
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const genCopy = async (campaign) => {
    setGenerating(true);
    setError('');
    try {
      const res = await api.post('/ai/campaign-copy', { campaignId: campaign._id });
      setGenFor({ campaign, copy: res.data.data.campaignCopy });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Growth</div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-sub">Track paid campaigns and generate AI ad copy tied to each one.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="select" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={openNew}>
            <Plus /> New campaign
          </button>
        </div>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {loading ? (
        <Loading />
      ) : campaigns.length === 0 ? (
        <div className="card">
          <EmptyState icon={Megaphone} title="No campaigns yet" body="Create a campaign, then generate AI ad copy tailored to its platform and objective." action={<button className="btn btn-primary" onClick={openNew}><Plus /> New campaign</button>} />
        </div>
      ) : (
        <div className="grid grid-3">
          {campaigns.map((c) => (
            <div className="card card-pad" key={c._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="list-title">{c.name}</div>
                <span className={`badge ${STATUS_BADGE[c.status] || 'badge-neutral'}`}>{c.status}</span>
              </div>
              <div className="list-meta">{c.platform}{c.budget ? ` · Rs ${c.budget}` : ''}</div>
              {c.objective && <p className="out-text" style={{ marginTop: 8, color: 'var(--text-dim)' }}>{c.objective}</p>}
              {c.generatedCopy && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => setGenFor({ campaign: c, copy: c.generatedCopy })}>
                  View generated copy
                </button>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => genCopy(c)} disabled={generating}>
                  <Sparkles /> {c.generatedCopy ? 'Regenerate' : 'AI copy'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>
                  <Pencil />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(c._id)}>
                  <Trash2 />
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
              <h3>{editingId ? 'Edit campaign' : 'New campaign'}</h3>
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
                  <label>Platform</label>
                  <input className="input" required value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Instagram" />
                </div>
                <div className="field">
                  <label>Budget</label>
                  <input className="input" type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Objective</label>
                <textarea className="textarea" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
              </div>
              <div className="field">
                <label>Status</label>
                <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create campaign'}
              </button>
            </form>
          </div>
        </div>
      )}

      {genFor && (
        <div className="modal-overlay" onClick={() => setGenFor(null)}>
          <div className="card modal-box card-pad" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3>{genFor.campaign.name} · Ad copy</h3>
              <button className="icon-btn" onClick={() => setGenFor(null)}>
                <X />
              </button>
            </div>
            <AIResultView data={genFor.copy} />
          </div>
        </div>
      )}
    </>
  );
}
