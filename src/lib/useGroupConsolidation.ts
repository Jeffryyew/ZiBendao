"use client";

import { useEffect, useState } from "react";
import { ENTERPRISE_KEYS, type Company, type GroupStructure } from "@/lib/enterprise";
import type { FinancialCore } from "@/lib/financialCore";

export interface SubsidiarySnapshot {
  company: Company;
  core: FinancialCore | null;
}

export interface ConsolidatedCore {
  // Weighted by shareholding %
  annualRevenue: number;
  annualPAT: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  currentValuation: number;
  targetValuation: number;
  // Metadata
  subsidiaryCount: number;
  currencySymbol: string;
}

interface UseGroupConsolidationResult {
  isGroupMode: boolean;
  isParentView: boolean;   // true when no active subsidiary selected
  consolidated: ConsolidatedCore | null;
  subsidiaries: SubsidiarySnapshot[];
  loading: boolean;
}

export function useGroupConsolidation(): UseGroupConsolidationResult {
  const [result, setResult] = useState<UseGroupConsolidationResult>({
    isGroupMode: false,
    isParentView: false,
    consolidated: null,
    subsidiaries: [],
    loading: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const rawMode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
        if (rawMode !== '"group"' && rawMode !== "group") {
          setResult({ isGroupMode: false, isParentView: false, consolidated: null, subsidiaries: [], loading: false });
          return;
        }

        const activeRaw = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        const hasActive = !!activeRaw;
        const isParentView = !hasActive;

        if (!isParentView) {
          // Viewing a specific subsidiary — no consolidation needed
          setResult({ isGroupMode: true, isParentView: false, consolidated: null, subsidiaries: [], loading: false });
          return;
        }

        // Parent view — fetch all subsidiaries
        const groupRaw = localStorage.getItem(ENTERPRISE_KEYS.GROUP);
        if (!groupRaw) {
          setResult({ isGroupMode: true, isParentView: true, consolidated: null, subsidiaries: [], loading: false });
          return;
        }

        const group: GroupStructure = JSON.parse(groupRaw);
        const allCompanies: Company[] = [
          ...(group.parent ? [group.parent] : []),
          ...group.subsidiaries,
        ].filter((c) => !c.isParent); // only actual operating companies

        // Fetch each company's _financial_core snapshot
        const snapshots: SubsidiarySnapshot[] = await Promise.all(
          allCompanies.map(async (company) => {
            const companyId = `group_${company.id}`;
            try {
              const res = await fetch(
                `/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`
              );
              const data = await res.json();
              return { company, core: data?.data ?? null };
            } catch {
              return { company, core: null };
            }
          })
        );

        // Consolidate by shareholding %
        let totalRevenue = 0;
        let totalPAT = 0;
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        let totalValuation = 0;
        let totalTargetValuation = 0;
        let currencySymbol = "RM";
        let count = 0;

        for (const { company, core } of snapshots) {
          if (!core) continue;
          const pct = (company.shareholding ?? 100) / 100;
          totalRevenue += (core.annualRevenue ?? 0) * pct;
          totalPAT += (core.annualPAT ?? 0) * pct;
          totalAssets += (core.totalAssets ?? 0); // full consolidation
          totalLiabilities += (core.totalLiabilities ?? 0);
          totalEquity += (core.totalEquity ?? 0) * pct;
          totalValuation += (core.currentValuation ?? 0) * pct;
          totalTargetValuation += (core.targetValuation ?? 0) * pct;
          if (core.currencySymbol) currencySymbol = core.currencySymbol;
          count++;
        }

        const consolidated: ConsolidatedCore = {
          annualRevenue: totalRevenue,
          annualPAT: totalPAT,
          totalAssets,
          totalLiabilities,
          totalEquity,
          currentValuation: totalValuation,
          targetValuation: totalTargetValuation,
          subsidiaryCount: count,
          currencySymbol,
        };

        setResult({
          isGroupMode: true,
          isParentView: true,
          consolidated: count > 0 ? consolidated : null,
          subsidiaries: snapshots,
          loading: false,
        });
      } catch {
        setResult((p) => ({ ...p, loading: false }));
      }
    }

    load();
  }, []);

  return result;
}
