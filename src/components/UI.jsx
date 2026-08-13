import { AlertTriangle, CheckCircle2, Info, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function Banner({ type = 'info', children }) {
  const Icon = type === 'error' ? AlertTriangle : type === 'success' ? CheckCircle2 : type === 'warn' ? AlertTriangle : Info;
  return (
    <div className={`banner banner-${type}`}>
      <Icon />
      <div>{children}</div>
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-row">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="icon-wrap">
          <Icon />
        </div>
      )}
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

export function StatTile({ label, value, foot, mono }) {
  return (
    <div className="card stat-tile">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${mono ? 'mono' : ''}`}>{value}</div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  );
}

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button type="button" className="copy-btn" onClick={onCopy}>
      {copied ? <Check /> : <Copy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function Skeleton({ h = 16, w = '100%', style }) {
  return <div className="skeleton" style={{ height: h, width: w, ...style }} />;
}
