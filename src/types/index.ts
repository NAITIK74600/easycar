export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  hours?: Record<string, string>;
  is_active: number;
}

export interface Hotspot {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  x: number;
  y: number;
  category?: string;
  detailImage?: string;
}

export interface VehicleSpecifications {
  baujahr?: string;
  motor?: string;
  leistung?: string;
  kraftstoff?: string;
  getriebe?: string;
  antrieb?: string;
  sitzplaetze?: string;
  tueren?: string;
  standort?: string;
  deposit?: number;
  extra_km_price?: number;
  engine?: string;
  power?: string;
  torque?: string;
  acceleration?: string;
  top_speed?: string;
  fuel_consumption?: string;
  drivetrain?: string;
  transmission?: string;
  pricing?: {
    tiers: Array<{ period: string; price: number; km: number }>;
    extra_km_price: number;
    fuel_included: boolean;
    security_deposit: number;
  };
}

export interface InspectionData {
  inspection_id?: string;
  inspection_date?: string;
  inspector?: string;
  mileage?: string;
  exterior_condition?: string;
  tires_wheels?: string;
  interior_cleanliness?: string;
  maintenance_record?: string;
  verification_status?: string;
  disclaimer?: string;
}

export interface SequenceConfig {
  sequenceId: string;
  directory: string;
  totalFrames: number;
  namingConvention: string;
  poster: string;
  fps?: number;
  scrollRange?: [number, number];
  videoUrl?: string;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: 'compact' | 'estate' | 'sedan' | 'suv' | 'sport' | string;
  daily_rate: number;
  currency: string;
  seats: number;
  doors: number;
  transmission: string;
  fuel_type: string;
  engine?: string;
  power?: string;
  color?: string;
  description: string;
  features: string[];
  specifications: VehicleSpecifications;
  images: string[];
  interior_images: string[];
  cinematic_manifest?: Record<string, SequenceConfig>;
  inspection_data?: InspectionData;
  location_id?: string;
  location_name?: string;
  location_city?: string;
  location_address?: string;
  security_deposit: number;
  extra_km_rate: number;
  is_available: number;
  is_featured: number;
}

export interface Extra {
  id: string;
  name: string;
  description: string;
  daily_rate: number;
  flat_rate: number | null;
  category: string;
  is_active: number;
}

export type BookingStatus =
  | 'request_received'
  | 'under_review'
  | 'awaiting_customer_acceptance'
  | 'awaiting_payment'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'rental_active'
  | 'completed';

export type PaymentStatus =
  | 'unpaid'
  | 'payment_pending'
  | 'paid'
  | 'cash_due'
  | 'refunded'
  | 'partially_refunded';

export type DepositStatus =
  | 'not_collected'
  | 'collected'
  | 'partially_deducted'
  | 'repayment_pending'
  | 'repaid'
  | 'under_review';

export interface Booking {
  id: string;
  booking_ref: string;
  vehicle_id: string;
  vehicle_name?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_slug?: string;
  vehicle_images?: string[];
  pickup_date: string;
  return_date: string;
  pickup_location_name?: string;
  pickup_address?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_license?: string;
  extras: string[];
  daily_rate: number;
  total_days: number;
  total_hours: number;
  pricing_mode: 'standard_package' | 'individual_quote';
  base_rental_amount: number;
  included_mileage: number;
  extra_km_rate: number;
  security_deposit: number;
  deposit_status: DepositStatus;
  deposit_receipt_ref?: string;
  deposit_repayment_notes?: string;
  delivery_requested: number;
  delivery_address?: string;
  delivery_postcode?: string;
  delivery_preferred_time?: string;
  delivery_instructions?: string;
  delivery_fee: number;
  chauffeur_requested: number;
  chauffeur_pickup_address?: string;
  chauffeur_destination?: string;
  chauffeur_service_type?: string;
  chauffeur_passengers?: number;
  chauffeur_estimated_duration?: string;
  chauffeur_details?: string;
  chauffeur_fee: number;
  out_of_country_travel: number;
  additional_driver_requested: number;
  customer_message?: string;
  payment_preference: 'online' | 'cash' | 'cash_at_pickup';
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  total_price?: number;
  currency: string;
  terms_accepted: number;
  terms_accepted_at?: string;
  terms_version?: string;
  owner_notes?: string;
  quote_expires_at?: string;
  quote_issued_at?: string;
  quote_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_license?: string;
  delivery_requested?: boolean;
  delivery_address?: string;
  delivery_postcode?: string;
  delivery_preferred_time?: string;
  delivery_instructions?: string;
  chauffeur_requested?: boolean;
  chauffeur_pickup_address?: string;
  chauffeur_destination?: string;
  chauffeur_service_type?: string;
  chauffeur_passengers?: number;
  chauffeur_estimated_duration?: string;
  chauffeur_details?: string;
  out_of_country_travel?: boolean;
  travel_outside_switzerland?: boolean;
  additional_driver_requested?: boolean;
  additional_driver?: boolean;
  customer_message?: string;
  notes?: string;
  payment_preference: 'online' | 'cash' | 'cash_at_pickup';
  terms_accepted: boolean;
  extras?: string[];
}

export interface Inspection {
  id: string;
  booking_id: string;
  vehicle_id?: string;
  pickup_odometer?: number;
  pickup_fuel_level?: string;
  pickup_cleanliness?: string;
  pickup_existing_damage?: string;
  pickup_damage_notes?: string;
  pickup_photos?: string;
  pickup_keys_handed_over?: number;
  pickup_customer_ack?: number;
  pickup_owner_ack?: number;
  pickup_recorded_at?: string;
  return_odometer?: number;
  return_fuel_level?: string;
  return_cleanliness?: string;
  return_new_damage?: string;
  return_damage_notes?: string;
  return_photos?: string;
  return_keys_returned?: number;
  return_customer_ack?: number;
  return_owner_ack?: number;
  return_recorded_at?: string;
  actual_distance_km?: number;
  additional_km?: number;
  additional_km_charge?: number;
  extra_km_charge?: number;
  fuel_surcharge?: number;
  cleaning_surcharge?: number;
  damage_charges?: number;
  deposit_deductions_total?: number;
  deposit_refund_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilityBlock {
  id: string;
  vehicle_id: string;
  vehicle_name?: string;
  vehicle_slug?: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes?: string;
  created_at?: string;
}

export interface EmailLog {
  id: string;
  booking_id?: string;
  recipient?: string;
  recipient_email?: string;
  subject: string;
  type?: string;
  event_type?: string;
  body_preview?: string;
  status: string;
  created_at: string;
}

export interface OwnerOverview {
  new_requests?: number;
  under_review?: number;
  awaiting_acceptance?: number;
  upcoming_confirmed?: number;
  active_rentals?: number;
  pending_online_payments?: number;
  cash_due?: number;
  deposits_pending_repayment?: number;
  completed_rentals?: number;
  // Aliases for dashboard KPI
  requests_received?: number;
  quotes_pending_acceptance?: number;
  confirmed_upcoming?: number;
  cash_due_at_pickup?: number;
  payments_pending?: number;
  deposits_repayment_pending?: number;
}
