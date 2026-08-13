import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import api, { getErrorMessage, getUsagePayload } from '../lib/api';
import { Banner, Loading } from '../components/UI';
import Gauge from '../components/Gauge';
import AIResultView from '../components/AIResultView';

export default function AIBusinessAnalysis() {
  const [hasBusiness, setHasBusiness] = useState(true);
  const [checking, setChecking] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    api
      .get('/business')
      .then(() => setHasBusiness(true))
      .catch((err) => setHasBusiness(err?.response?.status !== 404))
      .finally(() => setChecking(false));
  }, []);

  const run = async () => {
    setRunning(true);
    setError('');
    try {
      const res = await api.post('/ai/business-analysis');
      setAnalysis(res.data.data.analysis);
    } catch (err) {
      const usage = getUsagePayload(err);
      setError(usage ? `${getErrorMessage(err)}` : getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  if (checking) return <Loading />;

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">AI studio</div>
          <h1 className="page-title">Business analysis</h1>
          <p className="page-sub">A SWOT-style breakdown with a health score, personas, and an action plan — generated from your business profile and products.</p>
        </div>
        <button className="btn btn-primary" onClick={run} disabled={running || !hasBusiness}>
          <Sparkles /> {running ? 'Analyzing…' : 'Run analysis'}
        </button>
      </div>

      {!hasBusiness && (
        <Banner type="warn">
          You need a business profile first. <Link to="/business" style={{ color: 'inherit', textDecoration: 'underline' }}>Create one →</Link>
        </Banner>
      )}

      {error && <Banner type="error">{error}</Banner>}

      {running && (
        <div className="card card-pad">
          <Loading label="Running your business through the AI analyzer…" />
        </div>
      )}

      {!running && analysis && (
        <div className="card card-pad">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <Gauge value={analysis.businessScore} size={110} />
            <div>
              <div className="out-label">Business health score</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>
                {analysis.businessScore ?? '—'} <span style={{ fontSize: 14, color: 'var(--text-faint)', fontWeight: 500 }}>/ 100</span>
              </div>
            </div>
          </div>
          <hr className="divider" />
          <AIResultView data={analysis.result} />
        </div>
      )}

      {!running && !analysis && hasBusiness && (
        <div className="card">
          <div className="empty-state">
            <div className="icon-wrap">
              <Sparkles />
            </div>
            <h3>Ready when you are</h3>
            <p>Run an analysis to get a health score, SWOT breakdown, and a concrete action plan.</p>
          </div>
        </div>
      )}
    </>
  );
}
