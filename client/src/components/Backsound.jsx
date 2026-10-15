import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

// Lagu latar "Praise" – Elevation Worship (client/public/praise.mp3). Dipasang di luar <Routes> supaya tetap
// berputar saat pindah halaman (mis. ke login pengurus). Browser memblokir suara sebelum pengunjung berinteraksi,
// jadi lagu diputar pada klik/tombol pertama di halaman absensi. Listener "click" (bukan pointerdown) supaya klik
// pertama pada tombol Jeda/Putar tidak langsung memutar lalu menjeda lagi.
export default function Backsound() {
  const audio = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const off = () => {
      window.removeEventListener('click', start);
      window.removeEventListener('keydown', start);
    };
    const start = () => {
      if (location.pathname !== '/') return; // halaman pengurus yang dibuka langsung tidak memulai lagu
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
      <audio ref={audio} src="/praise.mp3" loop preload="none" onPlay={() => { setPlaying(true); setStarted(true); }} onPause={() => setPlaying(false)} />
      {/* Di halaman pengurus tombol hanya muncul jika lagu sudah pernah diputar, supaya bisa dijeda/diputar lagi */}
      {(pathname === '/' || started) && (
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
      )}
    </>
  );
}
