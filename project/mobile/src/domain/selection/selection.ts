export type SelectedMap = Record<string, { qty: string }>;

export function toggleSelected(prev: SelectedMap, id: string): SelectedMap {
  const next: SelectedMap = { ...prev };
  if (next[id]) {
    delete next[id];
    return next;
  }
  next[id] = { qty: "" };
  return next;
}

export function setQty(prev: SelectedMap, id: string, qty: string): SelectedMap {
  if (!prev[id]) return prev; // ignore if not selected
  return { ...prev, [id]: { qty } };
}

export function getSelectedIds(map: SelectedMap): string[] {
  return Object.keys(map);
}
