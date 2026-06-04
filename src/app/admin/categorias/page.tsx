"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  ActionBtn,
  StatusPill,
} from "@/components/dashboard/primitives";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  businessLine: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriasPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    businessLine: "PHARMA" as "PHARMA" | "LIOFILIZADOS" | "CATERING",
    name: "",
    slug: "",
    icon: "",
    sortOrder: 100,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Category>>({});

  const load = () =>
    fetch("/api/admin/product-categories")
      .then((r) => r.json())
      .then((d) => setCats(d.categories ?? []))
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onCreate = async () => {
    if (!draft.name) return toast.error("Falta el nombre");
    try {
      const res = await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessLine: draft.businessLine,
          name: draft.name,
          slug: draft.slug || slugify(draft.name),
          icon: draft.icon || undefined,
          sortOrder: draft.sortOrder,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("Categoría creada");
      setShowNew(false);
      setDraft({
        businessLine: "PHARMA",
        name: "",
        slug: "",
        icon: "",
        sortOrder: 100,
      });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setEditDraft({ ...c });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };
  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/admin/product-categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editDraft.name,
          slug: editDraft.slug,
          icon: editDraft.icon || null,
          sortOrder: editDraft.sortOrder,
          isActive: editDraft.isActive,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("Categoría actualizada");
      cancelEdit();
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Estructura"
        title={
          <>
            <span className="italic">Categorías</span>
            <span className="text-marigold">.</span>
          </>
        }
      >
        <ActionBtn variant="marigold" onClick={() => setShowNew(!showNew)}>
          {showNew ? "Cerrar" : "+ Nueva categoría"}
        </ActionBtn>
      </DashHeader>

      {showNew && (
        <Panel index="00" title="Nueva categoría">
          <div className="grid sm:grid-cols-5 gap-3 px-6 py-5">
            <select
              value={draft.businessLine}
              onChange={(e) =>
                setDraft({ ...draft, businessLine: e.target.value as typeof draft.businessLine })
              }
              className={INPUT}
            >
              <option value="PHARMA">PHARMA</option>
              <option value="LIOFILIZADOS">LIOFILIZADOS</option>
              <option value="CATERING">CATERING</option>
            </select>
            <input
              placeholder="Nombre"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={INPUT}
            />
            <input
              placeholder="Slug (opcional)"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              className={INPUT}
            />
            <input
              placeholder="Icon material symbol"
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              className={INPUT}
            />
            <input
              type="number"
              placeholder="Orden"
              value={draft.sortOrder}
              onChange={(e) =>
                setDraft({ ...draft, sortOrder: Number(e.target.value) })
              }
              className={INPUT}
            />
            <div className="sm:col-span-5 flex justify-end">
              <ActionBtn variant="ink" onClick={onCreate}>
                Guardar
              </ActionBtn>
            </div>
          </div>
        </Panel>
      )}

      <Panel index="01" title="Categorías" meta={`${cats.length}`}>
        {loading ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 px-6 py-12 text-center">
            Cargando…
          </p>
        ) : (
          <div className="divide-y divide-ink/10">
            <div className="grid grid-cols-[120px_1fr_2fr_80px_60px_auto] gap-3 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 bg-cream-warm">
              <span>Línea</span>
              <span>Nombre</span>
              <span>Slug</span>
              <span className="text-right">Orden</span>
              <span className="text-center">Activo</span>
              <span></span>
            </div>
            {cats.map((c) => {
              const editing = editingId === c.id;
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[120px_1fr_2fr_80px_60px_auto] gap-3 px-6 py-3 items-center"
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/65">
                    {c.businessLine}
                  </span>
                  {editing ? (
                    <input
                      value={editDraft.name ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                      className={INPUT}
                    />
                  ) : (
                    <span className="font-display text-base text-ink">{c.name}</span>
                  )}
                  {editing ? (
                    <input
                      value={editDraft.slug ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, slug: e.target.value })}
                      className={INPUT}
                    />
                  ) : (
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                      {c.slug}
                    </span>
                  )}
                  {editing ? (
                    <input
                      type="number"
                      value={editDraft.sortOrder ?? 0}
                      onChange={(e) =>
                        setEditDraft({ ...editDraft, sortOrder: Number(e.target.value) })
                      }
                      className={INPUT + " text-right"}
                    />
                  ) : (
                    <span className="text-right font-mono text-[11px] tabular text-ink/65">
                      {c.sortOrder}
                    </span>
                  )}
                  <div className="flex justify-center">
                    {editing ? (
                      <input
                        type="checkbox"
                        checked={!!editDraft.isActive}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, isActive: e.target.checked })
                        }
                      />
                    ) : (
                      <StatusPill
                        tone={c.isActive ? "success" : "muted"}
                        label={c.isActive ? "Sí" : "No"}
                      />
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    {editing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(c)}
                        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}

const INPUT =
  "h-10 px-3 border border-ink/25 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink";
