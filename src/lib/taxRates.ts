// ── TaxBracket / CountryTaxRules ─────────────────────────────────────────────

export interface TaxBracket {
  from: number;         // cumulative income start (inclusive, for documentation)
  to: number | null;    // cumulative income ceiling (inclusive), null = unlimited
  rate: number;         // decimal rate e.g. 0.15 = 15%
}

export interface CountryTaxRules {
  country: string;
  currency: string;
  currencySymbol: string;
  displayName: string;
  taxBrackets: TaxBracket[];
  notes: string;
  effectiveFrom: string;
  lastUpdated: string;
  lastCheckedAt: string;
  sourceName: string;
  sourceUrl: string;
}

// ── 6-country tax rules ───────────────────────────────────────────────────────

export const COUNTRY_TAX_RULES: Record<string, CountryTaxRules> = {
  malaysia: {
    country: "malaysia",
    currency: "MYR",
    currencySymbol: "RM",
    displayName: "马来西亚",
    taxBrackets: [
      { from: 0,       to: 150000,  rate: 0.15 },
      { from: 150001,  to: 600000,  rate: 0.17 },
      { from: 600001,  to: null,    rate: 0.24 },
    ],
    notes: "SME（缴足资本 ≤ RM250万，年营收 ≤ RM5000万）分层税率。首 RM15万 @ 15%，次 RM45万 @ 17%，余额 @ 24%。大型企业统一 24%。",
    effectiveFrom: "2023-01",
    lastUpdated: "2024-01",
    lastCheckedAt: "2026-06-01",
    sourceName: "LHDN / HASiL",
    sourceUrl: "https://www.hasil.gov.my/en/income-tax/income-tax-rates/",
  },
  singapore: {
    country: "singapore",
    currency: "SGD",
    currencySymbol: "S$",
    displayName: "新加坡",
    taxBrackets: [
      { from: 0,       to: 10000,   rate: 0.0425 },
      { from: 10001,   to: 200000,  rate: 0.0850 },
      { from: 200001,  to: null,    rate: 0.17   },
    ],
    notes: "含标准部分税务豁免（Partial Tax Exemption）。首 S$1万 @ 4.25%，次 S$19万 @ 8.5%，余额 @ 17%。",
    effectiveFrom: "2023-01",
    lastUpdated: "2024-01",
    lastCheckedAt: "2026-06-01",
    sourceName: "IRAS",
    sourceUrl: "https://www.iras.gov.sg/taxes/corporate-income-tax/basics-of-corporate-income-tax/corporate-tax-rates-rebates-and-exemptions",
  },
  indonesia: {
    country: "indonesia",
    currency: "IDR",
    currencySymbol: "Rp",
    displayName: "印度尼西亚",
    taxBrackets: [
      { from: 0, to: null, rate: 0.22 },
    ],
    notes: "一般企业统一 22%。上市公司（公众股 ≥40%）可减至 19%。",
    effectiveFrom: "2022-01",
    lastUpdated: "2024-01",
    lastCheckedAt: "2026-06-01",
    sourceName: "DJP (Direktorat Jenderal Pajak)",
    sourceUrl: "https://www.pajak.go.id/",
  },
  thailand: {
    country: "thailand",
    currency: "THB",
    currencySymbol: "฿",
    displayName: "泰国",
    taxBrackets: [
      { from: 0,       to: 300000,  rate: 0.00 },
      { from: 300001,  to: 3000000, rate: 0.15 },
      { from: 3000001, to: null,    rate: 0.20 },
    ],
    notes: "SME（缴足资本 ≤ 500万泰铢）：首 ฿30万免税，次至 ฿300万 @ 15%，超出 @ 20%。大型企业统一 20%。",
    effectiveFrom: "2023-01",
    lastUpdated: "2024-01",
    lastCheckedAt: "2026-06-01",
    sourceName: "Revenue Department of Thailand",
    sourceUrl: "https://www.rd.go.th/english/20961.html",
  },
  taiwan: {
    country: "taiwan",
    currency: "TWD",
    currencySymbol: "NT$",
    displayName: "台湾",
    taxBrackets: [
      { from: 0,      to: 120000, rate: 0.00 },
      { from: 120001, to: null,   rate: 0.20 },
    ],
    notes: "应税所得 ≤ NT$12万：免税。超出部分 @ 20%（实际税额不超过超出额的 50%）。",
    effectiveFrom: "2018-01",
    lastUpdated: "2024-01",
    lastCheckedAt: "2026-06-01",
    sourceName: "财政部（Ministry of Finance, R.O.C.）",
    sourceUrl: "https://www.mof.gov.tw/",
  },
  japan: {
    country: "japan",
    currency: "JPY",
    currencySymbol: "¥",
    displayName: "日本",
    taxBrackets: [
      { from: 0,       to: 8000000, rate: 0.150 },
      { from: 8000001, to: null,    rate: 0.232 },
    ],
    notes: "中小企业（资本金 ≤ 1亿日元）国税：首 ¥800万 @ 15%，超出 @ 23.2%。不含地方税（另约 10–11%）。",
    effectiveFrom: "2023-01",
    lastUpdated: "2024-01",
    lastCheckedAt: "2026-06-01",
    sourceName: "National Tax Agency (NTA)",
    sourceUrl: "https://www.nta.go.jp/english/taxes/corporation/index.htm",
  },
};

