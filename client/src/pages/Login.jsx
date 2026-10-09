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
    <main className="flex min-h-dvh items-center px-4 py-10">
      <form onSubmit={onSubmit} className="animate-enter mx-auto w-full max-w-sm space-y-4 rounded-2xl border-t-4 border-gold-400 bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <div>
          <Cross className="mb-3 h-8 w-6 text-gold-400" />
          <h1 className="text-xl font-semibold text-brown-800">Masuk Petugas</h1>
          <p className="mt-1 text-sm text-stone-500">Untuk Admin dan User Pendataan.</p>
        </div>
        <Field id="username" name="username" label="Username" autoComplete="username" required value={form.username} onChange={onChange} />
        <Field id="password" name="password" label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={onChange} />
        <Alert>{error}</Alert>
        <button disabled={loading} className={`${btnPrimary} w-full`}>{loading ? 'Memproses…' : 'Masuk'}</button>
        <Link to="/" className="block text-center text-sm text-stone-500 hover:text-stone-700">← Kembali ke form absensi</Link>
      </form>
    </main>
  );
}
