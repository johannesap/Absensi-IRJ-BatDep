import { useState } from 'react';
import { api } from '../api';
import { Alert, Field, Shell, btnPrimary } from '../components/ui';

const EMPTY = { oldPassword: '', newPassword: '', confirm: '' };

export default function Password() {
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setMsg({ type: 'error', text: 'Ulangi password baru dengan benar.' });
    setMsg(null);
    setSaving(true);
    try {
      await api('/auth/password', { method: 'PUT', body: { oldPassword: form.oldPassword, newPassword: form.newPassword } });
      setForm(EMPTY);
      setMsg({ type: 'success', text: 'Password berhasil diganti.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="Ganti Password">
      <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-5 ring-1 ring-stone-200">
        <Field id="oldPassword" name="oldPassword" type="password" label="Password lama" autoComplete="current-password" required value={form.oldPassword} onChange={onChange} />
        <Field id="newPassword" name="newPassword" type="password" label="Password baru (min. 10 karakter)" autoComplete="new-password" minLength={10} required value={form.newPassword} onChange={onChange} />
        <Field id="confirm" name="confirm" type="password" label="Ulangi password baru" autoComplete="new-password" required value={form.confirm} onChange={onChange} />
        <Alert type={msg?.type}>{msg?.text}</Alert>
        <button disabled={saving} className={`${btnPrimary} w-full`}>{saving ? 'Menyimpan…' : 'Simpan'}</button>
      </form>
    </Shell>
  );
}
