"use client";

import { useEffect } from "react";

/** Cihaz başına yalnızca bir kez /api/visit'e ping atar (ziyaretçi sayacı). */
export default function VisitBeacon() {
  useEffect(() => {
    try {
      if (localStorage.getItem("dugun_visited")) return;
      localStorage.setItem("dugun_visited", "1");
      fetch("/api/visit", { method: "POST" }).catch(() => {});
    } catch {
      // localStorage kapalıysa yoksay
    }
  }, []);
  return null;
}
