"use client";

import { useState, useEffect } from "react";

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  image?: string | null;
  icon?: string | null;
  price: number;
  comparePrice?: number | null;
  weight?: string | null;
  badge?: string | null;
  tags: string[];
  stock: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string; icon?: string | null };
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  productCount: number;
}

interface UseProductsOptions {
  businessLine: "PHARMA" | "LIOFILIZADOS";
  fallbackProducts: ProductData[];
  fallbackCategories: string[];
}

export function useProducts({ businessLine, fallbackProducts, fallbackCategories }: UseProductsOptions) {
  const [products, setProducts] = useState<ProductData[]>(fallbackProducts);
  const [categories, setCategories] = useState<string[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?businessLine=${businessLine}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (cancelled) return;

        if (data.products && data.products.length > 0) {
          const mapped: ProductData[] = data.products.map((p: Record<string, unknown>) => ({
            ...p,
            price: Number(p.price),
            comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
          }));
          setProducts(mapped);

          const uniqueCats = Array.from(new Set(mapped.map((p) => p.category.name)));
          setCategories(["Todos", ...uniqueCats]);
        } else {
          setUsingFallback(true);
        }
      } catch {
        if (!cancelled) setUsingFallback(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [businessLine, fallbackProducts, fallbackCategories]);

  return { products, categories, loading, usingFallback };
}
