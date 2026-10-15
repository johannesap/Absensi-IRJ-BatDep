import { useEffect, useState } from 'react';
import { api, todayWIB } from '../api';
import { Alert, Shell, btnGhost, inputCls } from '../components/ui';

const PER_PAGE = 5;

// Data lama (sebelum ada kolom WhatsApp) tidak punya nomor
const Wa = ({ n }) =>
  n ? <a href={`https://wa.me/${n}`} target="_blank" rel="noreferrer" className="tabular-nums text-brown-700 hover:underline">+{n}</a> : '–';

// "MM-DD" → "15 Oktober"; opsional, jadi bisa kosong
const ultah = (v) =>
  v ? new Date(2000, v.slice(0, 2) - 1, v.slice(3)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : '–';

// "15 Oktober 2026" dengan jam ("20.33 WIB") kecil di bawahnya
const TanggalJam = ({ d }) => (
  <>
    {new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
    <span className="block text-xs text-stone-400">
      {new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })} WIB
    </span>
  </>
);

const DoaText =({ text, className = '' }) => (
  <p className={`whitespace-pre-line break-words rounded-lg bg-gold-100/50 px-3 py-2 text-sm text-stone-700 ${className}`}>
    <span className="font-medium text-brown-800">Dukungan doa: </span>{text}
  </p>
);

export default function Dashboard() {
  const [q, setQ] = useState('');
  const [date, setDate] = useState(todayWIB);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Dibatasi ke halaman terakhir yang ada, karena data bisa berkurang setelah hapus/refresh otomatis
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const p = Math.min(page, pages - 1);
  const shown = rows.slice(p * PER_PAGE, (p + 1) * PER_PAGE);

  // silent: refresh otomatis di latar, tanpa menampilkan "Memuat…"
  const load = (silent) => {
    if (!silent) setLoading(true);
    return Promise.all([
      api(`/attendance?${new URLSearchParams({ q, date })}`),
      api(`/attendance/count?${new URLSearchParams({ date })}`),
    ])
      .then(([data, { count }]) => { setRows(data); setTotal(count); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(0);
    const t = setTimeout(load, 300); // debounce ketikan pencarian
    const timer = setInterval(() => !document.hidden && load(true), 15000);
    return () => { clearTimeout(t); clearInterval(timer); };
  }, [q, date]);

  async function remove(row) {
    if (!confirm(`Hapus data kehadiran ${row.nama} (${row.npm})?`)) return;
    try {
      await api(`/attendance/${row._id}`, { method: 'DELETE' });
      setRows(rows.filter((r) => r._id !== row._id));
      setTotal((n) => n - 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell title="Data Kehadiran">
      <section aria-live="polite" className="mb-4 rounded-xl bg-white p-4 ring-1 ring-stone-200">
        <p className="text-sm text-stone-500">
          Hadir · {date
            ? new Date(`${date}T00:00:00+07:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
            : 'semua tanggal'}
        </p>
        <p className="mt-1 text-brown-800">
          <span className="text-4xl font-semibold tabular-nums">{total ?? '–'}</span> mahasiswa
        </p>
        <p className="mt-1 text-xs text-stone-400">Diperbarui otomatis setiap 15 detik</p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" placeholder="Cari nama atau NPM…" aria-label="Cari nama atau NPM" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} border-stone-300`} />
        <input type="date" aria-label="Filter tanggal" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} border-stone-300 sm:w-48`} />
        {date && <button onClick={() => setDate('')} className="shrink-0 self-start py-2 text-sm text-brown-700 hover:underline sm:self-center">Semua tanggal</button>}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
        <span>{loading ? 'Memuat…' : q && `${rows.length} hasil pencarian`}</span>
      </div>
      <div className="mt-2"><Alert>{error}</Alert></div>

      {/* HP: kartu per mahasiswa, tanpa geser ke samping */}
      <ul className="mt-2 space-y-2 md:hidden">
        {shown.map((r, i) => (
          <li key={r._id} className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words font-medium text-stone-900">{p * PER_PAGE + i + 1}. {r.nama}</p>
                <p className="text-sm tabular-nums text-stone-500">{r.npm} · {r.kelas}</p>
              </div>
              <button onClick={() => remove(r)} className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50">Hapus</button>
            </div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-sm">
              <dt className="text-stone-500">WhatsApp</dt><dd><Wa n={r.whatsapp} /></dd>
              <dt className="text-stone-500">Ulang Tahun</dt><dd>{ultah(r.ulangTahun)}</dd>
              <dt className="text-stone-500">Kakak Komsel</dt><dd className="break-words">{r.kakakKomsel}</dd>
              <dt className="text-stone-500">Tanggal</dt><dd><TanggalJam d={r.tanggal} /></dd>
            </dl>
            {r.dukunganDoa && <DoaText text={r.dukunganDoa} className="mt-3" />}
          </li>
        ))}
        {!loading && !rows.length && <li className="rounded-xl bg-white px-4 py-10 text-center text-stone-500 ring-1 ring-stone-200">Belum ada data kehadiran.</li>}
      </ul>

      <div className="mt-2 hidden overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {['No', 'Nama', 'NPM', 'Kelas', 'WhatsApp', 'Ulang Tahun', 'Kakak Komsel', 'Tanggal', 'Dukungan Doa', ''].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {shown.map((r, i) => (
              <tr key={r._id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-400">{p * PER_PAGE + i + 1}</td>
                <td className="px-4 py-3 font-medium text-stone-900">{r.nama}</td>
                <td className="px-4 py-3 tabular-nums">{r.npm}</td>
                <td className="px-4 py-3">{r.kelas}</td>
                <td className="px-4 py-3 whitespace-nowrap"><Wa n={r.whatsapp} /></td>
                <td className="px-4 py-3 whitespace-nowrap">{ultah(r.ulangTahun)}</td>
                <td className="px-4 py-3">{r.kakakKomsel}</td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-500"><TanggalJam d={r.tanggal} /></td>
                <td className="min-w-44 max-w-xs px-4 py-3 whitespace-pre-line break-words">{r.dukunganDoa || '–'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(r)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
            {!loading && !rows.length && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-stone-500">Belum ada data kehadiran.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav aria-label="Halaman data kehadiran" className="mt-3 flex items-center justify-center gap-3 text-sm">
          <button onClick={() => setPage(p - 1)} disabled={p === 0} className={`${btnGhost} disabled:opacity-40`}>‹ Sebelumnya</button>
          <span className="tabular-nums text-stone-500">Halaman {p + 1} dari {pages}</span>
          <button onClick={() => setPage(p + 1)} disabled={p === pages - 1} className={`${btnGhost} disabled:opacity-40`}>Berikutnya ›</button>
        </nav>
      )}
    </Shell>
  );
}
