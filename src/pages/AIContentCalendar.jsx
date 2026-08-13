import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading } from '../components/UI';
import AIResultView from '../components/AIResultView';

export default function AIContentCalendar() {
  const [form, setForm] = useState({ platform: 'Instagram', goals: '' });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setRunning(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/ai/content-calendar', form);
      setResult(res.data.data.content);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  // The calendar's day entries can arrive as `days`, `calendar`, or top-level array —
  // normalize whichever shape the model returned into a list of day cards.
  const days = Array.isArray(result?.output)
    ? result.output
    : result?.output?.days || result?.output?.calendar || null;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">AI studio</div>
          <h1 className="page-title">Content calendar</h1>
          <p className="page-sub">A 30-day posting plan for one platform, grounded in your business profile and goals.</p>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20, maxWidth: 560 }}>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Platform</label>
              <input className="input" required value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Instagram" />
            </div>
            <div className="field">
              <label>Goals <span className="hint">(optional)</span></label>
              <input className="input" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} placeholder="Grow followers, drive store visits" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={running}>
            <CalendarDays /> {running ? 'Building calendar…' : 'Generate 30-day calendar'}
          </button>
        </form>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {running && (
        <div className="card card-pad">
          <Loading label="Planning 30 days of content…" />
        </div>
      )}

      {!running && result && (
        <div className="card card-pad">
          {days && Array.isArray(days) ? (
            <div className="cal-grid">
              {days.map((d, i) => (
                <div className="cal-day" key={i}>
                  <div className="d-num">Day {d.day ?? d.date ?? i + 1}</div>
                  {(d.topic || d.title) && <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.topic || d.title}</div>}
                  {(d.caption || d.description || d.content) && (
                    <div style={{ color: 'var(--text-dim)' }}>{d.caption || d.description || d.content}</div>
                  )}
                  {d.contentType && <span className="pill" style={{ marginTop: 6, display: 'inline-block' }}>{d.contentType}</span>}
                </div>
              ))}
            </div>
          ) : (
            <AIResultView data={result.output} />
          )}
        </div>
      )}

      {!running && !result && !error && (
        <div className="card">
          <div className="empty-state">
            <div className="icon-wrap">
              <CalendarDays />
            </div>
            <h3>No calendar yet</h3>
            <p>Set a platform and generate a full month of content ideas.</p>
          </div>
        </div>
      )}
    </>
  );
}
