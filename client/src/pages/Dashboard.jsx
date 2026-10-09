import { useEffect, useState } from 'react';
import { api, formatWIB, todayWIB } from '../api';
import { Alert, Shell, inputCls } from '../components/ui';

export default function Dashboard() {
  const [q, setQ] = useState('');
  const [date, setDate] = useState(todayWIB);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ q, date });
    return api(`/attendance?${params}`)
      .then((data) => { setRows(data); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce ketikan pencarian
    return () => clearTimeout(t);
  }, [q, date]);

  async function remove(row) {
    if (!confirm(`Hapus data kehadiran ${row.nama} (${row.npm})?`)) return;
    try {
      await api(`/attendance/${row._id}`, { method: 'DELETE' });
      setRows(rows.filter((r) => r._id !== row._id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell title="Data Kehadiran">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="search" placeholder="Cari nama atau NPM…" aria-label="Cari nama atau NPM" value={q} onChange={(e) => setQ(e.target.value)} className={`${inputCls} border-stone-300`} />
        <input type="date" aria-label="Filter tanggal" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputCls} border-stone-300 sm:w-48`} />
        {date && <button onClick={() => setDate('')} className="shrink-0 text-sm text-brown-700 hover:underline">Semua tanggal</button>}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-stone-500">
        <span>{loading ? 'Memuat…' : `${rows.length} mahasiswa hadir`}</span>
      </div>
      <div className="mt-2"><Alert>{error}</Alert></div>

      <div className="mt-2 overflow-x-auto rounded-xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            <tr>
              {['No', 'Nama', 'NPM', 'Kelas', 'Kakak Komsel', 'Waktu', ''].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r, i) => (
              <tr key={r._id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-stone-900">{r.nama}</td>
                <td className="px-4 py-3 tabular-nums">{r.npm}</td>
                <td className="px-4 py-3">{r.kelas}</td>
                <td className="px-4 py-3">{r.kakakKomsel}</td>
                <td className="px-4 py-3 whitespace-nowrap text-stone-500">{formatWIB(r.tanggal)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(r)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
            {!loading && !rows.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-stone-500">Belum ada data kehadiran.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
