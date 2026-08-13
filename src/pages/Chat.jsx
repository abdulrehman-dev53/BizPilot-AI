import { useEffect, useRef, useState } from 'react';
import { Send, MessageSquareText, Plus, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../lib/api';
import { Banner, Loading } from '../components/UI';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const loadConversations = () => {
    setLoadingList(true);
    api
      .get('/chat/history')
      .then((res) => setConversations(res.data.data.conversations))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoadingList(false));
  };

  useEffect(loadConversations, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (id) => {
    setError('');
    try {
      const res = await api.get('/chat/history', { params: { conversationId: id } });
      setConversationId(id);
      setMessages(res.data.data.conversation.messages);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const newChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (id) => {
    try {
      await api.delete(`/chat/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (id === conversationId) newChat();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setSending(true);
    try {
      const res = await api.post('/chat', { message, conversationId: conversationId || undefined });
      setConversationId(res.data.data.conversationId);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.data.reply }]);
      loadConversations();
    } catch (err) {
      setError(getErrorMessage(err));
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">Copilot</div>
          <h1 className="page-title">Business assistant</h1>
          <p className="page-sub">Ask questions — answers are grounded in your business profile and latest analysis.</p>
        </div>
        <button className="btn btn-secondary" onClick={newChat}>
          <Plus /> New chat
        </button>
      </div>

      {error && <Banner type="error">{error}</Banner>}

      <div className="grid" style={{ gridTemplateColumns: '260px 1fr', alignItems: 'start' }}>
        <div className="card card-pad" style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          <div className="out-label">Conversations</div>
          {loadingList ? (
            <Loading />
          ) : conversations.length === 0 ? (
            <p style={{ fontSize: 12.5, color: 'var(--text-faint)', padding: '10px 0' }}>No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c._id}
                className="list-row"
                style={{ cursor: 'pointer', background: c._id === conversationId ? 'var(--bg-panel-hover)' : 'transparent', borderRadius: 8, padding: '10px 8px' }}
                onClick={() => openConversation(c._id)}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                    {c.title}
                  </div>
                  <div className="list-meta">{new Date(c.updatedAt).toLocaleDateString()}</div>
                </div>
                <button
                  className="icon-btn"
                  style={{ width: 26, height: 26 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c._id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="card card-pad chat-shell">
          <div className="chat-scroll" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="icon-wrap">
                  <MessageSquareText />
                </div>
                <h3>Ask your business assistant anything</h3>
                <p>"What should I focus on this month?" or "Draft a reply to a customer complaint."</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div className={`msg-row ${m.role === 'user' ? 'user' : 'ai'}`} key={i}>
                <div className={`msg-avatar ${m.role === 'user' ? 'user' : 'ai'}`}>{m.role === 'user' ? 'You' : 'AI'}</div>
                <div className="msg-bubble">{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="msg-row ai">
                <div className="msg-avatar ai">AI</div>
                <div className="msg-bubble">
                  <span className="spinner" />
                </div>
              </div>
            )}
          </div>
          <form className="chat-input-bar" onSubmit={send}>
            <input
              className="input"
              placeholder="Ask about your business…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />
            <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()}>
              <Send />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
