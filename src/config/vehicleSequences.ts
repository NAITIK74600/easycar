export interface SequenceHotspot {
  id: string;
  name: string;
  category: 'lighting' | 'aero' | 'performance' | 'interior' | 'wheel';
  description: string;
  specs?: string;
  detailImage?: string;
  // Frame range where this hotspot is visible in the sequence
  frameStart: number;
  frameEnd: number;
  // Normalized coordinates (0 to 100%)
  x: number;
  y: number;
}

export interface VehicleSequenceConfig {
  id: string;
  vehicleSlug: string;
  vehicleName: string;
  title: string;
  subtitle: string;
  mode: 'cinematic-approach' | '360-turntable' | 'interior-panorama';
  description: string;
  totalFrames: number;
  width: number;
  height: number;
  aspectRatio: number;
  fps: number;
  posterUrl: string;
  fallbackImage: string;
  getFrameUrl: (index: number) => string;
  hotspots: SequenceHotspot[];
  supportsRotation: boolean; // false for zoom/lateral approach, true for 360 rotation
}

// 1. Audi A5 Sportback Hero Sequence (Extracted from user's landing video in sequence)
export const AUDI_A5_HERO_SEQUENCE: VehicleSequenceConfig = {
  id: 'audi-a5-landing-sequence',
  vehicleSlug: 'audi-a5-sportback',
  vehicleName: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
  title: 'Dynamic Vehicle Reveal & Stance',
  subtitle: '457 High-Fidelity 1080p Sequential Frames',
  mode: 'cinematic-approach',
  description:
    'High-resolution dynamic tracking approach of the Audi A5 Sportback S-Line, revealing the aerodynamic Daytona Grey bodywork, Singleframe matrix grille, and permanent quattro architecture.',
  totalFrames: 457,
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
  fps: 30,
  posterUrl: '/sequences/audi-hero/audi%20seq_00000.jpg',
  fallbackImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
  getFrameUrl: (index: number) => {
    const clamped = Math.max(0, Math.min(456, index));
    const pad = String(clamped).padStart(5, '0');
    return `/sequences/audi-hero/audi%20seq_${pad}.jpg`;
  },
  supportsRotation: false, // User instructed: "Do not label a forward zoom sequence as 360°"
  hotspots: [
    {
      id: 'matrix-headlights',
      name: 'Audi Matrix LED Headlights',
      category: 'lighting',
      description:
        'Dynamic daytime running lights with crystal-clear high-beam segmentation for superior visibility on dark Swiss alpine passes.',
      specs: 'Dynamic turn signals • Adaptive beam shape • Range: 600m',
      detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
      frameStart: 0,
      frameEnd: 220,
      x: 36,
      y: 46,
    },
    {
      id: 'singleframe-grille',
      name: 'S-Line Singleframe Honeycomb Grille',
      category: 'aero',
      description:
        'Sculpted high-gloss titanium black hexagonal radiator grille delivering optimal airflow to the 3.0-litre V6 turbodiesel.',
      specs: 'Gloss Black S-Line trim • Active aerodynamic cooling vents',
      detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
      frameStart: 0,
      frameEnd: 260,
      x: 52,
      y: 53,
    },
    {
      id: 's-line-alloys',
      name: '19" Bi-Colour S-Line Turbine Alloys',
      category: 'wheel',
      description:
        'Diamond-cut lightweight forged alloy wheels wrapped in certified Continental all-weather tyres, ready for all Swiss seasons.',
      specs: '255/35 R19 • Ventilated disc brakes • 5-spoke rotor geometry',
      detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
      frameStart: 120,
      frameEnd: 380,
      x: 74,
      y: 64,
    },
    {
      id: 'quattro-drivetrain',
      name: 'Permanent quattro All-Wheel Drive',
      category: 'performance',
      description:
        'Self-locking central differential distributes torque with 40:60 rear bias, providing unshakeable grip on rain, ice, and mountain switchbacks.',
      specs: '286 PS • 620 Nm Torque • 0-100 km/h: 5.2s',
      detailImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
      frameStart: 200,
      frameEnd: 456,
      x: 62,
      y: 58,
    },
    {
      id: 'acoustic-mirrors',
      name: 'Aerodynamic Acoustic Wing Mirrors',
      category: 'aero',
      description:
        'Heated, auto-dimming wing mirrors with integrated LED side repeater ribbons and blind-spot detection indicators.',
      specs: 'Electrically folding • Curb-view passenger tilt • Heated glass',
      detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
      frameStart: 180,
      frameEnd: 360,
      x: 48,
      y: 38,
    },
  ],
};

// Map of all vehicle sequences
export const VEHICLE_SEQUENCES: Record<string, VehicleSequenceConfig> = {
  'audi-a5-sportback': AUDI_A5_HERO_SEQUENCE,
  'veh-audi-a5': AUDI_A5_HERO_SEQUENCE,
};

export function getSequenceForVehicle(vehicleSlugOrId?: string): VehicleSequenceConfig | null {
  if (!vehicleSlugOrId) return AUDI_A5_HERO_SEQUENCE;
  return VEHICLE_SEQUENCES[vehicleSlugOrId] || AUDI_A5_HERO_SEQUENCE;
}
