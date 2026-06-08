"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Company ID resolution (exported so T01 and dashboard use the same key) ──
export function getCompanyId(): string {
  try {
    const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
    if (mode === "single") {
      const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
      if (sc) {
        const parsed = JSON.parse(sc);
        if (parsed?.id) return `single_${parsed.id}`;
      }
    } else if (mode === "group") {
      const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
      if (ac) {
        const parsed = JSON.parse(ac);
        if (parsed?.id) return `group_${parsed.id}`;
      }
    }
    // Fallback: mode not set but single company exists → use it
    // (covers the case where user fills a tool before completing company setup)
    const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
    if (sc) {
      const parsed = JSON.parse(sc);
      if (parsed?.id) return `single_${parsed.id}`;
    }
  } catch {}
  return "__default__";
}

// ── localStorage helpers ───────────────────────────────────────────────────
function lsKey(toolSlug: string, companyId: string) {
  return `zbd_tool_${toolSlug}_${companyId}`;
}
function lsSave<T>(toolSlug: string, companyId: string, data: T) {
  try { localStorage.setItem(lsKey(toolSlug, companyId), JSON.stringify(data)); } catch {}
}
function lsLoad<T>(toolSlug: string, companyId: string): T | null {
  try {
    const raw = localStorage.getItem(lsKey(toolSlug, companyId));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

// ── Hook ───────────────────────────────────────────────────────────────────
interface UseToolSnapshotResult<T> {
  savedData: T | null;
  /** true once the initial load attempt completes — whether or not data was found.
   *  Use this (not savedData) to gate auto-save so first-time users can save. */
  dataReady: boolean;
  saving: boolean;
  lastSaved: Date | null;
  save: (data: T) => Promise<void>;
}

export function useToolSnapshot<T>(toolSlug: string): UseToolSnapshotResult<T> {
  const [savedData, setSavedData] = useState<T | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [companyId, setCompanyId] = useState<string>("__default__");
  const loadAttempted = useRef(false);

  // Step 1: resolve companyId from localStorage after hydration
  useEffect(() => {
    const cid = getCompanyId();
    setCompanyId(cid);
    setHydrated(true);
  }, []);

  // Step 2: load once hydrated
  useEffect(() => {
    if (!hydrated) return;
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    console.log(`[useToolSnapshot] loading | toolSlug=${toolSlug} companyId=${companyId}`);

    // Check localStorage immediately
    const lsData = lsLoad<T>(toolSlug, companyId);
    if (lsData) {
      console.log(`[useToolSnapshot] loaded from localStorage | toolSlug=${toolSlug} companyId=${companyId}`);
      setSavedData(lsData);
    } else {
      console.log(`[useToolSnapshot] no localStorage data | toolSlug=${toolSlug} companyId=${companyId}`);
    }
    // CRITICAL: set dataReady=true whether or not data was found
    // This unblocks auto-save for first-time users
    setDataReady(true);

    // Also try DB (authoritative, may override localStorage)
    fetch(`/api/tools/snapshot?toolSlug=${toolSlug}&companyId=${encodeURIComponent(companyId)}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((snap) => {
        if (snap?.data) {
          console.log(`[useToolSnapshot] loaded from DB | toolSlug=${toolSlug} companyId=${companyId}`);
          setSavedData(snap.data as T);
          lsSave(toolSlug, companyId, snap.data);
        }
      })
      .catch((e) => {
        console.warn(`[useToolSnapshot] DB load failed (${e.message}) | toolSlug=${toolSlug}`);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, companyId]);

  // Step 3: save — localStorage immediately, DB async
  const save = useCallback(
    async (data: T) => {
      setSaving(true);
      const cid = getCompanyId();
      console.log(`[useToolSnapshot] saving | toolSlug=${toolSlug} companyId=${cid}`);
      lsSave(toolSlug, cid, data);
      setSavedData(data);
      setLastSaved(new Date());
      try {
        const res = await fetch("/api/tools/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug, companyId: cid, data }),
        });
        if (res.ok) {
          console.log(`[useToolSnapshot] saved to DB | toolSlug=${toolSlug} companyId=${cid}`);
        } else {
          console.warn(`[useToolSnapshot] DB save failed (${res.status}) | toolSlug=${toolSlug}`);
        }
      } catch (e) {
        console.warn(`[useToolSnapshot] DB save error | toolSlug=${toolSlug}`, e);
      }
      setSaving(false);
    },
    [toolSlug]
  );

  return { savedData, dataReady, saving, lastSaved, save };
}
