"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DashHeader,
  StatBlock,
  Panel,
  StatusPill,
  ActionBtn,
} from "@/components/dashboard/primitives";

const DELIVERIES = [
  { id: "RV-ABC123", client: "TechCorp S.A.S",  address: "Calle 100 #15-20, Of. 501, Bogotá", time: "12:00", date: "28 mar 2026", status: "EN_ROUTE", phone: "+57 301 234 5678" },
  { id: "RV-GHI789", client: "Innovatech",       address: "Cra 7 #72-41, Piso 8, Bogotá",      time: "15:00", date: "28 mar 2026", status: "ASSIGNED", phone: "+57 302 345 6789" },
  { id: "RV-JKL012", client: "StartUp Labs",     address: "Calle 26 #69D-91, Torre 3, Bogotá", time: "18:00", date: "28 mar 2026", status: "PENDING",  phone: "+57 303 456 7890" },
];

const ASSIGNMENTS = [
  { event: "Almuerzo TechCorp",          role: "Mesero principal", date: "28 mar", time: "11:00–14:00" },
  { event: "Coffee break Innovatech",    role: "Logística",        date: "29 mar", time: "14:00–17:00" },
  { event: "Boda López-García",          role: "Mesero",           date: "5 abr",  time: "17:00–23:00" },
];

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "muted" }> = {
  PENDING:   { label: "Pendiente",  tone: "muted"   },
  ASSIGNED:  { label: "Asignada",   tone: "info"    },
  EN_ROUTE:  { label: "En ruta",    tone: "warn"    },
  ARRIVED:   { label: "En sitio",   tone: "info"    },
  COMPLETED: { label: "Completada", tone: "success" },
};

export default function StaffDashboard() {
  const [deliveries, setDeliveries] = useState(DELIVERIES);

  const startRoute = (id: string) => {
    setDeliveries((p) => p.map((d) => d.id === id ? { ...d, status: "EN_ROUTE" } : d));
    toast.success(`Ruta iniciada · ${id}`);
  };

  const markArrival = (id: string) => {
    setDeliveries((p) => p.map((d) => d.id === id ? { ...d, status: "ARRIVED" } : d));
    toast.success(`Llegada marcada · ${id}`);
  };

  const callClient = (phone: string, client: string) => {
    window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
    toast.info(`Llamando a ${client}…`);
  };

  const enRoute = deliveries.filter((d) => d.status === "EN_ROUTE").length;
  const done    = deliveries.filter((d) => d.status === "COMPLETED" || d.status === "ARRIVED").length;

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Logística · Entregas"
        title={<>Ruta del <span className="italic">día</span><span className="text-iris">.</span></>}
        date={today}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-ink/15">
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Entregas hoy"        value={String(deliveries.length)} meta="programadas" trend="flat" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="En ruta"             value={String(enRoute)}           meta="ahora"       trend="warn" accent="iris" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Completadas"         value={String(done)}              meta="confirmadas" trend="up" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Eventos semana"      value={String(ASSIGNMENTS.length)} meta="asignados"  trend="flat" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Panel index="01" title="Entregas del día" meta={`${deliveries.length} programadas`}>
          <ul className="divide-y divide-ink/10">
            {deliveries.map((d, i) => {
              const status = STATUS_MAP[d.status] || { label: d.status, tone: "muted" as const };
              return (
                <li key={d.id} className="px-6 py-5 hover:bg-cream-warm transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-5">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/45 tabular pt-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-display text-2xl tracking-tight text-ink leading-none">
                            {d.client}
                          </p>
                          <StatusPill tone={status.tone} label={status.label} />
                        </div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-ink/55 mt-1.5">
                          {d.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl tabular text-ink leading-none">{d.time}</p>
                      <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55 mt-1">
                        {d.date}
                      </p>
                    </div>
                  </div>
                  <p className="font-serif italic text-[15px] text-ink/75 leading-snug pl-12 mb-4">
                    {d.address}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pl-12">
                    {d.status === "ASSIGNED" && (
                      <ActionBtn variant="iris" onClick={() => startRoute(d.id)} className="h-9 px-4">
                        Iniciar ruta →
                      </ActionBtn>
                    )}
                    {d.status === "EN_ROUTE" && (
                      <ActionBtn variant="ink" onClick={() => markArrival(d.id)} className="h-9 px-4">
                        ✓ Marcar llegada
                      </ActionBtn>
                    )}
                    <ActionBtn variant="outline" onClick={() => callClient(d.phone, d.client)} className="h-9 px-4">
                      ☎ Llamar
                    </ActionBtn>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel index="02" title="Mis asignaciones" meta="esta semana">
          <ul className="divide-y divide-ink/10">
            {ASSIGNMENTS.map((a, i) => (
              <li key={a.event} className="px-6 py-5">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-iris tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-lg tracking-tight text-ink leading-tight">
                    {a.event}
                  </p>
                </div>
                <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55 pl-7">
                  {a.role} · {a.date} · {a.time}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
