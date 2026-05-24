export type CompanyMode = "single" | "group" | null;

export interface Company {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  isParent?: boolean;
  parentId?: string | null;
  shareholding?: number;
  industry?: string;
  equityStructure?: string;
  notes?: string;
}

export interface GroupStructure {
  parent: Company | null;
  subsidiaries: Company[];
}

export const ENTERPRISE_KEYS = {
  MODE: "zbd_company_mode",
  SINGLE: "zbd_single_company",
  GROUP: "zbd_group",
  ACTIVE_COMPANY: "zbd_active_company",
} as const;
