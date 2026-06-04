"use client";

/**
 * /feedback/[orderId]
 *
 * Formulario público de feedback post-evento. El cliente llega aquí
 * desde el email que se envía 48h post-entrega. No requiere login
 * (el link funciona como token de acceso).
 *
 * Editorial: "Queremos saber cómo fue."
 */
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

export default function FeedbackPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = foodRating > 0 && serviceRating > 0 && overallRating > 0;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderId,
          foodRating,
          serviceRating,
          overallRating,
          comment: comment.trim() || undefined,
          isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SiteHeader line="catering" />
        <section className="max-w-[1200px] mx-auto px-6 sm:px-10 py-24 sm:py-32 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
            § Feedback recibido
          </p>
          <h1 className="font-display font-light text-5xl sm:text-7xl tracking-[-0.03em] leading-[0.92] text-ink mb-6">
            Gracias por
            <br />
            <span className="italic">su opinión</span>
            <span className="text-marigold">.</span>
          </h1>
          <p className="font-serif italic text-xl text-ink/70 leading-snug max-w-xl mx-auto mb-10">
            Su feedback nos permite iterar. Cada evento siguiente sale mejor
            que el anterior — eso es un compromiso, no un slogan.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/catering"
              className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft transition-colors"
            >
              Volver a Catering →
            </Link>
          </div>
        </section>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader line="catering" />

      <section className="max-w-[900px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
          § Feedback post-evento
        </p>
        <h1 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl tracking-[-0.03em] leading-[0.92] text-ink mb-6">
          Queremos saber
          <br />
          <span className="italic">cómo fue</span>
          <span className="text-marigold">.</span>
        </h1>
        <p className="font-serif italic text-xl text-ink/70 leading-snug max-w-2xl mb-16">
          Tres calificaciones rápidas y un comentario libre. Toma menos de
          un minuto. Su opinión moldea los próximos eventos.
        </p>

        <div className="space-y-10">
          {/* Rating rows */}
          <RatingRow
            label="Comida"
            sublabel="Sabor, frescura, presentación del plato"
            value={foodRating}
            onChange={setFoodRating}
          />
          <RatingRow
            label="Servicio"
            sublabel="Puntualidad, montaje, atención del staff"
            value={serviceRating}
            onChange={setServiceRating}
          />
          <RatingRow
            label="Experiencia general"
            sublabel="¿Cómo lo resume en una sola nota?"
            value={overallRating}
            onChange={setOverallRating}
          />

          {/* Comment */}
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
              § Comentario libre (opcional)
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="¿Qué le gustó más? ¿Qué mejoraríamos? Cualquier detalle nos ayuda."
              className="w-full px-4 py-3 border border-ink/25 bg-cream font-serif text-base text-ink focus:outline-none focus:border-ink min-h-[140px] leading-relaxed"
            />
          </div>

          {/* Public toggle */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1"
            />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                Permitir que mi comentario aparezca en la web
              </p>
              <p className="font-serif italic text-[13px] text-ink/65 leading-snug mt-1">
                Solo se mostrará su nombre de pila e inicial del apellido.
                Sin email, sin empresa, sin datos privados.
              </p>
            </div>
          </label>

          {/* Submit */}
          <button
            disabled={!canSubmit || submitting}
            onClick={onSubmit}
            className="w-full h-14 bg-ink text-cream font-sans text-[15px] tracking-tight rv-press disabled:opacity-50 hover:bg-ink-soft transition-colors"
          >
            {submitting ? "Enviando…" : "Enviar feedback"}
          </button>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function RatingRow({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="border-b border-ink/15 pb-8">
      <p className="font-display text-2xl sm:text-3xl tracking-tight text-ink leading-tight mb-1">
        {label}
      </p>
      <p className="font-serif italic text-[14px] text-ink/65 leading-snug mb-5">
        {sublabel}
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "h-14 w-14 sm:h-16 sm:w-16 border-2 font-display text-2xl sm:text-3xl tabular transition-all duration-150",
              n <= value
                ? "bg-marigold border-marigold text-ink scale-105"
                : "bg-cream border-ink/20 text-ink/40 hover:border-ink hover:text-ink",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
