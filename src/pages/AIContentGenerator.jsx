import { useState } from 'react';
import { FileStack } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading } from '../components/UI';
import AIResultView from '../components/AIResultView';

const CONTENT_TYPES = [
  'Instagram Caption',
  'Facebook Post',
  'LinkedIn Post',
  'Blog Outline',
  'SEO Meta Description',
  'Product Description',
  'Email',
  'Ad Copy',
  'CTA',
];

export default function AIContentGenerator() {
  const [form, setForm] = useState({ contentType: CONTENT_TYPES[0], topic: '', keywords: '', tone: '' });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/ai/generate-content', form);
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
          <h1 className="page-title">Content generator</h1>
          <p className="page-sub">One-off content pieces — captions, blog outlines, emails, and more — saved to your history.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1.3fr', alignItems: 'start' }}>
        <div className="card card-pad">
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Content type</label>
              <select className="select" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })}>
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Topic / brief</label>
              <textarea className="textarea" required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Announce our new autumn leather collection" />
            </div>
            <div className="field">
              <label>Keywords <span className="hint">(optional)</span></label>
              <input className="input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="handmade, leather, autumn" />
            </div>
            <div className="field">
              <label>Tone <span className="hint">(optional)</span></label>
              <input className="input" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} placeholder="Friendly and confident" />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={running}>
              <FileStack /> {running ? 'Generating…' : 'Generate content'}
            </button>
          </form>
        </div>

        <div>
          {error && <Banner type="error">{error}</Banner>}
          {running && (
            <div className="card card-pad">
              <Loading label="Drafting your content…" />
            </div>
          )}
          {!running && result && (
            <div className="card card-pad">
              <span className="badge badge-amber" style={{ marginBottom: 12, display: 'inline-flex' }}>{result.contentType}</span>
              <AIResultView data={result.output} />
            </div>
          )}
          {!running && !result && !error && (
            <div className="card">
              <div className="empty-state">
                <div className="icon-wrap">
                  <FileStack />
                </div>
                <h3>Nothing generated yet</h3>
                <p>Give it a topic and pick a content type to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
