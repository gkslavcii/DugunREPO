"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { setSeatingPublic, setSeatStart } from "@/lib/settings";
import {
  SHAPES,
  normShape,
  type Shape,
  type Table,
  type SeatGuest,
} from "@/lib/seatingLayout";

const clampCap = (n: number) => Math.min(20, Math.max(1, Math.round(n)));

export async function createTable(
  shape: string,
  capacity: number,
  x: number,
  y: number,
): Promise<Table | null> {
  if (!(await isAdmin())) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const sh = normShape(shape);
  const cap = clampCap(capacity);
  try {
    const { data, error } = await sb
      .from("seat_tables")
      .insert({ shape: sh, capacity: cap, x, y, name: "" })
      .select("id, name, shape, capacity, x, y")
      .single();
    if (error || !data) return null;
    revalidatePath("/admin/oturma");
    const r = data as Record<string, unknown>;
    return {
      id: String(r.id),
      name: "",
      shape: sh,
      capacity: cap,
      x: typeof r.x === "number" ? r.x : x,
      y: typeof r.y === "number" ? r.y : y,
    };
  } catch {
    return null;
  }
}

/** Sürükleme bitince konumu kaydeder (sık çağrılır; sayfa force-dynamic olduğu için revalidate gerekmez). */
export async function updateTablePosition(
  id: string,
  x: number,
  y: number,
): Promise<void> {
  if (!(await isAdmin())) return;
  const sb = getSupabaseAdmin();
  if (!sb || !id) return;
  try {
    await sb.from("seat_tables").update({ x, y }).eq("id", id);
  } catch {
    /* sessizce geç */
  }
}

export async function updateTable(
  id: string,
  fields: { name?: string; shape?: string; capacity?: number },
): Promise<void> {
  if (!(await isAdmin())) return;
  const sb = getSupabaseAdmin();
  if (!sb || !id) return;
  const patch: Record<string, unknown> = {};
  if (typeof fields.name === "string") patch.name = fields.name.slice(0, 40);
  if (fields.shape && SHAPES.includes(fields.shape as Shape))
    patch.shape = fields.shape;
  if (typeof fields.capacity === "number")
    patch.capacity = clampCap(fields.capacity);
  if (Object.keys(patch).length === 0) return;
  try {
    await sb.from("seat_tables").update(patch).eq("id", id);
  } catch {
    /* sessizce geç */
  }
  revalidatePath("/admin/oturma");
}

export async function deleteTable(id: string): Promise<void> {
  if (!(await isAdmin())) return;
  const sb = getSupabaseAdmin();
  if (!sb || !id) return;
  try {
    await sb.from("seat_tables").delete().eq("id", id);
  } catch {
    /* sessizce geç */
  }
  revalidatePath("/admin/oturma");
}

export async function addGuest(
  tableId: string,
  name: string,
): Promise<SeatGuest | null> {
  if (!(await isAdmin())) return null;
  const sb = getSupabaseAdmin();
  const clean = (name ?? "").trim().slice(0, 60);
  if (!sb || !tableId || !clean) return null;
  try {
    const { data, error } = await sb
      .from("seat_guests")
      .insert({ table_id: tableId, name: clean })
      .select("id, name, table_id")
      .single();
    if (error || !data) return null;
    revalidatePath("/admin/oturma");
    const r = data as Record<string, unknown>;
    return { id: String(r.id), name: clean, tableId };
  } catch {
    return null;
  }
}

export async function addGuests(
  tableId: string,
  names: string[],
): Promise<SeatGuest[]> {
  if (!(await isAdmin())) return [];
  const sb = getSupabaseAdmin();
  if (!sb || !tableId) return [];
  const clean = names
    .map((n) => (n ?? "").trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 60);
  if (clean.length === 0) return [];
  try {
    const { data, error } = await sb
      .from("seat_guests")
      .insert(clean.map((name) => ({ table_id: tableId, name })))
      .select("id, name, table_id");
    if (error || !data) return [];
    revalidatePath("/admin/oturma");
    return (data as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      name: typeof r.name === "string" ? r.name : "",
      tableId,
    }));
  } catch {
    return [];
  }
}

export async function removeGuest(id: string): Promise<void> {
  if (!(await isAdmin())) return;
  const sb = getSupabaseAdmin();
  if (!sb || !id) return;
  try {
    await sb.from("seat_guests").delete().eq("id", id);
  } catch {
    /* sessizce geç */
  }
  revalidatePath("/admin/oturma");
}

export async function setSeatEdges(edges: {
  top: string;
  right: string;
  bottom: string;
  left: string;
}): Promise<void> {
  if (!(await isAdmin())) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;
  const clean = (s: string) => (s ?? "").trim().slice(0, 30) || null;
  try {
    await sb.from("app_settings").upsert({
      id: 1,
      seat_edge_top: clean(edges.top),
      seat_edge_right: clean(edges.right),
      seat_edge_bottom: clean(edges.bottom),
      seat_edge_left: clean(edges.left),
      updated_at: new Date().toISOString(),
    });
  } catch {
    /* sessizce geç */
  }
  revalidatePath("/admin/oturma");
}

export async function setSeatingPublicAction(value: boolean): Promise<void> {
  if (!(await isAdmin())) return;
  await setSeatingPublic(value);
  revalidatePath("/");
  revalidatePath("/oturma");
  revalidatePath("/admin/oturma");
}

export async function setStartMark(x: number, y: number): Promise<void> {
  if (!(await isAdmin())) return;
  await setSeatStart(Math.round(x), Math.round(y));
}

export async function clearStartMark(): Promise<void> {
  if (!(await isAdmin())) return;
  await setSeatStart(null, null);
  revalidatePath("/admin/oturma");
}
