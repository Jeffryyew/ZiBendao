// FinancialCore — shared financial snapshot published by capital tools
// Stored as ToolSnapshot with toolSlug = "_financial_core"

export interface FinancialCore {
  // From T01 Income Statement
  annualRevenue?: number;
  annualPAT?: number;
  grossMargin?: number;
  netMargin?: number;
  ebit?: number;
  totalOpEx?: number;
  currencySymbol?: string;

  // From T02 Balance Sheet
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  debtToEquity?: number;
  currentRatio?: number;

  // From T03 Cash Flow
  openingCash?: number;
  yearEndCash?: number;
  monthlyRevenue?: number;
  monthlyFixedCosts?: number;

  // Metadata
  updatedBy: Partial<Record<string, string>>; // toolSlug -> ISO date
}

export const EMPTY_FINANCIAL_CORE: FinancialCore = {
  updatedBy: {},
};
