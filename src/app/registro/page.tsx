"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    nit: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          companyName: isCompany ? form.companyName : undefined,
          nit: isCompany ? form.nit : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const fieldErrors = data.details.fieldErrors || {};
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(fieldErrors)) {
            flat[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setErrors(flat);
        } else toast.error(data.error || "Error al registrarse");
        return;
      }
      setAuth(data.user, data.token);
      toast.success("Cuenta creada");
      router.push("/cliente");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-marigold text-ink relative overflow-hidden">
        <Link href="/" className="font-display italic text-3xl tracking-[-0.04em] leading-none">
          Reina<span className="text-ink/55">·</span>Verde
        </Link>

        <div className="space-y-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/65">
            § Abrir cuenta
          </span>
          <h1 className="font-display font-light text-6xl xl:text-7xl tracking-[-0.035em] leading-[0.92]">
            Una cuenta,
            <br />
            tres <span className="italic">divisiones</span>.
          </h1>
          <p className="font-serif italic text-xl leading-snug max-w-md text-ink/80">
            Con un solo registro accede a Catering, Pharma y Liofilizados. Sus pedidos,
            eventos, facturas y seguimientos viven en un solo panel.
          </p>

          <ul className="border-t border-ink/15 pt-6 space-y-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/65">
            <li>◇ Cero costos por abrir cuenta</li>
            <li>◇ Facturación electrónica DIAN</li>
            <li>◇ Soporte por correo y WhatsApp</li>
          </ul>
        </div>

        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Bogotá, MMXXVI
        </div>
      </aside>

      <section className="flex flex-col justify-center px-6 sm:px-12 py-12 bg-cream">
        <div className="w-full max-w-lg mx-auto">
          <Link
            href="/"
            className="lg:hidden font-display italic text-3xl tracking-[-0.04em] mb-12 inline-block"
          >
            Reina·Verde
          </Link>

          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            § 02 — Registro
          </span>
          <h2 className="mt-3 font-display font-light tracking-[-0.025em] leading-[0.95] text-ink text-5xl sm:text-6xl">
            Abra
            <br />
            <span className="italic">cuenta</span>.
          </h2>

          <form onSubmit={handleSubmit} className="mt-10 space-y-7">
            <div className="grid sm:grid-cols-2 gap-6">
              <Input id="firstName" label="Nombre" placeholder="María"
                value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)}
                error={errors.firstName} required />
              <Input id="lastName" label="Apellido" placeholder="Pérez"
                value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)}
                error={errors.lastName} required />
            </div>
            <Input id="email" label="Correo electrónico" type="email" placeholder="tu@empresa.com"
              value={form.email} onChange={(e) => updateField("email", e.target.value)}
              error={errors.email} required />
            <Input id="phone" label="Teléfono (opcional)" type="tel" placeholder="+57 300 123 4567"
              value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <div className="relative">
              <Input id="password" label="Contraseña" type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres" value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                error={errors.password} required />
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
            <Input id="confirmPassword" label="Confirmar contraseña" type="password"
              placeholder="Repite la contraseña" value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              error={errors.confirmPassword} required />

            {/* B2B toggle */}
            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <span
                className={`h-5 w-5 border border-ink/40 flex items-center justify-center transition-colors ${isCompany ? "bg-ink" : "bg-transparent"}`}
              >
                {isCompany && (
                  <span className="material-symbols-outlined text-cream text-[14px]">check</span>
                )}
              </span>
              <input
                type="checkbox"
                checked={isCompany}
                onChange={(e) => setIsCompany(e.target.checked)}
                className="sr-only"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/75">
                Registrar como empresa (B2B)
              </span>
            </label>

            {isCompany && (
              <div className="space-y-6 border-l-2 border-marigold pl-6">
                <Input id="companyName" label="Nombre de la empresa" placeholder="Mi Empresa S.A.S"
                  value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)}
                  required />
                <Input id="nit" label="NIT (opcional)" placeholder="900.123.456-7"
                  value={form.nit} onChange={(e) => updateField("nit", e.target.value)} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft disabled:opacity-50"
            >
              {loading ? "Creando cuenta…" : "Crear cuenta →"}
            </button>
          </form>

          <p className="mt-10 font-mono text-[11.5px] uppercase tracking-[0.22em] text-ink/55">
            ¿Ya tiene cuenta?{" "}
            <Link href="/login" className="text-ink rv-link">
              Ingresar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
