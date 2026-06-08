export type CompanyMode = "single" | "group" | null;

export type CountryCode = "malaysia" | "singapore" | "indonesia" | "thailand" | "taiwan" | "japan";

export interface Company {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  country?: CountryCode;
  isParent?: boolean;
  parentId?: string | null;
  shareholding?: number;
  industry?: string;
  equityStructure?: string;
  notes?: string;
  netProfit?: number;
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
