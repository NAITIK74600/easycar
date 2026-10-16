export interface RentalTierPackage {
  days: number;
  hours: number;
  label: string;
  price: number;
  includedKm: number;
}

export interface PricingResult {
  isSupportedDuration: boolean;
  pricingMode: 'standard_package' | 'individual_quote';
  vehicleModel: string;
  totalDays: number;
  totalHours: number;
  price: number | null; // null if individual quote required
  includedKm: number | null;
  extraKmRate: number;
  securityDeposit: number;
  currency: string;
  fuelIncluded: boolean;
  statusNote: string;
}

export const A3_PACKAGES: Record<number, RentalTierPackage> = {
  1: { days: 1, hours: 24, label: '1 day / 24 hours', price: 65, includedKm: 150 },
  3: { days: 3, hours: 72, label: '3 days / 72 hours', price: 180, includedKm: 450 },
  7: { days: 7, hours: 168, label: '7 days', price: 350, includedKm: 1000 },
  14: { days: 14, hours: 336, label: '14 days', price: 590, includedKm: 1500 },
  30: { days: 30, hours: 720, label: '30 days', price: 950, includedKm: 2000 },
};

export const A5_PACKAGES: Record<number, RentalTierPackage> = {
  1: { days: 1, hours: 24, label: '1 day / 24 hours', price: 110, includedKm: 200 },
  3: { days: 3, hours: 72, label: '3 days / 72 hours', price: 300, includedKm: 600 },
  7: { days: 7, hours: 168, label: '7 days', price: 690, includedKm: 1200 },
  14: { days: 14, hours: 336, label: '14 days', price: 1190, includedKm: 1800 },
  30: { days: 30, hours: 720, label: '30 days', price: 1790, includedKm: 2500 },
};

/**
 * Calculates rental duration and pricing based strictly on agreed Swiss 24-hour packages.
 * Unsupported durations (e.g., 2, 4, 5, 6, 8-13, 15-29, or >30 days) require an individual quote.
 */
export function calculateRentalTariff(
  vehicleIdentifier: string,
  pickupDateStr: string,
  returnDateStr: string
): PricingResult {
  const isA5 = (vehicleIdentifier || '').toLowerCase().includes('a5');
  const vehicleModel = isA5
    ? 'Audi A5 Sportback 3.0 TDI quattro S-Line'
    : 'Audi A3 Sportback 1.8 TFSI quattro';

  const extraKmRate = isA5 ? 0.50 : 0.35;
  const securityDeposit = isA5 ? 500 : 300;
  const packages = isA5 ? A5_PACKAGES : A3_PACKAGES;

  const startMs = new Date(pickupDateStr).getTime();
  const endMs = new Date(returnDateStr).getTime();

  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
    return {
      isSupportedDuration: false,
      pricingMode: 'individual_quote',
      vehicleModel,
      totalDays: 0,
      totalHours: 0,
      price: null,
      includedKm: null,
      extraKmRate,
      securityDeposit,
      currency: 'CHF',
      fuelIncluded: false,
      statusNote: 'Invalid rental period. Return time must be after pickup time.',
    };
  }

  const diffHours = (endMs - startMs) / (1000 * 60 * 60);
  // Standard rule: 1 rental day = 24 hours (rounded up)
  const days = Math.max(1, Math.ceil(diffHours / 24));

  const matchedPackage = packages[days];

  if (matchedPackage) {
    return {
      isSupportedDuration: true,
      pricingMode: 'standard_package',
      vehicleModel,
      totalDays: days,
      totalHours: Math.round(diffHours * 10) / 10,
      price: matchedPackage.price,
      includedKm: matchedPackage.includedKm,
      extraKmRate,
      securityDeposit,
      currency: 'CHF',
      fuelIncluded: false,
      statusNote: `${matchedPackage.label}: CHF ${matchedPackage.price} (includes ${matchedPackage.includedKm.toLocaleString()} km). Fuel excluded. Deposit CHF ${securityDeposit} payable at pickup.`,
    };
  }

  // Unsupported duration or > 30 days
  return {
    isSupportedDuration: false,
    pricingMode: 'individual_quote',
    vehicleModel,
    totalDays: days,
    totalHours: Math.round(diffHours * 10) / 10,
    price: null,
    includedKm: null,
    extraKmRate,
    securityDeposit,
    currency: 'CHF',
    fuelIncluded: false,
    statusNote: 'Individual quote required. Our team will review your requested duration and provide a customized quote.',
  };
}
