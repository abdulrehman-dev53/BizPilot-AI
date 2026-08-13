import { useEffect, useState } from 'react';
import { FileStack, Trash2, RefreshCw, Bookmark, BookmarkCheck, X } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading, EmptyState } from '../components/UI';
import AIResultView from '../components/AIResultView';

const SOURCES = [
  { value: '', label: 'All sources' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'content', label: 'Content' },
  { value: 'campaign-copy', label: 'Campaign copy' },
  { value: 'content-calendar', label: 'Content calendar' },
];

export default function ContentHistory() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (source) params.source = source;
    api
      .get('/content', { params })
      .then((res) => {
        setItems(res.data.data.items);
        setTotal(res.data.data.total);
        setPages(res.data.data.pages);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, source]);

  const toggleSave = async (item) => {
    setBusyId(item._id);
    try {
      const res = await api.put(`/content/${item._id}`, { isSaved: !item.isSaved });
      setItems((prev) => prev.map((i) => (i._id === item._id ? res.data.data.item : i)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (!window.confirm('Delete this content item?')) return;
    setBusyId(item._id);
    try {
      await api.delete(`/content/${item._id}`);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      setTotal((t) => t - 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const regenerate = async (item) => {
    setBusyId(item._id);
    setError('');
    try {
      const res = await api.post(`/content/${item._id}/regenerate`);
      setViewing(res.data.data.content);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Logbook</div>
          <h1 className="page-title">Content history</h1>
          <p className="page-sub">{total} generated item{total === 1 ? '' : 's'} across marketing, content, campaigns, and calendars.</p>
        </div>
        <select
          className="select"
          style={{ width: 200 }}
          value={source}
          onChange={(e) => {
            setPage(1);
            setSource(e.target.value);
          }}
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState icon={FileStack} title="No content here yet" body="Generate marketing copy, content, or a calendar and it will show up in this log." />
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {items.map((item) => (
              <div className="card card-pad" key={item._id} style={{ cursor: 'pointer' }} onClick={() => setViewing(item)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span className="badge badge-amber">{item.contentType}</span>
                  {item.isSaved && <Bookmark size={14} color="var(--cyan)" fill="var(--cyan)" />}
                </div>
                <div className="list-meta" style={{ marginTop: 10 }}>
                  {item.platform ? `${item.platform} · ` : ''}
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-secondary btn-sm" disabled={busyId === item._id} onClick={() => toggleSave(item)}>
                    {item.isSaved ? <BookmarkCheck /> : <Bookmark />} {item.isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button className="btn btn-secondary btn-sm" disabled={busyId === item._id} onClick={() => regenerate(item)}>
                    <RefreshCw /> Regenerate
                  </button>
                  <button className="btn btn-danger btn-sm" disabled={busyId === item._id} onClick={() => remove(item)}>
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-dim)' }}>Page {page} of {pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="card modal-box card-pad" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="badge badge-amber">{viewing.contentType}</span>
              <button className="icon-btn" onClick={() => setViewing(null)}>
                <X />
              </button>
            </div>
            <AIResultView data={viewing.output} />
          </div>
        </div>
      )}
    </>
  );
}
