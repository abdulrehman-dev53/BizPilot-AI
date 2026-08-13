import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radar, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { Banner } from '../components/UI';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account'));
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

          <h1 className="page-title" style={{ marginBottom: 6 }}>Create your account</h1>
          <p className="page-sub" style={{ marginBottom: 24 }}>Free plan includes 20 AI requests a month — no card required.</p>

          {error && <Banner type="error">{error}</Banner>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ayesha Khan"
              />
            </div>
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
                placeholder="At least 8 characters"
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight />}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-dim)', textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
      <div className="auth-visual">
        <div className="auth-quote">
          "Set the heading once — <span>industry, audience, tone</span> — and every AI feature flies from the same flight plan."
        </div>
      </div>
    </div>
  );
}
