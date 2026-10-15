import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { api, formatWIB } from '../api';
import { Alert, Cross, Field, btnPrimary, inputCls } from '../components/ui';

const FIELDS = [
  { name: 'nama', label: 'Nama Lengkap', placeholder: 'cth. Yohanes Saputra', autoComplete: 'name' },
  { name: 'npm', label: 'NPM', placeholder: '8 digit angka', inputMode: 'numeric', maxLength: 8 },
  { name: 'kelas', label: 'Kelas', placeholder: 'cth. 3IA01' },
  { name: 'kakakKomsel', label: 'Kakak Komsel', placeholder: 'Nama kakak komsel' },
  { name: 'whatsapp', label: 'Nomor WhatsApp', placeholder: 'cth. 081234567890', type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
];
const EMPTY = { nama: '', npm: '', kelas: '', kakakKomsel: '', whatsapp: '', lahirHari: '', lahirBulan: '' };
const HARI = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const BULAN = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'long' }));

// Layar sambutan menunggu diketuk: browser baru mengizinkan suara setelah interaksi, jadi ketukan "masuk" ini
// sekaligus memutar lagu latar (lihat Backsound). Dilewati jika pengguna memilih kurangi gerakan.
function Welcome() {
  const [show, setShow] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setShow(false), 600); // = durasi animasi welcome-leave
    return () => clearTimeout(t);
  }, [leaving]);
  if (!show) return null;
  return (
    <div onClick={() => setLeaving(true)} className={`fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-brown-800 px-6 text-center text-white ${leaving ? 'welcome-leave' : ''}`}>
      <Cross className="cross-draw h-14 w-10 text-gold-400" />
      <p className="mt-6 text-lg text-gold-100 sm:text-xl">
        {['Selamat', 'Datang', 'di'].map((w, i) => <span key={w} className="word" style={{ '--i': i }}>{w}&nbsp;</span>)}
      </p>
      <h2 className="word mt-2 text-3xl font-semibold tracking-tight sm:text-5xl" style={{ '--i': 3 }}>Ibadah Raya Jumat</h2>
      <span className="welcome-line mt-5 block h-0.5 w-24 bg-gold-400" />
      <p className="word mt-4 text-sm font-medium uppercase tracking-[0.3em] text-gold-400 sm:text-base" style={{ '--i': 5 }}>Area Depok</p>
      <button
        type="button"
        autoFocus
        className="word mt-12 rounded-full px-6 py-3 font-medium text-gold-100 ring-1 ring-gold-400 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
        style={{ '--i': 7 }}
      >
        Ketuk untuk masuk
      </button>
    </div>
  );
}

// Lagu latar "Praise" – Elevation Worship (client/public/praise.mp3). Browser memblokir suara sebelum pengunjung
// berinteraksi, jadi lagu diputar pada klik/tombol pertama. Listener "click" (bukan pointerdown) supaya klik pertama
// pada tombol Jeda/Putar tidak langsung memutar lalu menjeda lagi.
function Backsound() {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const off = () => {
      window.removeEventListener('click', start);
      window.removeEventListener('keydown', start);
    };
    const start = () => {
      off(); // sekali saja, supaya lagu yang sudah dijeda tidak diputar lagi saat mengetik
      audio.current?.play().catch(() => {});
    };
    window.addEventListener('click', start);
    window.addEventListener('keydown', start);
    return off;
  }, []);
  const toggle = () => (audio.current.paused ? audio.current.play().catch(() => {}) : audio.current.pause());
  return (
    <>
      <audio ref={audio} src="/praise.mp3" loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Jeda lagu' : 'Putar lagu'}
        title={playing ? 'Jeda lagu' : 'Putar lagu'}
        className="fixed bottom-4 right-4 z-40 flex size-12 items-center justify-center rounded-full bg-brown-700 text-white shadow-lg ring-2 ring-gold-400 transition-colors hover:bg-brown-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-700"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />}
        </svg>
      </button>
    </>
  );
}

export function validate(form) {
  const errors = {};
  for (const { name, label } of FIELDS) if (!form[name].trim()) errors[name] = `${label} wajib diisi`;
  if (form.npm.trim() && !/^\d{8}$/.test(form.npm.trim())) errors.npm = 'NPM harus 8 digit angka';
  // Sama dengan normalisasi di server (models/Attendance.js)
  if (form.whatsapp.trim() && !/^628\d{7,11}$/.test(form.whatsapp.replace(/\D/g, '').replace(/^0/, '62'))) {
    errors.whatsapp = 'Nomor WhatsApp tidak valid (cth. 081234567890)';
  }
  const { lahirHari: d, lahirBulan: m } = form;
  if (!d !== !m) errors.lahir = 'Pilih tanggal dan bulan, atau kosongkan keduanya';
  else if (d && new Date(2000, m - 1, d).getMonth() !== m - 1) errors.lahir = 'Tanggal itu tidak ada di bulan tersebut';
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
    setErrors({ ...errors, [e.target.name.startsWith('lahir') ? 'lahir' : e.target.name]: undefined });
  };

  const lahirProps = {
    onChange,
    'aria-invalid': !!errors.lahir,
    'aria-describedby': errors.lahir ? 'lahir-err' : undefined,
    className: `${inputCls} ${errors.lahir ? 'border-red-500' : 'border-stone-300'}`,
  };

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { lahirHari, lahirBulan, ...rest } = form;
      await api('/attendance', { method: 'POST', body: { ...rest, ulangTahun: lahirHari ? `${lahirBulan}-${lahirHari}` : undefined } });
      setStatus({ type: 'success', msg: `Terima kasih, ${form.nama.trim()}! Kehadiranmu sudah tercatat. Tuhan Yesus memberkati.` });
      setForm(EMPTY);
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh px-4 pt-10 pb-24 sm:pt-16">
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
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-stone-700">
              Tanggal Ulang Tahun <span className="font-normal text-stone-400">(opsional, tanpa tahun)</span>
            </legend>
            <div className="grid grid-cols-[6rem_1fr] gap-2">
              <select name="lahirHari" aria-label="Tanggal" value={form.lahirHari} {...lahirProps}>
                <option value="">Tgl</option>
                {HARI.map((h) => <option key={h} value={h}>{+h}</option>)}
              </select>
              <select name="lahirBulan" aria-label="Bulan" value={form.lahirBulan} {...lahirProps}>
                <option value="">Bulan</option>
                {BULAN.map((b, i) => <option key={b} value={String(i + 1).padStart(2, '0')}>{b}</option>)}
              </select>
            </div>
            {errors.lahir && <p id="lahir-err" className="mt-1 text-sm text-red-600">{errors.lahir}</p>}
          </fieldset>
          <Field id="tanggal" label="Tanggal Kehadiran" value={formatWIB(now)} readOnly />
          <p className="text-xs text-stone-500">
            Data ini hanya digunakan untuk pelayanan Persekutuan Doa Universitas Gunadarma dan hanya dapat dilihat oleh pengurus.
          </p>
          <Alert type={status?.type}>{status?.msg}</Alert>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? 'Mengirim…' : 'Kirim Kehadiran'}
          </button>
        </form>

        <p className="animate-enter mt-6 text-center text-sm text-stone-500" style={{ animationDelay: '240ms' }}>
          Pengurus? <Link to="/login" className="font-medium text-brown-700 hover:underline">Masuk di sini</Link>
        </p>
        <Backsound />
      </div>
    </main>
  );
}
