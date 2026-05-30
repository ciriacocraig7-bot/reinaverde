"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function RestablecerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-cream">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando…
          </span>
        </div>
      }
    >
      <RestablecerForm />
    </Suspense>
  );
}

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Falta el token en la URL.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo restablecer la contraseña.");
        return;
      }
      setAuth(data.user, data.token);
      toast.success("Contraseña restablecida");
      router.push("/cliente");
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-iris text-cream relative overflow-hidden">
        <Link href="/" className="font-display italic text-3xl tracking-[-0.04em] leading-none">
          Reina<span className="text-cream/55">·</span>Verde
        </Link>
        <div className="space-y-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/65">
            § Nueva contraseña
          </span>
          <h1 className="font-display font-light text-6xl xl:text-7xl tracking-[-0.035em] leading-[0.92]">
            Última
            <br />
            <span className="italic">parada</span>.
          </h1>
          <p className="font-serif italic text-xl leading-snug max-w-md text-cream/85">
            Escriba la nueva contraseña dos veces. Al confirmar quedará iniciada sesión
            automáticamente.
          </p>
        </div>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/55">
          Bogotá, MMXXVI
        </div>
      </aside>

      <section className="flex flex-col justify-center px-6 sm:px-12 py-12 bg-cream">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="lg:hidden font-display italic text-3xl tracking-[-0.04em] mb-12 inline-block"
          >
            Reina·Verde
          </Link>

          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            § 04 — Nueva contraseña
          </span>
          <h2 className="mt-3 font-display font-light tracking-[-0.025em] leading-[0.95] text-ink text-5xl sm:text-6xl">
            Crear
            <br />
            <span className="italic">contraseña</span>.
          </h2>

          {!token && (
            <p className="mt-8 font-serif italic text-error">
              No hay token en la URL. Solicita un nuevo enlace desde{" "}
              <Link href="/recuperar" className="rv-link">recuperación</Link>.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <div className="relative">
              <Input
                id="password"
                label="Nueva contraseña"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-[36px] text-ink/40 hover:text-ink transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <Input
              id="confirm"
              label="Repita la contraseña"
              type="password"
              placeholder="Igual a la anterior"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && (
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-error">
                ✕ {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full h-14 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft disabled:opacity-50"
            >
              {loading ? "Restableciendo…" : "Restablecer →"}
            </button>
          </form>

          <p className="mt-10 font-mono text-[11.5px] uppercase tracking-[0.22em] text-ink/55">
            ¿Recordó la contraseña?{" "}
            <Link href="/login" className="text-ink rv-link">
              Ingresar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
