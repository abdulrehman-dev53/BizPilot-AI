import { CopyButton } from './UI';

// Backend AI output is stored as Mongoose `Mixed` — shape varies by feature and
// isn't guaranteed field-for-field. This renders any reasonable JSON shape
// (strings, arrays of strings, arrays of objects, nested objects) legibly
// instead of coupling the UI to one exact schema.

function humanizeKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function ScalarList({ items }) {
  return (
    <div className="tag-row">
      {items.map((it, i) => (
        <span className="pill" key={i}>{String(it)}</span>
      ))}
    </div>
  );
}

function ObjectCard({ obj }) {
  const entries = Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '');
  const titleEntry = entries.find(([k]) => /title|name|day|headline/i.test(k));
  return (
    <div className="variation-card">
      {titleEntry && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <strong style={{ fontSize: 13.5 }}>{String(titleEntry[1])}</strong>
        </div>
      )}
      {entries
        .filter(([k]) => k !== titleEntry?.[0])
        .map(([k, v]) => (
          <FieldBlock key={k} label={humanizeKey(k)} value={v} compact />
        ))}
    </div>
  );
}

function FieldBlock({ label, value, compact }) {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <div className="out-block" style={compact ? { marginBottom: 8 } : undefined}>
        <div className="out-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label}
          {typeof value === 'string' && value.length > 40 && <CopyButton text={String(value)} />}
        </div>
        <div className="out-text">{String(value)}</div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const allScalars = value.every((v) => typeof v !== 'object' || v === null);
    return (
      <div className="out-block" style={compact ? { marginBottom: 8 } : undefined}>
        <div className="out-label">{label}</div>
        {allScalars ? (
          <ScalarList items={value} />
        ) : (
          <div>
            {value.map((item, i) => (
              <ObjectCard obj={typeof item === 'object' ? item : { value: item }} key={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isPlainObject(value)) {
    return (
      <div className="out-block" style={compact ? { marginBottom: 8 } : undefined}>
        <div className="out-label">{label}</div>
        <ObjectCard obj={value} />
      </div>
    );
  }

  return null;
}

export default function AIResultView({ data }) {
  if (!data) return null;

  if (typeof data === 'string') {
    return <div className="out-text">{data}</div>;
  }

  if (Array.isArray(data)) {
    return <FieldBlock label="Results" value={data} />;
  }

  if (!isPlainObject(data)) return null;

  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '');

  return (
    <div>
      {entries.map(([key, value]) => (
        <FieldBlock key={key} label={humanizeKey(key)} value={value} />
      ))}
    </div>
  );
}
