"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { getRoleDashboardPath } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) setErrors(data.details.fieldErrors || {});
        else toast.error(data.error || "Error al iniciar sesión");
        return;
      }
      setAuth(data.user, data.token);
      toast.success("Bienvenido de vuelta");
      router.push(getRoleDashboardPath(data.user.role as Role));
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — editorial intro panel */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-ink text-cream relative overflow-hidden">
        <Link href="/" className="font-display italic text-3xl tracking-[-0.04em] leading-none">
          Reina<span className="text-cream/55">·</span>Verde
        </Link>

        <div className="space-y-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/55">
            § Acceso a la casa
          </span>
          <h1 className="font-display font-light text-6xl xl:text-7xl tracking-[-0.035em] leading-[0.92]">
            Bienvenido
            <br />
            de <span className="italic">vuelta</span>.
          </h1>
          <p className="font-serif italic text-xl leading-snug max-w-md text-cream/80">
            Su panel le espera con los pedidos pendientes, las cotizaciones abiertas y las
            facturas del trimestre. Una sola cuenta para las tres divisiones.
          </p>
        </div>

        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/45 flex items-center gap-3">
          <span className="h-1 w-1 rounded-full bg-marigold" />
          <span>Compuesto en Fraunces & Geist</span>
        </div>
      </aside>

      {/* Right — form */}
      <section className="flex flex-col justify-center px-6 sm:px-12 py-12 bg-cream">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="lg:hidden font-display italic text-3xl tracking-[-0.04em] mb-12 inline-block"
          >
            Reina·Verde
          </Link>

          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            § 01 — Ingreso
          </span>
          <h2 className="mt-3 font-display font-light tracking-[-0.025em] leading-[0.95] text-ink text-5xl sm:text-6xl">
            Inicie
            <br />
            <span className="italic">sesión</span>.
          </h2>

          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <Input
              id="email"
              label="Correo electrónico"
              type="email"
              placeholder="tu@empresa.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
            />
            <div className="relative">
              <Input
                id="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft disabled:opacity-50"
            >
              {loading ? "Ingresando…" : "Ingresar →"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between">
            <p className="font-mono text-[11.5px] uppercase tracking-[0.22em] text-ink/55">
              ¿No tiene cuenta?{" "}
              <Link href="/registro" className="text-ink rv-link">
                Abrir cuenta
              </Link>
            </p>
            <Link
              href="/recuperar"
              className="font-mono text-[11.5px] uppercase tracking-[0.22em] text-ink/55 hover:text-ink rv-link"
            >
              ¿Olvidó la clave?
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
