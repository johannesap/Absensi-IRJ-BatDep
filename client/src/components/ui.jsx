import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { session } from '../api';

export const inputCls =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-brown-600 focus:outline-none focus:ring-2 focus:ring-brown-600/20 read-only:bg-stone-100 read-only:text-stone-600';

export const btnPrimary =
  'rounded-lg bg-brown-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brown-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-700 disabled:opacity-60';

export const btnGhost = 'rounded-lg px-3 py-1.5 text-sm text-stone-700 ring-1 ring-stone-300 transition-colors hover:bg-stone-100';

export function Field({ label, error, id, type, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className={`${inputCls} ${isPassword ? 'pr-12' : ''} ${error ? 'border-red-500' : 'border-stone-300'}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          // Pesan validasi bawaan browser mengikuti bahasa browser (sering Inggris), jadi diganti bahasa Indonesia
          onInvalid={(e) => {
            const { validity, value, minLength } = e.target;
            e.target.setCustomValidity(
              validity.valueMissing ? 'Kolom ini wajib diisi.'
                : validity.tooShort ? `Minimal ${minLength} karakter (sekarang ${value.length} karakter).`
                : '',
            );
          }}
          onInput={(e) => e.target.setCustomValidity('')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Sembunyikan password' : 'Lihat password'}
            title={show ? 'Sembunyikan password' : 'Lihat password'}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-stone-500 hover:text-stone-800 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brown-700"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {show && <path d="M3 3l18 18" />}
            </svg>
          </button>
        )}
      </div>
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Alert({ type = 'error', children }) {
  if (!children) return null;
  const cls = type === 'success' ? 'bg-teal-50 text-teal-800 ring-teal-200' : 'bg-red-50 text-red-700 ring-red-200';
  return <p role="status" className={`rounded-lg px-3 py-2.5 text-sm ring-1 ${cls}`}>{children}</p>;
}

export function Cross({ className = '' }) {
  return (
    <svg viewBox="0 0 24 32" aria-hidden="true" className={className} fill="currentColor">
      <rect x="10" y="0" width="4" height="32" rx="1" />
      <rect x="2" y="8" width="20" height="4" rx="1" />
    </svg>
  );
}

// Kerangka halaman yang butuh login
export function Shell({ title, children }) {
  const s = session.get();
  const navigate = useNavigate();
  const tab = ({ isActive }) => `rounded-md px-2.5 py-1.5 ${isActive ? 'bg-white/15 font-medium text-white' : 'text-brown-100 hover:text-white'}`;
  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-gold-400 bg-brown-800 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Cross className="h-7 w-5 text-gold-400" />
            <div>
              <p className="text-xs text-gold-100/80">PD Universitas Gunadarma</p>
              <h1 className="font-semibold">{title}</h1>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            {s.role === 'admin' && (
              <>
                <NavLink to="/penggembalaan" className={tab}>Kehadiran</NavLink>
                <NavLink to="/admin" className={tab}>Akun</NavLink>
              </>
            )}
            {s.role === 'penggembalaan' && (
              <>
                <NavLink to="/penggembalaan" className={tab}>Kehadiran</NavLink>
                <NavLink to="/password" className={tab}>Ganti Password</NavLink>
              </>
            )}
            <span className="hidden px-2 text-brown-100 sm:inline">{s.name}</span>
            <button className="rounded-lg px-3 py-1.5 text-sm ring-1 ring-white/30 transition-colors hover:bg-white/10" onClick={() => { session.clear(); navigate('/login'); }}>Keluar</button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
