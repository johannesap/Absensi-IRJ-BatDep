import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api, formatWIB } from '../api';
import { Alert, Cross, Field, btnPrimary } from '../components/ui';

const FIELDS = [
  { name: 'nama', label: 'Nama Lengkap', placeholder: 'cth. Yohanes Saputra', autoComplete: 'name' },
  { name: 'npm', label: 'NPM', placeholder: '8 digit angka', inputMode: 'numeric', maxLength: 8 },
  { name: 'kelas', label: 'Kelas', placeholder: 'cth. 3IA01' },
  { name: 'kakakKomsel', label: 'Kakak Komsel', placeholder: 'Nama kakak komsel' },
];
const EMPTY = { nama: '', npm: '', kelas: '', kakakKomsel: '' };

// Layar sambutan ±3 detik; ketuk untuk lewati. Dilewati jika pengguna memilih kurangi gerakan.
function Welcome() {
  const [show, setShow] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 3200);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div aria-hidden="true" onClick={() => setShow(false)} className="welcome fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-brown-800 px-6 text-center text-white">
      <Cross className="cross-draw h-14 w-10 text-gold-400" />
      <p className="mt-6 text-lg text-gold-100 sm:text-xl">
        {['Selamat', 'Datang', 'di'].map((w, i) => <span key={w} className="word" style={{ '--i': i }}>{w}&nbsp;</span>)}
      </p>
      <h2 className="word mt-2 text-3xl font-semibold tracking-tight sm:text-5xl" style={{ '--i': 3 }}>Ibadah Raya Jumat</h2>
      <span className="welcome-line mt-5 block h-0.5 w-24 bg-gold-400" />
      <p className="word mt-4 text-sm font-medium uppercase tracking-[0.3em] text-gold-400 sm:text-base" style={{ '--i': 5 }}>Area Depok</p>
    </div>
  );
}

export function validate(form) {
  const errors = {};
  for (const { name, label } of FIELDS) if (!form[name].trim()) errors[name] = `${label} wajib diisi`;
  if (form.npm.trim() && !/^\d{8}$/.test(form.npm.trim())) errors.npm = 'NPM harus 8 digit angka';
  return errors;
}

export default function Home() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await api('/attendance', { method: 'POST', body: form });
      setStatus({ type: 'success', msg: `Terima kasih, ${form.nama.trim()}! Kehadiranmu sudah tercatat. Tuhan Yesus memberkati.` });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh px-4 py-10 sm:py-16">
      <Welcome />
      <div className="mx-auto max-w-md">
        <header className="animate-enter text-center">
          <Cross className="mx-auto mb-4 h-10 w-7 text-gold-400" />
          <p className="inline-block rounded-full bg-brown-50 px-3 py-1 text-xs font-medium tracking-wide text-brown-800 ring-1 ring-brown-100">
            Persekutuan Doa Universitas Gunadarma
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-brown-800">Ibadah Raya Jumat</h1>
          <p className="mt-2 text-stone-500">Isi daftar kehadiran di bawah ini.</p>
          <p className="mx-auto mt-4 max-w-xs text-sm italic text-gold-600">
            “Sebab di mana dua atau tiga orang berkumpul dalam nama-Ku, di situ Aku ada di tengah-tengah mereka.” — Matius 18:20
          </p>
        </header>

        <form
          noValidate
          onSubmit={onSubmit}
          className="animate-enter mt-8 space-y-4 rounded-2xl border-t-4 border-gold-400 bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6"
          style={{ animationDelay: '120ms' }}
        >
          {FIELDS.map((f) => (
            <Field key={f.name} id={f.name} {...f} value={form[f.name]} error={errors[f.name]} onChange={onChange} />
          ))}
          <Field id="tanggal" label="Tanggal Kehadiran" value={formatWIB(now)} readOnly />
          <Alert type={status?.type}>{status?.msg}</Alert>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? 'Mengirim…' : 'Kirim Kehadiran'}
          </button>
        </form>

        <p className="animate-enter mt-6 text-center text-sm text-stone-500" style={{ animationDelay: '240ms' }}>
          Petugas? <Link to="/login" className="font-medium text-brown-700 hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </main>
  );
}
