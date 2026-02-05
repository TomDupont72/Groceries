import { toggleSelected, setQty, getSelectedIds, SelectedMap } from "../selection";

describe("selection helpers", () => {
  it("toggleSelected adds an id with empty qty", () => {
    const prev: SelectedMap = {};
    const next = toggleSelected(prev, "42");

    expect(next).not.toBe(prev);
    expect(next["42"]).toEqual({ qty: "" });
  });

  it("toggleSelected removes an existing id (and its qty)", () => {
    const prev: SelectedMap = { "42": { qty: "12" } };
    const next = toggleSelected(prev, "42");

    expect(next["42"]).toBeUndefined();
  });

  it("setQty updates qty only if selected", () => {
    const prev: SelectedMap = { "42": { qty: "" } };
    const next = setQty(prev, "42", "3.5");

    expect(next["42"].qty).toBe("3.5");
  });

  it("setQty ignores ids that are not selected", () => {
    const prev: SelectedMap = {};
    const next = setQty(prev, "999", "10");
    expect(next).toBe(prev);
  });

  it("getSelectedIds returns all selected ids", () => {
    const prev: SelectedMap = { a: { qty: "" }, b: { qty: "2" } };
    expect(getSelectedIds(prev).sort()).toEqual(["a", "b"]);
  });
});
