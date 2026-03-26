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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
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
          const flatErrors: Record<string, string> = {};
          for (const [key, val] of Object.entries(fieldErrors)) {
            flatErrors[key] = Array.isArray(val) ? val[0] : String(val);
          }
          setErrors(flatErrors);
        } else {
          toast.error(data.error || "Error al registrarse");
        }
        return;
      }

      setAuth(data.user, data.token);
      toast.success("¡Cuenta creada exitosamente!");
      router.push("/cliente");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10 editorial-shadow">
        {/* Brand */}
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-emerald-900">Reina Verde</span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Crear Cuenta</h1>
        <p className="text-on-surface-variant text-sm mt-1 mb-6">Regístrate para comenzar a ordenar</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              label="Nombre"
              placeholder="Juan"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              error={errors.firstName}
              required
            />
            <Input
              id="lastName"
              label="Apellido"
              placeholder="Pérez"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              error={errors.lastName}
              required
            />
          </div>
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@empresa.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
            required
          />
          <Input
            id="phone"
            label="Teléfono (opcional)"
            type="tel"
            placeholder="+57 300 123 4567"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
          <div className="relative">
            <Input
              id="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          <Input
            id="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCompany"
              checked={isCompany}
              onChange={(e) => setIsCompany(e.target.checked)}
              className="rounded border-outline-variant/30 text-primary focus:ring-primary-container"
            />
            <label htmlFor="isCompany" className="text-sm text-on-surface-variant">
              Registrar como empresa (B2B)
            </label>
          </div>

          {isCompany && (
            <div className="space-y-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <Input
                id="companyName"
                label="Nombre de la empresa"
                placeholder="Mi Empresa S.A.S"
                value={form.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                required={isCompany}
              />
              <Input
                id="nit"
                label="NIT (opcional)"
                placeholder="900.123.456-7"
                value={form.nit}
                onChange={(e) => updateField("nit", e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> Creando cuenta...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">person_add</span> Crear Cuenta</>
            )}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary-container font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
