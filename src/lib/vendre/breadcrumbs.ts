import type { Crumb } from "@/components/store/breadcrumbs";
import type { MenuItem } from "@/types/vendre";

/**
 * Category chain built from the menu tree (shared by the PLP and the PDP).
 * Falls back to a single crumb when the category is not part of the menu.
 */
export function buildCategoryTrail(
  menus: MenuItem[],
  id: number,
  fallbackName: string,
): Crumb[] {
  const byId = new Map(menus.map((item) => [item.id, item]));
  const trail: Crumb[] = [];
  let current = byId.get(id);
  while (current) {
    trail.unshift({ id: current.id, name: current.name });
    current = current.parent_id != null ? byId.get(current.parent_id) : undefined;
  }
  return trail.length ? trail : [{ id, name: fallbackName }];
}
