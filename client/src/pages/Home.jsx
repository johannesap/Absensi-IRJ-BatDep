import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api';
import { Alert, Cross, Field, btnGhost, btnPrimary, inputCls } from '../components/ui';

const FIELDS = [
  { name: 'nama', label: 'Nama Lengkap', placeholder: 'cth. Yohanes Saputra', autoComplete: 'name', maxLength: 100 },
  { name: 'npm', label: 'NPM', placeholder: '8 digit angka', inputMode: 'numeric' },
  { name: 'kelas', label: 'Kelas', placeholder: 'cth. 3IA01', maxLength: 5 },
  { name: 'kakakKomsel', label: 'Kakak Komsel', placeholder: 'Nama kakak komsel', maxLength: 100 },
  { name: 'whatsapp', label: 'Nomor WhatsApp', placeholder: 'cth. 081234567890', type: 'tel', inputMode: 'numeric', autoComplete: 'tel' },
];
// Kolom angka saja: selain angka dibuang saat diketik/ditempel, lalu dipotong ke panjang maksimal.
// (Bukan maxLength: maxLength memotong teks tempelan seperti "0812 3456 7890" sebelum spasinya dibuang.)
const DIGITS = { npm: 8, whatsapp: 13 };
const EMPTY = { nama: '', npm: '', kelas: '', kakakKomsel: '', whatsapp: '', lahirHari: '', lahirBulan: '' };
const HARI = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const BULAN = Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString('id-ID', { month: 'long' }));

// Layar sambutan menunggu diketuk: browser baru mengizinkan suara setelah interaksi, jadi ketukan "masuk" ini
// sekaligus memutar lagu latar (lihat components/Backsound.jsx). Dilewati jika pengguna memilih kurangi gerakan.
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

export function validate(form) {
  const errors = {};
  for (const { name, label } of FIELDS) if (!form[name].trim()) errors[name] = `${label} wajib diisi`;
  if (form.npm.trim() && !/^\d{8}$/.test(form.npm.trim())) errors.npm = 'NPM harus 8 digit angka';
  // Sama dengan normalisasi di server (models/Attendance.js); input sudah angka saja, maks. 13 digit
  if (form.whatsapp && !/^628\d{7,11}$/.test(form.whatsapp.replace(/^0/, '62'))) {
    errors.whatsapp = 'Nomor WhatsApp tidak valid (cth. 081234567890)';
  }
  const { lahirHari: d, lahirBulan: m } = form;
  if (!d !== !m) errors.lahir = 'Pilih tanggal dan bulan, atau kosongkan keduanya';
  else if (d && new Date(2000, m - 1, d).getMonth() !== m - 1) errors.lahir = 'Tanggal itu tidak ada di bulan tersebut';
  return errors;
}

// Muncul setelah kehadiran tercatat; doa disimpan ke absensi itu (server mencocokkan _id + NPM)
function Doa({ entry, onDone }) {
  const [doa, setDoa] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api(`/attendance/${entry.id}/doa`, { method: 'POST', body: { npm: entry.npm, doa } });
      onDone(true);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="animate-enter mt-8 space-y-4 rounded-2xl border-t-4 border-gold-400 bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
      <Alert type="success">Terima kasih, {entry.nama}! Kehadiranmu sudah tercatat. Tuhan Yesus memberkati.</Alert>
      <div>
        <label htmlFor="doa" className="mb-1.5 block text-sm font-medium text-stone-700">
          Dukungan Doa <span className="font-normal text-stone-400">(opsional)</span>
        </label>
        <textarea
          id="doa" rows={5} maxLength={1000} value={doa} onChange={(e) => setDoa(e.target.value)}
          placeholder="Tuliskan pokok doa yang ingin didoakan bersama…"
          aria-describedby="doa-info"
          className={`${inputCls} border-stone-300`}
        />
        <p id="doa-info" className="mt-1 text-xs text-stone-500">Hanya dibaca oleh pengurus untuk didoakan.</p>
      </div>
      <Alert>{error}</Alert>
      <div className="flex gap-2">
        <button disabled={sending || !doa.trim()} className={`${btnPrimary} flex-1`}>{sending ? 'Mengirim…' : 'Kirim Dukungan Doa'}</button>
        <button type="button" onClick={() => onDone(false)} className={btnGhost}>Lewati</button>
      </div>
    </form>
  );
}

