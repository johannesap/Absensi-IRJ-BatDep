// sessionStorage dihapus browser saat tab/browser ditutup, jadi user otomatis keluar dari akun
export const session = {
  get: () => {
    try { return JSON.parse(sessionStorage.getItem('session')); } catch { return null; }
  },
  set: (s) => sessionStorage.setItem('session', JSON.stringify(s)),
  clear: () => sessionStorage.removeItem('session'),
};

// ponytail: buang sesi lama dari versi yang masih memakai localStorage; boleh dihapus setelah beberapa minggu
try { localStorage.removeItem('session'); } catch { /* storage diblokir */ }

export async function api(path, { method = 'GET', body } = {}) {
  const s = session.get();
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const res = await fetch(apiUrl + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(s && { Authorization: `Bearer ${s.token}` }) },
    body: body && JSON.stringify(body),
  }).catch(() => {
    // fetch hanya gagal begini jika browser tidak bisa menghubungi situs sama sekali (internet putus, server lokal mati)
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet, lalu coba lagi.');
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && s) {
    session.clear();
    location.href = '/login';
  }
  // Tanpa `message` + status 5xx = API mati / tidak terjangkau (proxy Vite membalas 500 kosong)
  if (!res.ok) throw new Error(data.message || (res.status >= 500 ? 'Server tidak dapat dihubungi, coba lagi nanti' : 'Terjadi kesalahan, coba lagi'));
  return data;
}

export const todayWIB = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
