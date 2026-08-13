import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading } from '../components/UI';
import AIResultView from '../components/AIResultView';

const PLATFORMS = ['Instagram', 'Facebook', 'Google Ads', 'LinkedIn', 'Email', 'Website'];

export default function AIMarketingGenerator() {
  const [form, setForm] = useState({ product: '', targetAudience: '', platform: 'Instagram', tone: '', objective: '' });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/ai/generate-marketing', form);
      setResult(res.data.data.content);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">AI studio</div>
          <h1 className="page-title">Marketing generator</h1>
          <p className="page-sub">Platform-specific ad copy with headline, primary text, CTA, hashtags, and variations.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1.3fr', alignItems: 'start' }}>
        <div className="card card-pad">
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Product or service</label>
              <input className="input" required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Handmade leather wallets" />
            </div>
            <div className="field">
              <label>Target audience</label>
              <input className="input" required value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} placeholder="Men aged 25–45 who value craftsmanship" />
            </div>
            <div className="field">
              <label>Platform</label>
              <select className="select" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Tone <span className="hint">(optional)</span></label>
                <input className="input" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="Warm and premium" />
              </div>
              <div className="field">
                <label>Objective <span className="hint">(optional)</span></label>
                <input className="input" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="Drive online store purchases" />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={running}>
              <Megaphone /> {running ? 'Generating…' : 'Generate ad copy'}
            </button>
          </form>
        </div>

        <div>
          {error && <Banner type="error">{error}</Banner>}
          {running && (
            <div className="card card-pad">
              <Loading label="Writing your ad copy…" />
            </div>
          )}
          {!running && result && (
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge badge-amber">{result.contentType}</span>
                {result.platform && <span className="badge badge-cyan">{result.platform}</span>}
              </div>
              <AIResultView data={result.output} />
            </div>
          )}
          {!running && !result && !error && (
            <div className="card">
              <div className="empty-state">
                <div className="icon-wrap">
                  <Megaphone />
                </div>
                <h3>Nothing generated yet</h3>
                <p>Fill in the brief and generate your first ad.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
