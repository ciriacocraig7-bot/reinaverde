"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-ink text-cream relative overflow-hidden">
        <Link href="/" className="font-display italic text-3xl tracking-[-0.04em] leading-none">
          Reina<span className="text-cream/55">·</span>Verde
        </Link>
        <div className="space-y-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/55">
            § Recuperar acceso
          </span>
          <h1 className="font-display font-light text-6xl xl:text-7xl tracking-[-0.035em] leading-[0.92]">
            Olvidó la
            <br />
            <span className="italic">contraseña</span>.
          </h1>
          <p className="font-serif italic text-xl leading-snug max-w-md text-cream/80">
            Pasa. Le enviamos un enlace por correo con instrucciones para crear una nueva.
            El enlace expira en 30 minutos.
          </p>
        </div>
        <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/45">
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
            § 03 — Recuperación
          </span>
          <h2 className="mt-3 font-display font-light tracking-[-0.025em] leading-[0.95] text-ink text-5xl sm:text-6xl">
            Recuperar
            <br />
            <span className="italic">acceso</span>.
          </h2>

          {!done ? (
            <form onSubmit={handleSubmit} className="mt-12 space-y-8">
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="Le enviamos el enlace de recuperación a este correo."
                required
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-14 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft disabled:opacity-50"
              >
                {loading ? "Enviando…" : "Enviar enlace →"}
              </button>
            </form>
          ) : (
            <div className="mt-12 border border-ink/15 p-7 bg-cream-warm">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                Correo enviado
              </span>
              <p className="mt-3 font-serif italic text-[17px] text-ink/85 leading-snug">
                Si {email} está registrado, recibirá un enlace para restablecer la contraseña.
                Revise también su bandeja de spam.
              </p>
              <p className="mt-4 font-mono text-[10.5px] uppercase tracking-wider text-ink/55">
                El enlace expira en 30 minutos.
              </p>
            </div>
          )}

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
