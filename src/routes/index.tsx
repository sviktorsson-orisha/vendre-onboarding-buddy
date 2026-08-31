import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/store/product-card";
import { StoreLayout } from "@/components/store/store-layout";
import { useI18n } from "@/lib/i18n";
import { useVendreApi } from "@/lib/vendre/api";
import type { MenuNode, Product } from "@/types/vendre";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vendre Storefront — handla nyheter och favoriter" },
      {
        name: "description",
        content:
          "Vendre headless storefront: utvalda produkter, kategorier och en live kundvagn kopplad till Surface API v2.",
      },
      { property: "og:title", content: "Vendre Storefront — handla nyheter och favoriter" },
      {
        property: "og:description",
        content: "Utvalda produkter, kategorier och live kundvagn i din Vendre-butik.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();
  const api = useVendreApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MenuNode[]>([]);

  useEffect(() => {
    let active = true;
    void api.getFeaturedProducts().then((list) => active && setProducts(list)).catch(() => undefined);
    void api
      .getMenus()
      .then((nodes) => active && setCategories(nodes.filter((node) => node.type === "category")))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [api]);

  return (
    <StoreLayout>
      <section className="border-b border-border bg-linear-to-br from-secondary via-background to-secondary">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
          <p className="brand-eyebrow inline-flex rounded-md bg-primary/10 px-3 py-1 text-primary">
            {t("store.heroEyebrow")}
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.05] text-foreground sm:text-5xl">
            {t("store.heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">{t("store.heroIntro")}</p>
          {categories[0] && (
            <Link
              to="/category/$id"
              params={{ id: String(categories[0].id) }}
              className="brand-button mt-8"
            >
              {t("store.heroCta")}
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-foreground">{t("store.featured")}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-foreground">{t("store.categories")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((node) => (
            <Link
              key={node.id}
              to="/category/$id"
              params={{ id: String(node.id) }}
              className="brand-card flex items-center justify-between p-6 transition-shadow hover:shadow-lg"
            >
              <span className="font-display text-lg font-bold text-foreground">{node.name}</span>
              <span className="text-sm text-muted-foreground">
                {node.children.length > 0
                  ? t("store.subcategories", { count: node.children.length })
                  : t("store.browse")}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
}
