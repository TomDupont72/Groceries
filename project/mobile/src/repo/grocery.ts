export type GroceryRow = {
  id: string;
  userId: string;
};

export type SupabaseLike = {
  from: (table: string) => {
    select: (cols: string) => any;
    insert: (row: any) => any;
  };
};

type SelectSingleChain = {
  eq: (col: string, val: any) => SelectSingleChain;
  maybeSingle: () => Promise<{ data: GroceryRow | null; error: any }>;
};

type InsertChain = {
  select: (cols: string) => InsertChain;
  maybeSingle: () => Promise<{ data: GroceryRow | null; error: any }>;
};

function isUniqueViolation(err: any): boolean {
  // Postgres unique violation often has code '23505'
  return err?.code === "23505" || String(err?.message ?? "").toLowerCase().includes("duplicate");
}

/**
 * Ensures exactly one Grocery per user (DB should enforce UNIQUE(userId)).
 * Behavior:
 *  - try select
 *  - if none => try insert
 *  - if insert hits unique constraint => select again
 */
export async function getOrCreateGrocery(params: {
  supabase: SupabaseLike;
  userId: string;
}): Promise<GroceryRow> {
  const { supabase, userId } = params;

  const table = supabase.from("Grocery");

  // 1) select existing
  const sel = table.select('id,userId') as SelectSingleChain;
  const { data: existing, error: selErr } = await sel.eq("userId", userId).maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;

  // 2) insert
  const ins = table.insert({ userId }) as InsertChain;
  const { data: created, error: insErr } = await ins.select("id,userId").maybeSingle();

  if (!insErr && created) return created;

  // 3) if unique violation, someone created concurrently => select again
  if (isUniqueViolation(insErr)) {
    const sel2 = table.select('id,userId') as SelectSingleChain;
    const { data: existing2, error: selErr2 } = await sel2.eq("userId", userId).maybeSingle();
    if (selErr2) throw selErr2;
    if (existing2) return existing2;
  }

  throw insErr ?? new Error("Failed to create Grocery");
}
