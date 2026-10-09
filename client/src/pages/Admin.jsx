import { useEffect, useState } from 'react';
import { api } from '../api';
import { Alert, Field, Shell, btnGhost, btnPrimary } from '../components/ui';

const EMPTY = { name: '', username: '', password: '' };

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/users').then(setUsers).catch((err) => setMsg({ type: 'error', text: err.message }));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setForm(EMPTY); setEditId(null); };

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      if (editId) {
        const user = await api(`/users/${editId}`, { method: 'PUT', body: form });
        setUsers(users.map((u) => (u._id === editId ? user : u)));
        setMsg({ type: 'success', text: 'Akun diperbarui.' });
      } else {
        const user = await api('/users', { method: 'POST', body: form });
        setUsers([user, ...users]);
        setMsg({ type: 'success', text: 'Akun dibuat.' });
      }
      reset();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove(u) {
    if (!confirm(`Hapus akun ${u.name} (${u.username})?`)) return;
    try {
      await api(`/users/${u._id}`, { method: 'DELETE' });
      setUsers(users.filter((x) => x._id !== u._id));
      if (editId === u._id) reset();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  }

  return (
    <Shell title="Manajemen Akun Pendataan">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <form onSubmit={onSubmit} className="h-fit space-y-4 rounded-xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="font-semibold text-stone-900">{editId ? 'Edit Akun' : 'Tambah Akun'}</h2>
          <Field id="name" name="name" label="Nama" required value={form.name} onChange={onChange} />
          <Field id="username" name="username" label="Username" required autoComplete="off" value={form.username} onChange={onChange} />
          <Field
            id="password" name="password" type="password" autoComplete="new-password" minLength={6}
            label={editId ? 'Password baru (kosongkan jika tidak diubah)' : 'Password'}
            required={!editId} value={form.password} onChange={onChange}
          />
          <Alert type={msg?.type}>{msg?.text}</Alert>
          <div className="flex gap-2">
            <button disabled={saving} className={`${btnPrimary} flex-1`}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
            {editId && <button type="button" onClick={reset} className={btnGhost}>Batal</button>}
          </div>
        </form>

        <ul className="divide-y divide-stone-100 self-start rounded-xl bg-white ring-1 ring-stone-200">
          {users.map((u) => (
            <li key={u._id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-900">{u.name}</p>
                <p className="truncate text-sm text-stone-500">@{u.username}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => { setEditId(u._id); setForm({ name: u.name, username: u.username, password: '' }); setMsg(null); }} className={btnGhost}>Edit</button>
                <button onClick={() => remove(u)} className="rounded-lg px-3 py-1.5 text-sm text-red-600 ring-1 ring-red-200 hover:bg-red-50">Hapus</button>
              </div>
            </li>
          ))}
          {!users.length && <li className="px-4 py-10 text-center text-stone-500">Belum ada akun pendataan.</li>}
        </ul>
      </div>
    </Shell>
  );
}
