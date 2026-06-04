"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashHeader } from "@/components/dashboard/primitives";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";

export default function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [initial, setInitial] = useState<ProductFormInitial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        const p = d.product;
        setInitial({
          id: p.id,
          businessLine: p.businessLine,
          categoryId: p.categoryId,
          name: p.name,
          slug: p.slug,
          shortDesc: p.shortDesc ?? "",
          description: p.description ?? "",
          price: p.price,
          comparePrice: p.comparePrice ?? undefined,
          sku: p.sku ?? "",
          weight: p.weight ?? "",
          unit: p.unit ?? "",
          stock: p.stock,
          lowStock: p.lowStock,
          tags: p.tags,
          badge: p.badge ?? "",
          isFeatured: p.isFeatured,
          isActive: p.isActive,
          images: p.images ?? [],
          metadata: p.metadata ?? null,
        });
      })
      .catch((e) => toast.error(`Error: ${e.message}`))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Editar"
        title={
          <>
            Editar <span className="italic">producto</span>
            <span className="text-marigold">.</span>
          </>
        }
      />
      {loading || !initial ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-12">
          Cargando…
        </p>
      ) : (
        <ProductForm mode="edit" initial={initial} />
      )}
    </>
  );
}
