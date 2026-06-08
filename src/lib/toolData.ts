// toolData.ts — unified localStorage helper for per-tool calculated output
// Key format: zibendao_toolData_${companyId}_${toolId}

export const ALL_TOOL_IDS = [
  "T01", "T02", "T03", "T04", "T05",
  "T06", "T07", "T08", "T09", "T10",
  "T11", "T12", "T13",
] as const;

export type ToolId = (typeof ALL_TOOL_IDS)[number];

export interface ToolDataEntry {
  companyId: string;
  toolId: ToolId;
  inputData?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calculatedOutput: Record<string, any>;
  currency?: string;
  countryRegion?: string;
  updatedAt: string;
}

export type AllToolData = Partial<Record<ToolId, ToolDataEntry>>;

export function toolDataKey(companyId: string, toolId: ToolId): string {
  return `zibendao_toolData_${companyId}_${toolId}`;
}

/** Save one tool's snapshot to localStorage and notify Dashboard. */
export function saveToolData(
  entry: Omit<ToolDataEntry, "updatedAt"> & { updatedAt?: string }
): void {
  if (typeof window === "undefined") return;
  try {
    const full: ToolDataEntry = {
      ...entry,
      updatedAt: entry.updatedAt ?? new Date().toISOString(),
    };
    const key = toolDataKey(entry.companyId, entry.toolId);
    localStorage.setItem(key, JSON.stringify(full));
    console.log(`[toolData] saved ${entry.toolId} | key=${key}`);
    // Notify Dashboard to reload
    window.dispatchEvent(
      new CustomEvent("toolDataUpdated", {
        detail: { companyId: entry.companyId, toolId: entry.toolId },
      })
    );
  } catch (e) {
    console.warn("[toolData] save failed", e);
  }
}

/** Read one tool's snapshot from localStorage. */
export function loadToolData(companyId: string, toolId: ToolId): ToolDataEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(toolDataKey(companyId, toolId));
    if (!raw) return null;
    return JSON.parse(raw) as ToolDataEntry;
  } catch {
    return null;
  }
}

/** Read all tools for a given companyId. Returns only tools that have saved data.
 *  Falls back to "__default__" for any tool not found under companyId — this handles
 *  data that was saved before the company was configured. */
export function loadCompanyToolData(companyId: string): AllToolData {
  const result: AllToolData = {};
  for (const toolId of ALL_TOOL_IDS) {
    const d = loadToolData(companyId, toolId);
    if (d) {
      result[toolId] = d;
    } else if (companyId !== "__default__") {
      // Orphaned data fallback: user may have saved this tool before company was set up
      const fallback = loadToolData("__default__", toolId);
      if (fallback) result[toolId] = fallback;
    }
  }
  console.log(
    `[toolData] loadCompanyToolData(${companyId}) => keys: [${Object.keys(result).join(", ")}]`
  );
  return result;
}
