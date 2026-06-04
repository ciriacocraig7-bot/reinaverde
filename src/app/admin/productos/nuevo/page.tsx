"use client";

import { DashHeader } from "@/components/dashboard/primitives";
import { ProductForm } from "@/components/admin/product-form";

export default function NuevoProductoPage() {
  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Nuevo"
        title={
          <>
            Nuevo <span className="italic">producto</span>
            <span className="text-marigold">.</span>
          </>
        }
      />
      <ProductForm mode="create" />
    </>
  );
}
