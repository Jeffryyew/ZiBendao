"use client";

import { useCallback, useEffect, useState } from "react";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

function getCompanyId(): string {
  try {
    const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
    if (mode === "single") {
      const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
      if (sc) {
        const parsed = JSON.parse(sc);
        return `single_${parsed.id ?? "default"}`;
      }
    } else if (mode === "group") {
      const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
      if (ac) {
        const parsed = JSON.parse(ac);
        return `group_${parsed.id ?? "default"}`;
      }
    }
  } catch {}
  return "no_company";
}

interface UseToolSnapshotResult<T> {
  savedData: T | null;
  saving: boolean;
  lastSaved: Date | null;
  save: (data: T) => Promise<void>;
}

export function useToolSnapshot<T>(toolSlug: string): UseToolSnapshotResult<T> {
  const [savedData, setSavedData] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [companyId, setCompanyId] = useState<string>("no_company");

  // Load companyId after hydration
  useEffect(() => {
    setCompanyId(getCompanyId());
  }, []);

  // Load snapshot on mount
  useEffect(() => {
    if (!companyId || companyId === "no_company") return;
    fetch(`/api/tools/snapshot?toolSlug=${toolSlug}&companyId=${encodeURIComponent(companyId)}`)
      .then((r) => r.json())
      .then((snap) => {
        if (snap?.data) setSavedData(snap.data as T);
      })
      .catch(() => {});
  }, [toolSlug, companyId]);

  const save = useCallback(
    async (data: T) => {
      setSaving(true);
      try {
        const cid = getCompanyId();
        await fetch("/api/tools/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolSlug, companyId: cid, data }),
        });
        setSavedData(data);
        setLastSaved(new Date());
      } catch {}
      setSaving(false);
    },
    [toolSlug]
  );

  return { savedData, saving, lastSaved, save };
}
