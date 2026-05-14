export type Tier = "FREE" | "PRO" | "ENTERPRISE";

export function canAccess(_userTier: Tier, _requiredTier: Tier): boolean {
  return true;
}
