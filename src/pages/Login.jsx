import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { Banner } from '../components/UI';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="brand" style={{ padding: '0 0 28px' }}>
            <div className="brand-mark">
              <Radar color="#0A0F1D" strokeWidth={2.5} />
            </div>
            <div className="brand-name">
              Biz<span>Pilot</span> AI
            </div>
          </div>

          <h1 className="page-title" style={{ marginBottom: 6 }}>Welcome back</h1>
          <p className="page-sub" style={{ marginBottom: 24 }}>Log in to keep flying your business plan.</p>

          {error && <Banner type="error">{error}</Banner>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
              {!loading && <ArrowRight />}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-dim)', textAlign: 'center' }}>
            New to BizPilot? <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
      <div className="auth-visual">
        <div className="auth-quote">
          "Every reading on the panel — <span>health score</span>, content, competitors — comes from your own business data."
        </div>
      </div>
    </div>
  );
}
