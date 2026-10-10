import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { api, session } from '../api';
import { Alert, Cross, Field, btnPrimary } from '../components/ui';

const home = (role) => (role === 'admin' ? '/admin' : '/pendataan');

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const s = session.get();
  if (s) return <Navigate to={home(s.role)} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      session.set(data);
      navigate(home(data.role), { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="login-glow pointer-events-none absolute inset-0 m-auto size-[36rem] max-w-[150vw]" />
      <form onSubmit={onSubmit} className="login-card relative mx-auto w-full max-w-sm space-y-4 overflow-hidden rounded-2xl bg-white p-6 pt-7 shadow-lg shadow-brown-800/5 ring-1 ring-stone-200">
        <span aria-hidden="true" className="login-sweep absolute inset-x-0 top-0 h-1 bg-gold-400" />
        <div>
          <Cross className="cross-draw mb-3 h-8 w-6 text-gold-400" />
          <h1 className="rise text-xl font-semibold text-brown-800" style={{ '--i': 0 }}>Masuk Petugas</h1>
          <p className="rise mt-1 text-sm text-stone-500" style={{ '--i': 1 }}>Untuk Admin dan User Pendataan.</p>
        </div>
        <div className="rise" style={{ '--i': 2 }}>
          <Field id="username" name="username" label="Username" autoComplete="username" required value={form.username} onChange={onChange} />
        </div>
        <div className="rise" style={{ '--i': 3 }}>
          <Field id="password" name="password" label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={onChange} />
        </div>
        <Alert>{error}</Alert>
        <button disabled={loading} className={`rise ${btnPrimary} w-full`} style={{ '--i': 4 }}>{loading ? 'Memproses…' : 'Masuk'}</button>
        <Link to="/" className="rise block text-center text-sm text-stone-500 hover:text-stone-700" style={{ '--i': 5 }}>← Kembali ke form absensi</Link>
      </form>
    </main>
  );
}
