export interface RentalTierPackage {
  days: number;
  label: string;
  price: number;
  km: number;
}

export interface PricingEvaluation {
  isSupportedDuration: boolean;
  pricingMode: 'standard_package' | 'individual_quote';
  price: number | null;
  includedKm: number | null;
  extraKmRate: number;
  securityDeposit: number;
  currency: string;
  matchedPackage: RentalTierPackage | null;
  note: string;
}

export const A3_PACKAGES: Record<number, RentalTierPackage> = {
  1: { days: 1, label: '1 day / 24 hours', price: 65, km: 150 },
  3: { days: 3, label: '3 days / 72 hours', price: 180, km: 450 },
  7: { days: 7, label: '7 days', price: 350, km: 1000 },
  14: { days: 14, label: '14 days', price: 590, km: 1500 },
  30: { days: 30, label: '30 days', price: 950, km: 2000 },
};

export const A5_PACKAGES: Record<number, RentalTierPackage> = {
  1: { days: 1, label: '1 day / 24 hours', price: 110, km: 200 },
  3: { days: 3, label: '3 days / 72 hours', price: 300, km: 600 },
  7: { days: 7, label: '7 days', price: 690, km: 1200 },
  14: { days: 14, label: '14 days', price: 1190, km: 1800 },
  30: { days: 30, label: '30 days', price: 1790, km: 2500 },
};

export function evaluateRentalPricing(
  vehicleIdentifier: string,
  days: number
): PricingEvaluation {
  const isA5 = (vehicleIdentifier || '').toLowerCase().includes('a5');
  const packages = isA5 ? A5_PACKAGES : A3_PACKAGES;
  const extraKmRate = isA5 ? 0.50 : 0.35;
  const securityDeposit = isA5 ? 500 : 300;

  const pkg = packages[days];

  if (pkg) {
    return {
      isSupportedDuration: true,
      pricingMode: 'standard_package',
      price: pkg.price,
      includedKm: pkg.km,
      extraKmRate,
      securityDeposit,
      currency: 'CHF',
      matchedPackage: pkg,
      note: `${pkg.label}: CHF ${pkg.price} (includes ${pkg.km.toLocaleString()} km). Fuel excluded. Deposit CHF ${securityDeposit} payable in cash at pickup.`,
    };
  }

  return {
    isSupportedDuration: false,
    pricingMode: 'individual_quote',
    price: null,
    includedKm: null,
    extraKmRate,
    securityDeposit,
    currency: 'CHF',
    matchedPackage: null,
    note: 'Individual quote required for this duration. Submit your request for manual owner review.',
  };
}

// Deprecated alias for backwards compatibility
export function calculateTieredPrice(vehicleIdentifier: string, days: number) {
  const evalResult = evaluateRentalPricing(vehicleIdentifier, days);
  return {
    total: evalResult.price ?? 0,
    includedKm: evalResult.includedKm ?? 0,
    matchedTier: evalResult.matchedPackage,
    extraKmRate: evalResult.extraKmRate,
    standardRate: evalResult.price ?? 0,
    savings: 0,
    isSupportedDuration: evalResult.isSupportedDuration,
    note: evalResult.note,
    securityDeposit: evalResult.securityDeposit,
  };
}

export function calculateRentalTariff(vehicleIdentifier: string, pickup: Date, dropoff: Date) {
  const diffMs = dropoff.getTime() - pickup.getTime();
  const hours = Math.max(1, diffMs / (1000 * 60 * 60));
  const days = Math.round(hours / 24);
  const evaluation = evaluateRentalPricing(vehicleIdentifier, days);

  return {
    hours,
    days: days || 1,
    isIndividualQuote: !evaluation.isSupportedDuration,
    price: evaluation.price ?? 0,
    includedKm: evaluation.includedKm ?? 0,
    extraKmRate: evaluation.extraKmRate,
    deposit: evaluation.securityDeposit,
    note: evaluation.note,
  };
}

