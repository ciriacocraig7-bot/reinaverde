"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DashHeader,
  StatBlock,
  Panel,
  StatusPill,
  ActionBtn,
} from "@/components/dashboard/primitives";

const PRODUCTION_ORDERS = [
  { id: "RV-ABC123", event: "Almuerzo TechCorp",         items: ["15× Bandeja paisa", "10× Salmón maracuyá", "5× Bowl vegano", "25× Tres leches"], guests: 30,  deliveryTime: "12:00", deliveryDate: "28 mar", status: "IN_PROGRESS", priority: "high" },
  { id: "RV-DEF456", event: "Desayuno directivos",       items: ["20× Empanadas", "15× Ensalada Caesar", "20× Café premium"],                       guests: 20,  deliveryTime: "08:00", deliveryDate: "29 mar", status: "PENDING",     priority: "high" },
  { id: "RV-GHI789", event: "Coffee break Innovatech",   items: ["30× Tabla de quesos", "30× Jugo natural", "30× Mousse chocolate"],                 guests: 30,  deliveryTime: "15:00", deliveryDate: "29 mar", status: "PENDING",     priority: "medium" },
  { id: "RV-JKL012", event: "Boda López-García",         items: ["60× Salmón maracuyá", "40× Pollo champiñones", "20× Bowl vegano", "120× Tres leches"], guests: 120, deliveryTime: "18:00", deliveryDate: "05 abr", status: "PENDING",     priority: "low" },
];

const LOW_STOCK = [
  { name: "Salmón fresco",  stock: "2 kg",  min: "5 kg" },
  { name: "Maracuyá",       stock: "1 kg",  min: "3 kg" },
  { name: "Chocolate 70%",  stock: "500 g", min: "2 kg" },
];

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "muted" }> = {
  PENDING:       { label: "Pendiente",     tone: "warn" },
  IN_PROGRESS:   { label: "En cocina",     tone: "info" },
  QUALITY_CHECK: { label: "QA",            tone: "info" },
  COMPLETED:     { label: "Completado",    tone: "success" },
};

const PRIORITY_TAG: Record<string, { label: string; tone: "danger" | "warn" | "info" }> = {
  high:   { label: "P0 · Alta",   tone: "danger" },
  medium: { label: "P1 · Media",  tone: "warn"   },
  low:    { label: "P2 · Baja",   tone: "info"   },
};

export default function ChefDashboard() {
  const [orders, setOrders] = useState(PRODUCTION_ORDERS);

  const handleStart = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "IN_PROGRESS" } : o));
    toast.success(`Producción iniciada · ${id}`);
  };

  const handleComplete = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "COMPLETED" } : o));
    toast.success(`Producción completada · ${id}`);
  };

  const pending  = orders.filter((o) => o.status === "PENDING").length;
  const inProg   = orders.filter((o) => o.status === "IN_PROGRESS").length;
  const done     = orders.filter((o) => o.status === "COMPLETED").length;

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Cocina · Producción"
        title={<>Cola de <span className="italic">producción</span><span className="text-marigold">.</span></>}
        date={today}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-ink/15">
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Pendientes"     value={String(pending)}         meta="por iniciar"   trend="warn" accent="marigold" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="En cocina"      value={String(inProg)}          meta="activos ahora" trend="up" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Completados"    value={String(done)}            meta="hoy"           trend="up" accent="ink" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Stock crítico"  value={String(LOW_STOCK.length)} meta="ingredientes"  trend="warn" accent="persimmon" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Production queue */}
        <Panel index="01" title="Cola de producción" meta={`${orders.length} órdenes`}>
          <ul className="divide-y divide-ink/10">
            {orders.map((o, i) => {
              const status = STATUS_MAP[o.status] || { label: o.status, tone: "muted" as const };
              const prio   = PRIORITY_TAG[o.priority] || { label: "—", tone: "muted" as const };
              return (
                <li key={o.id} className="px-6 py-5 hover:bg-cream-warm transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-5">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/45 tabular pt-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-display text-2xl tracking-tight text-ink leading-tight">
                          {o.event}
                        </p>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-ink/55 mt-1">
                          {o.id} · {o.guests} pax · {o.deliveryDate} · {o.deliveryTime}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <StatusPill tone={prio.tone}    label={prio.label} />
                          <StatusPill tone={status.tone}  label={status.label} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {o.status === "PENDING" && (
                        <ActionBtn variant="marigold" onClick={() => handleStart(o.id)} className="h-9 px-4">
                          ▶ Iniciar
                        </ActionBtn>
                      )}
                      {o.status === "IN_PROGRESS" && (
                        <ActionBtn variant="ink" onClick={() => handleComplete(o.id)} className="h-9 px-4">
                          ✓ Completar
                        </ActionBtn>
                      )}
                    </div>
                  </div>
                  <ul className="flex flex-wrap gap-1.5 pl-12">
                    {o.items.map((item) => (
                      <li
                        key={item}
                        className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/65 border border-ink/15 bg-cream px-2 py-[3px]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Low stock sidebar */}
        <div className="space-y-6">
          <Panel index="02" title="Stock crítico" meta="reordenar">
            <ul className="divide-y divide-ink/10">
              {LOW_STOCK.map((item, i) => (
                <li key={item.name} className="px-6 py-4 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-persimmon tabular">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-display text-lg text-ink tracking-tight leading-none">
                        {item.name}
                      </p>
                      <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55 mt-1">
                        {item.stock} / mín {item.min}
                      </p>
                    </div>
                  </div>
                  <StatusPill tone="danger" label="Bajo" />
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 border-t border-ink/15">
              <ActionBtn
                variant="persimmon"
                className="w-full"
                onClick={() => toast.success("Solicitud enviada al proveedor")}
              >
                Solicitar reabastecimiento
              </ActionBtn>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
