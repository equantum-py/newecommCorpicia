'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);

  useEffect(() => {
    async function initializeRecoverySession() {
      if (!supabase) {
        setError('No se pudo iniciar la recuperación. Falta configuración de Supabase.');
        return;
      }

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError('El enlace de recuperación venció o no es válido. Solicitá uno nuevo.');
          return;
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        setSessionReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSessionReady(true);
      } else {
        setError('El enlace de recuperación no es válido o ya venció. Solicitá uno nuevo.');
      }
    }

    initializeRecoverySession();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!supabase || !sessionReady) {
      setError('La sesión de recuperación no está disponible.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError('No pudimos actualizar la contraseña. Solicitá un nuevo enlace e intentá nuevamente.');
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setTimeout(() => router.push('/admin/login'), 1400);
  }

  return (
    <div
      className="relative min-h-[100dvh] flex items-center justify-center w-full overflow-hidden bg-black px-4"
      style={{
        backgroundImage: "url('/images/admin/login-garden-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-[440px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 pt-9 pb-6 flex flex-col items-center border-b border-gray-100/50 bg-white/50">
          <Image
            src="/logo-corpicia.png"
            alt="Corpicia"
            width={130}
            height={65}
            priority
            className="mb-5 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="text-gray-500 text-sm mt-1.5 text-center">
            Creá una nueva contraseña para ingresar al panel administrativo.
          </p>
        </div>

        <div className="px-8 py-8">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-tight">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h2 className="font-bold text-gray-900 text-lg">Contraseña actualizada</h2>
              <p className="text-sm text-gray-500 mt-2">Te estamos llevando al inicio de sesión.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-3.5 text-gray-400"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  placeholder="Repetí la contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="w-full h-12 rounded-xl bg-corpicia-green hover:bg-green-700 disabled:bg-gray-400 text-white font-bold transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}

          <div className="mt-7 text-center">
            <Link href="/admin/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
