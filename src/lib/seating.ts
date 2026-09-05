import { getSupabaseAdmin } from "./supabase";
import {
  normShape,
  type Table,
  type SeatEdges,
  type SeatGuest,
  type SeatObject,
  type SeatLine,
} from "./seatingLayout";

const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);

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

export async function getObjects(): Promise<SeatObject[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("seat_objects")
      .select("id, label, x, y, w, h")
      .order("created_at", { ascending: true });
    return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
      id: String(r.id),
      label: typeof r.label === "string" ? r.label : "",
      x: num(r.x, 0),
      y: num(r.y, 0),
      w: num(r.w, 140),
      h: num(r.h, 70),
    }));
  } catch {
    return [];
  }
}

export async function getLines(): Promise<SeatLine[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("seat_lines")
      .select("id, x1, y1, x2, y2, color, width")
      .order("created_at", { ascending: true });
    return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
      id: String(r.id),
      x1: num(r.x1, 0),
      y1: num(r.y1, 0),
      x2: num(r.x2, 0),
      y2: num(r.y2, 0),
      color: typeof r.color === "string" ? r.color : "#6f97ad",
      width: num(r.width, 4),
    }));
  } catch {
    return [];
  }
}

export async function getSeatStart(): Promise<{ x: number; y: number } | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from("app_settings")
      .select("seat_start_x, seat_start_y")
      .eq("id", 1)
      .single();
    if (!data) return null;
    const r = data as Record<string, unknown>;
    if (typeof r.seat_start_x === "number" && typeof r.seat_start_y === "number")
      return { x: r.seat_start_x, y: r.seat_start_y };
    return null;
  } catch {
    return null;
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
