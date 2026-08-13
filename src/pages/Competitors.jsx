import { useEffect, useState } from 'react';
import { Radar, Plus, Trash2, Sparkles, X } from 'lucide-react';
import api, { getErrorMessage, getUsagePayload } from '../lib/api';
import { Banner, Loading, EmptyState } from '../components/UI';
import AIResultView from '../components/AIResultView';

export default function Competitors() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisFor, setAnalysisFor] = useState(null); // { competitor, result }

  const load = () => {
    setLoading(true);
    api
      .get('/competitors')
      .then((res) => setCompetitors(res.data.data.competitors))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/competitors', form);
      setShowForm(false);
      setForm({ name: '', website: '', description: '' });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Remove this competitor?')) return;
    try {
      await api.delete(`/competitors/${id}`);
      setCompetitors((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const runAnalysis = async (competitor) => {
    setAnalyzingId(competitor._id);
    setError('');
    try {
      const res = await api.post(`/ai/competitor-analysis/${competitor._id}`);
      setAnalysisFor({ competitor, analysis: res.data.data.analysis });
    } catch (err) {
      const usage = getUsagePayload(err);
      setError(usage ? `${getErrorMessage(err)} (${usage.used}/${usage.limit} used)` : getErrorMessage(err));
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Radar</div>
          <h1 className="page-title">Competitors</h1>
          <p className="page-sub">Track competitors and run AI analysis grounded in what you know about them — no scraping claims.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus /> Add competitor
        </button>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {loading ? (
        <Loading />
      ) : competitors.length === 0 ? (
        <div className="card">
          <EmptyState icon={Radar} title="No competitors tracked" body="Add a competitor's name, site, and what you know about them to run an AI analysis." action={<button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus /> Add competitor</button>} />
        </div>
      ) : (
        <div className="grid grid-3">
          {competitors.map((c) => (
            <div className="card card-pad" key={c._id}>
              <div className="list-title">{c.name}</div>
              {c.website && <div className="list-meta">{c.website}</div>}
              {c.description && <p className="out-text" style={{ marginTop: 8, color: 'var(--text-dim)' }}>{c.description}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => runAnalysis(c)} disabled={analyzingId === c._id}>
                  <Sparkles /> {analyzingId === c._id ? 'Analyzing…' : 'AI analysis'}
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
              <h3>Add competitor</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label>Name</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Website</label>
                <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://competitor.com" />
              </div>
              <div className="field">
                <label>What you know about them</label>
                <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Pricing, positioning, strengths, weaknesses…" />
              </div>
              <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
                {saving ? 'Adding…' : 'Add competitor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {analysisFor && (
        <div className="modal-overlay" onClick={() => setAnalysisFor(null)}>
          <div className="card modal-box card-pad" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3>Analysis · {analysisFor.competitor.name}</h3>
              <button className="icon-btn" onClick={() => setAnalysisFor(null)}>
                <X />
              </button>
            </div>
            {analysisFor.analysis?.businessScore != null && (
              <span className="badge badge-amber" style={{ marginBottom: 14 }}>Comparative score: {analysisFor.analysis.businessScore}/100</span>
            )}
            <AIResultView data={analysisFor.analysis?.result} />
          </div>
        </div>
      )}
    </>
  );
}
