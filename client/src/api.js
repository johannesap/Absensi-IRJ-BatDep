export const session = {
  get: () => {
    try { return JSON.parse(localStorage.getItem('session')); } catch { return null; }
  },
  set: (s) => localStorage.setItem('session', JSON.stringify(s)),
  clear: () => localStorage.removeItem('session'),
};

export async function api(path, { method = 'GET', body } = {}) {
  const s = session.get();
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const res = await fetch(apiUrl + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(s && { Authorization: `Bearer ${s.token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && s) {
    session.clear();
    location.href = '/login';
  }
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan, coba lagi');
  return data;
}

export const todayWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

export const formatWIB = (date) =>
  new Date(date).toLocaleString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }) + ' WIB';