// Layar terima kasih setelah dukungan doa dikirim/dilewati; ±5 detik (atau diketuk) lalu halaman dimuat ulang.
// Warnanya sama dengan Welcome, jadi pergantian ke layar sambutan tidak berkedip.
function Thanks({ nama, sent, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div role="status" onClick={onDone} className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-brown-800 px-6 text-center text-white">
      <Cross className="cross-draw h-14 w-10 text-gold-400" />
      <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        {['Terima', 'kasih'].map((w, i) => <span key={w} className="word" style={{ '--i': i }}>{w}&nbsp;</span>)}
      </h2>
      <p className="word mt-3 text-xl text-gold-100 sm:text-2xl" style={{ '--i': 2 }}>{nama}</p>
      <span className="welcome-line mt-5 block h-0.5 w-24 bg-gold-400" />
      <p className="word mt-4 max-w-sm text-gold-100" style={{ '--i': 4 }}>
        {sent ? 'Dukungan doamu sudah kami terima dan akan didoakan bersama.' : 'Kehadiranmu sudah tercatat.'}
      </p>
      <p className="word mt-4 text-sm font-medium uppercase tracking-[0.3em] text-gold-400 sm:text-base" style={{ '--i': 6 }}>
        Tuhan Yesus memberkati
      </p>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(null); // absensi yang baru tercatat → tampilkan kolom dukungan doa
  const [thanks, setThanks] = useState(null); // { nama, sent } → layar terima kasih
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const onChange = (e) => {
    const { name } = e.target;
    const value = DIGITS[name] ? e.target.value.replace(/\D/g, '').slice(0, DIGITS[name]) : e.target.value;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name.startsWith('lahir') ? 'lahir' : name]: undefined });
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
      const doc = await api('/attendance', { method: 'POST', body: { ...rest, ulangTahun: lahirHari ? `${lahirBulan}-${lahirHari}` : undefined } });
      setSubmitted({ id: doc._id, npm: doc.npm, nama: doc.nama });
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
      {/* Muat ulang = persis seperti pertama masuk: layar sambutan, posisi paling atas, lagu mulai lagi saat diketuk */}
      {/* manual: tanpa ini browser HP mengembalikan posisi gulir lama setelah muat ulang */}
      {thanks && <Thanks {...thanks} onDone={() => { history.scrollRestoration = 'manual'; location.reload(); }} />}
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

        {submitted ? (
          <Doa entry={submitted} onDone={(sent) => { setThanks({ nama: submitted.nama, sent }); setSubmitted(null); setStatus(null); }} />
        ) : (
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
          <div>
            <p className="mb-1.5 text-sm font-medium text-stone-700">Tanggal Kehadiran</p>
            <p className="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2.5 text-stone-600">
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
              <span className="block text-xs text-stone-500">
                Pukul {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB
              </span>
            </p>
          </div>
          <p className="text-xs text-stone-500">
            Data ini hanya digunakan untuk pelayanan Persekutuan Doa Universitas Gunadarma dan hanya dapat dilihat oleh pengurus.
          </p>
          <Alert type={status?.type}>{status?.msg}</Alert>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? 'Mengirim…' : 'Kirim Kehadiran'}
          </button>
        </form>
        )}

        <p className="animate-enter mt-6 text-center text-sm text-stone-500" style={{ animationDelay: '240ms' }}>
          Pengurus? <Link to="/login" className="font-medium text-brown-700 hover:underline">Masuk di sini</Link>
        </p>
      </div>
    </main>
  );
}
