import { getSupabaseAdmin } from "./supabase";
import {
  normShape,
  type Table,
  type SeatEdges,
  type SeatGuest,
} from "./seatingLayout";

const EMPTY_EDGES: SeatEdges = {
  top: null,
  right: null,
  bottom: null,
  left: null,
};

export async function getTables(): Promise<Table[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("seat_tables")
      .select("id, name, shape, capacity, x, y")
      .order("created_at", { ascending: true });
    return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
      id: String(r.id),
      name: typeof r.name === "string" ? r.name : "",
      shape: normShape(r.shape),
      capacity: typeof r.capacity === "number" ? r.capacity : 8,
      x: typeof r.x === "number" ? r.x : 0,
      y: typeof r.y === "number" ? r.y : 0,
    }));
  } catch {
    return [];
  }
}

export async function getSeatGuests(): Promise<SeatGuest[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("seat_guests")
      .select("id, name, table_id")
      .order("created_at", { ascending: true });
    return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
      id: String(r.id),
      name: typeof r.name === "string" ? r.name : "",
      tableId: r.table_id ? String(r.table_id) : null,
    }));
  } catch {
    return [];
  }
}

export async function getSeatEdges(): Promise<SeatEdges> {
  const sb = getSupabaseAdmin();
  if (!sb) return EMPTY_EDGES;
  try {
    const { data } = await sb
      .from("app_settings")
      .select("seat_edge_top, seat_edge_right, seat_edge_bottom, seat_edge_left")
      .eq("id", 1)
      .single();
    if (!data) return EMPTY_EDGES;
    const r = data as Record<string, unknown>;
    const v = (x: unknown) =>
      typeof x === "string" && x.trim() ? x : null;
    return {
      top: v(r.seat_edge_top),
      right: v(r.seat_edge_right),
      bottom: v(r.seat_edge_bottom),
      left: v(r.seat_edge_left),
    };
  } catch {
    return EMPTY_EDGES;
  }
}