// ── Core calculation ──────────────────────────────────────────────────────────

export function calculateTax(profit: number, brackets: TaxBracket[]): number {
  if (profit <= 0) return 0;
  let tax = 0;
  let accounted = 0;
  for (const bracket of brackets) {
    if (accounted >= profit) break;
    const ceiling = bracket.to ?? Infinity;
    const chunk = Math.min(profit, ceiling) - accounted;
    if (chunk > 0) {
      tax += chunk * bracket.rate;
      accounted += chunk;
    }
  }
  return tax;
}

export interface PATResult {
  taxAmt: number;
  pat: number;
  effectiveRate: number;
  displayDate: string;
  sourceName: string;
}

export function calculatePAT(ebt: number, country?: string): PATResult {
  const rules = (country && COUNTRY_TAX_RULES[country])
    ? COUNTRY_TAX_RULES[country]
    : COUNTRY_TAX_RULES.malaysia;
  const taxableIncome = Math.max(0, ebt);
  const taxAmt = calculateTax(taxableIncome, rules.taxBrackets);
  const pat = ebt - taxAmt;
  const effectiveRate = taxableIncome > 0 ? (taxAmt / taxableIncome) * 100 : 0;
  return { taxAmt, pat, effectiveRate, displayDate: rules.lastUpdated, sourceName: rules.sourceName };
}

export function getCountryTaxRules(country?: string): CountryTaxRules {
  return (country && COUNTRY_TAX_RULES[country])
    ? COUNTRY_TAX_RULES[country]
    : COUNTRY_TAX_RULES.malaysia;
}

// ── Legacy TaxRegion (backward compatibility) ─────────────────────────────────

export interface TaxRegion {
  id: string;
  label: string;
  currency: string;
  currencySymbol: string;
  rate: number;
  note?: string;
  updatedAt: string;
}

export const TAX_REGIONS: TaxRegion[] = [
  { id: "my-sme",  label: "马来西亚 SME",    currency: "MYR", currencySymbol: "RM",  rate: 17,   note: "分层税率，中段代表值。", updatedAt: "2024-01" },
  { id: "my-std",  label: "马来西亚（标准）", currency: "MYR", currencySymbol: "RM",  rate: 24,   note: "大型企业标准税率。",     updatedAt: "2024-01" },
  { id: "sg",      label: "新加坡",           currency: "SGD", currencySymbol: "S$",  rate: 17,   note: "含部分豁免，有效税率更低。", updatedAt: "2024-01" },
  { id: "id",      label: "印度尼西亚",       currency: "IDR", currencySymbol: "Rp",  rate: 22,   updatedAt: "2024-01" },
  { id: "th",      label: "泰国",             currency: "THB", currencySymbol: "฿",   rate: 20,   updatedAt: "2024-01" },
  { id: "tw",      label: "台湾",             currency: "TWD", currencySymbol: "NT$", rate: 20,   updatedAt: "2024-01" },
  { id: "jp",      label: "日本",             currency: "JPY", currencySymbol: "¥",   rate: 23.2, note: "国税 23.2%。", updatedAt: "2024-01" },
  { id: "custom",  label: "手动输入",         currency: "CUSTOM", currencySymbol: "", rate: 0,    updatedAt: "" },
];

export function getTaxRegion(id: string): TaxRegion {
  return TAX_REGIONS.find((r) => r.id === id) ?? TAX_REGIONS[0];
}

// ── Country config ────────────────────────────────────────────────────────────

export interface CountryConfig {
  taxRegionId: string;
  currencySymbol: string;
  taxRate: number;
  displayName: string;
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  malaysia:   { taxRegionId: "my-std", currencySymbol: "RM",  taxRate: 24,   displayName: "马来西亚" },
  singapore:  { taxRegionId: "sg",     currencySymbol: "S$",  taxRate: 17,   displayName: "新加坡" },
  indonesia:  { taxRegionId: "id",     currencySymbol: "Rp",  taxRate: 22,   displayName: "印度尼西亚" },
  thailand:   { taxRegionId: "th",     currencySymbol: "฿",   taxRate: 20,   displayName: "泰国" },
  taiwan:     { taxRegionId: "tw",     currencySymbol: "NT$", taxRate: 20,   displayName: "台湾" },
  japan:      { taxRegionId: "jp",     currencySymbol: "¥",   taxRate: 23.2, displayName: "日本" },
};

export const COUNTRY_OPTIONS = Object.entries(COUNTRY_CONFIGS).map(([k, v]) => ({
  value: k,
  label: v.displayName,
}));

export function getCountryConfig(country?: string): CountryConfig {
  return country ? (COUNTRY_CONFIGS[country] ?? COUNTRY_CONFIGS.malaysia) : COUNTRY_CONFIGS.malaysia;
}
