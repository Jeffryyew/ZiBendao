export interface TaxRegion {
  id: string;
  label: string;
  currency: string;
  currencySymbol: string;
  rate: number;        // effective flat rate (%)
  note?: string;
  updatedAt: string;   // "YYYY-MM"
}

export const TAX_REGIONS: TaxRegion[] = [
  {
    id: "my-sme",
    label: "马来西亚 SME",
    currency: "MYR",
    currencySymbol: "RM",
    rate: 17,
    note: "首 RM150k @ 15%，次 RM450k @ 17%，余额 @ 24%。此处取中段代表值。",
    updatedAt: "2025-01",
  },
  {
    id: "my-std",
    label: "马来西亚（标准）",
    currency: "MYR",
    currencySymbol: "RM",
    rate: 24,
    note: "大型企业标准税率。",
    updatedAt: "2025-01",
  },
  {
    id: "sg",
    label: "新加坡",
    currency: "SGD",
    currencySymbol: "S$",
    rate: 17,
    note: "含部分豁免，首 S$10k 利润 75% 豁免，次 S$190k 50% 豁免。",
    updatedAt: "2025-01",
  },
  {
    id: "id",
    label: "印度尼西亚",
    currency: "IDR",
    currencySymbol: "Rp",
    rate: 22,
    updatedAt: "2025-01",
  },
  {
    id: "th",
    label: "泰国",
    currency: "THB",
    currencySymbol: "฿",
    rate: 20,
    updatedAt: "2025-01",
  },
  {
    id: "tw",
    label: "台湾",
    currency: "TWD",
    currencySymbol: "NT$",
    rate: 20,
    updatedAt: "2025-01",
  },
  {
    id: "jp",
    label: "日本",
    currency: "JPY",
    currencySymbol: "¥",
    rate: 23.2,
    note: "国税 23.2%；中小企业含地方税实效约 21–24%。",
    updatedAt: "2025-01",
  },
  {
    id: "custom",
    label: "手动输入",
    currency: "CUSTOM",
    currencySymbol: "",
    rate: 0,
    updatedAt: "",
  },
];

export function getTaxRegion(id: string): TaxRegion {
  return TAX_REGIONS.find((r) => r.id === id) ?? TAX_REGIONS[0];
}
