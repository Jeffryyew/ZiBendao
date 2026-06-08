// FinancialCore — shared financial snapshot published by capital tools
// Stored as ToolSnapshot with toolSlug = "_financial_core"

export interface FinancialCore {
  // From T01 Income Statement
  annualRevenue?: number;
  grossProfit?: number;
  annualPAT?: number;
  taxAmt?: number;
  grossMargin?: number;
  netMargin?: number;
  patMargin?: number;
  ebit?: number;
  totalOpEx?: number;
  currencySymbol?: string;
  taxRate?: number;           // effective tax rate % (for WACC)
  monthlyFixedCostsBase?: number; // monthly fixed costs base for T12 projection

  // From T02 Balance Sheet
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  debtToEquity?: number;
  currentRatio?: number;
  cashBalance?: number;      // cash & bank balance from balance sheet
  totalLoans?: number;       // short-term + long-term loans

  // From T03 Cash Flow
  openingCash?: number;
  yearEndCash?: number;
  monthlyRevenue?: number;
  monthlyFixedCosts?: number;

  // From T04 PAT & KPI
  targetPAT?: number;
  targetRevenue?: number;
  kpiASP?: number;
  kpiConversionRate?: number;
  kpiMonthlyRevTarget?: number;
  kpiMonthlyUnits?: number;

  // From T05 Valuation
  currentValuation?: number;
  currentValuationLow?: number;
  currentValuationHigh?: number;
  targetValuation?: number;
  valuationIndustry?: string;
  valuationPEMultiple?: number;

  // From T06 Financial Roadmap
  roadmapYear1PAT?: number;
  roadmapYear2PAT?: number;
  roadmapYear3PAT?: number;
  roadmapYear1Revenue?: number;
  roadmapYear2Revenue?: number;
  roadmapYear3Revenue?: number;

  // From T07 Store Expansion
  expansionTotalCapital?: number;
  expansionPerStoreInvest?: number;
  expansionPaybackMonths?: number;

  // From T09 Equity Structure
  founderPct?: number;        // founder's current ownership % (post all rounds)
  totalShares?: number;

  // From T08 Fundraising Plan
  latestRoundPreMoney?: number;
  latestRoundPostMoney?: number;
  latestRoundType?: string;

  // Metadata
  updatedBy: Partial<Record<string, string>>; // toolSlug -> ISO date
}

export const EMPTY_FINANCIAL_CORE: FinancialCore = {
  updatedBy: {},
};
