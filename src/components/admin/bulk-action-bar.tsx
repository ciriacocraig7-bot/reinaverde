"use client";

/**
 * <BulkActionBar/> — barra inferior flotante con N seleccionados + acciones.
 *
 * Visible solo cuando count > 0. Acciones declaradas como prop; cada una
 * tiene label + variant + confirm opcional.
 */
import { ActionBtn } from "@/components/dashboard/primitives";

export interface BulkAction {
  key: string;
  label: string;
  variant?: "ink" | "outline" | "marigold" | "iris" | "persimmon" | "danger";
  confirm?: string;
  onRun: () => void | Promise<void>;
}

interface Props {
  count: number;
  onClear: () => void;
  actions: BulkAction[];
}

export function BulkActionBar({ count, onClear, actions }: Props) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-ink text-cream border border-ink shadow-[0_12px_36px_rgba(31,29,26,0.35)] flex items-center gap-3 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/85">
        {count} seleccionado{count > 1 ? "s" : ""}
      </p>
      <span className="text-cream/30">·</span>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <ActionBtn
            key={a.key}
            variant={a.variant ?? "marigold"}
            onClick={async () => {
              if (a.confirm && !confirm(a.confirm)) return;
              await a.onRun();
            }}
            className="h-9 px-4"
          >
            {a.label}
          </ActionBtn>
        ))}
      </div>
      <button
        onClick={onClear}
        className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/55 hover:text-cream transition-colors"
      >
        Limpiar
      </button>
    </div>
  );
}
