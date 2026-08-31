import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { StoreShell } from "@/components/store/store-shell";
import { useI18n } from "@/lib/i18n";
import { useCategory } from "@/lib/vendre/api";

export default function CategoryPage({ id }: { id: number }) {
  const { t } = useI18n();
  const { data, isLoading } = useCategory(id);

  return (
    <StoreShell>
      {isLoading || !data ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("store.loading")}
        </p>
      ) : (
        <>
          <header>
            <h1 className="text-3xl font-extrabold text-foreground">{data.header.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.product_count} {t("store.products")}
            </p>
            {data.header.text && (
              <div
                className="mt-3 max-w-2xl text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: data.header.text }}
              />
            )}
          </header>

          {data.subcategory_list.length > 0 && (
            <nav className="mt-6 flex flex-wrap gap-2">
              {data.subcategory_list.map((sub) => (
                <Link
                  key={sub.id}
                  to="/kategori/$id"
                  params={{ id: String(sub.id) }}
                  className="brand-button-ghost"
                >
                  {sub.name}
                </Link>
              ))}
            </nav>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.product_list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </StoreShell>
  );
}
