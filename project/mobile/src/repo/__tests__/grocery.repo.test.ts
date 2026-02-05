import { getOrCreateGrocery } from "../grocery";

function makeSupabaseMock(scenario: "exists" | "create" | "conflictThenExists") {
  const calls: any[] = [];

  const state = {
    scenario,
    selectedOnce: false,
  };

  const table = {
    select: (_cols: string) => ({
      eq: (_col: string, _val: any) => ({
        maybeSingle: async () => {
          calls.push({ op: "select" });

          if (state.scenario === "exists") {
            return { data: { id: "g1", userId: "u1" }, error: null };
          }

          if (state.scenario === "create") {
            return { data: null, error: null }; // not found
          }

          // conflictThenExists:
          if (!state.selectedOnce) {
            state.selectedOnce = true;
            return { data: null, error: null }; // not found first
          }
          return { data: { id: "g2", userId: "u1" }, error: null }; // found after conflict
        },
      }),
    }),

    insert: (_row: any) => ({
      select: (_cols: string) => ({
        maybeSingle: async () => {
          calls.push({ op: "insert" });

          if (state.scenario === "create") {
            return { data: { id: "gNEW", userId: "u1" }, error: null };
          }

          if (state.scenario === "conflictThenExists") {
            return { data: null, error: { code: "23505", message: "duplicate key value violates unique constraint" } };
          }

          return { data: null, error: new Error("unexpected insert") };
        },
      }),
    }),
  };

  const supabase = {
    from: (_table: string) => table,
  };

  return { supabase, calls };
}

describe("getOrCreateGrocery", () => {
  it("returns existing grocery when present", async () => {
    const { supabase, calls } = makeSupabaseMock("exists");
    const res = await getOrCreateGrocery({ supabase: supabase as any, userId: "u1" });

    expect(res).toEqual({ id: "g1", userId: "u1" });
    expect(calls.map((c) => c.op)).toEqual(["select"]);
  });

  it("creates grocery when none exists", async () => {
    const { supabase, calls } = makeSupabaseMock("create");
    const res = await getOrCreateGrocery({ supabase: supabase as any, userId: "u1" });

    expect(res).toEqual({ id: "gNEW", userId: "u1" });
    expect(calls.map((c) => c.op)).toEqual(["select", "insert"]);
  });

  it("handles unique conflict by re-selecting", async () => {
    const { supabase, calls } = makeSupabaseMock("conflictThenExists");
    const res = await getOrCreateGrocery({ supabase: supabase as any, userId: "u1" });

    expect(res).toEqual({ id: "g2", userId: "u1" });
    expect(calls.map((c) => c.op)).toEqual(["select", "insert", "select"]);
  });
});
