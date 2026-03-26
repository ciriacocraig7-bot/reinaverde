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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details.fieldErrors || {});
        } else {
          toast.error(data.error || "Error al iniciar sesión");
        }
        return;
      }

      setAuth(data.user, data.token);
      toast.success("¡Bienvenido de vuelta!");
      router.push(getRoleDashboardPath(data.user.role as Role));
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-surface-container-high/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10 editorial-shadow">
          {/* Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-emerald-900">Reina Verde</span>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Iniciar Sesión</h1>
            <p className="text-sm text-on-surface-variant mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="absolute right-3 top-[34px] text-on-surface-variant/50 hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Ingresando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  Ingresar
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-primary-container font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-3 opacity-50">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">verified_user</span>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            Conexión segura protegida
          </p>
        </div>
      </div>
    </div>
  );
}
