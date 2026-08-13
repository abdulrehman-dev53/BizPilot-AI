import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Package, Radar as RadarIcon, FileStack, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Loading, Banner, EmptyState } from '../components/UI';
import Gauge from '../components/Gauge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/dashboard')
      .then((res) => active && setData(res.data.data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading label="Reading the instruments…" />;
  if (error) return <Banner type="error">{error}</Banner>;
  if (!data) return null;

  if (!data.onboardingComplete) {
    return (
      <>
        <PageHeader />
        <div className="card">
          <EmptyState
            icon={Building2}
            title="Set up your business profile to take off"
            body="BizPilot needs a business profile before it can generate analysis, marketing copy, or content. It takes under a minute."
            action={
              <Link to="/business" className="btn btn-primary">
                Create business profile <ArrowRight />
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader remaining={data.remainingAIRequests} used={data.totalAIRequests} />

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card card-pad" style={{ gridColumn: 'span 1' }}>
          <div className="stat-label">Business health</div>
          <div className="gauge-wrap">
            <Gauge value={data.businessScore} />
            <div className="gauge-readout">
              <div className="value">
                {data.businessScore ?? '—'}
                <span> /100</span>
              </div>
              <div className="caption">
                {data.businessScore === null ? (
                  <Link to="/ai/analysis" style={{ color: 'var(--cyan)' }}>Run first analysis →</Link>
                ) : (
                  'From your latest AI business analysis'
                )}
              </div>
            </div>
          </div>
        </div>
        <StatTile icon={Package} label="Products & services" value={data.totalProducts} to="/products" />
        <StatTile icon={RadarIcon} label="Competitors tracked" value={data.totalCompetitors} to="/competitors" />
        <StatTile icon={FileStack} label="AI content generated" value={data.totalGeneratedContent} to="/content-history" />
      </div>

      {data.growthRecommendations?.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <div className="out-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={13} /> Growth recommendations
          </div>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.growthRecommendations.map((rec, i) => (
              <li key={i} className="out-text">
                {typeof rec === 'string' ? rec : rec.title || JSON.stringify(rec)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-3">
        <RecentPanel
          title="Recent AI analyses"
          empty="No analyses yet."
          items={data.recentAnalyses}
          renderItem={(a) => ({
            title: a.type === 'business-analysis' ? 'Business analysis' : 'Competitor analysis',
            meta: new Date(a.createdAt).toLocaleDateString(),
            badge: a.businessScore ? `${a.businessScore}/100` : null,
          })}
          cta={{ to: '/ai/analysis', text: 'New analysis' }}
        />
        <RecentPanel
          title="Recent content"
          empty="Nothing generated yet."
          items={data.recentContent}
          renderItem={(c) => ({ title: c.contentType, meta: c.platform || c.source })}
          cta={{ to: '/ai/content', text: 'Generate content' }}
        />
        <RecentPanel
          title="Recent campaigns"
          empty="No campaigns yet."
          items={data.recentCampaigns}
          renderItem={(c) => ({ title: c.name, meta: `${c.platform} · ${c.status}` })}
          cta={{ to: '/campaigns', text: 'New campaign' }}
        />
      </div>
    </>
  );
}

function PageHeader({ remaining, used }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">Flight deck</div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">A live snapshot of your business, content, and AI usage.</p>
      </div>
      {remaining !== undefined && (
        <span className="badge badge-amber">
          <Sparkles size={12} /> {remaining} AI requests left this month ({used} used)
        </span>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="card stat-tile" style={{ display: 'block' }}>
      <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={13} /> {label}
      </div>
      <div className="stat-value">{value}</div>
    </Link>
  );
}

function RecentPanel({ title, items, renderItem, empty, cta }) {
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="out-label">{title}</div>
        <Link to={cta.to} style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600 }}>
          {cta.text}
        </Link>
      </div>
      {(!items || items.length === 0) && <p style={{ fontSize: 12.5, color: 'var(--text-faint)', padding: '10px 0' }}>{empty}</p>}
      {items?.map((it) => {
        const r = renderItem(it);
        return (
          <div className="list-row" key={it._id}>
            <div>
              <div className="list-title">{r.title}</div>
              <div className="list-meta">{r.meta}</div>
            </div>
            {r.badge && <span className="badge badge-neutral">{r.badge}</span>}
          </div>
        );
      })}
    </div>
  );
}
