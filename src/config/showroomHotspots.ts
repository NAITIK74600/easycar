export interface ComponentHotspot {
  id: string;
  name: string;
  subtitle: string;
  category: 'exterior' | 'interior' | 'technical';
  x: number; // Percentage 0-100 relative to source image width
  y: number; // Percentage 0-100 relative to source image height
  viewImage: string; // The primary view image this hotspot belongs to
  closeupImage: string; // High-resolution verified photograph of this specific component
  description: string;
  verifiedSpecs: Record<string, string>;
  bookingNote?: string;
}

export interface VehicleShowroomConfig {
  vehicleId: string;
  vehicleName: string;
  exteriorViews: {
    id: string;
    label: string;
    image: string;
    hotspots: ComponentHotspot[];
  }[];
  interiorViews: {
    id: string;
    label: string;
    image: string;
    hotspots: ComponentHotspot[];
  }[];
}

/* ==========================================================================
   AUDI A5 SPORTBACK 3.0 TDI QUATTRO S-LINE (2018) — SHOWROOM SPECIFICATION
   ========================================================================== */
export const AUDI_A5_SHOWROOM_CONFIG: VehicleShowroomConfig = {
  vehicleId: 'veh-audi-a5',
  vehicleName: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
  exteriorViews: [
    {
      id: 'ext-front-three-quarter',
      label: 'FRONT THREE-QUARTER',
      image: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
      hotspots: [
        {
          id: 'grille',
          name: 'Hexagonal Singleframe Grille',
          subtitle: 'quattro Titanium Optics',
          category: 'exterior',
          x: 17.5,
          y: 71.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
          description: 'Wide sculpted hexagonal honeycomb front architecture with matte black air inlets, optimized for twin intercooler airflow to the 3.0L V6 286 PS turbodiesel.',
          verifiedSpecs: {
            'Architecture': 'Singleframe Hexagonal Honeycomb',
            'Badging': 'quattro All-Wheel Drive Chrome Emblem',
            'Air Ducts': 'Functional Lateral Intercooler Inlets',
            'Radar Housing': 'Integrated Adaptive Cruise Sensors',
          },
          bookingNote: 'Verified undamaged condition during pre-rental inspection.',
        },
        {
          id: 'headlights',
          name: 'Digital Matrix LED Headlights',
          subtitle: 'Adaptive Anti-Dazzle High Beam',
          category: 'exterior',
          x: 39.5,
          y: 64.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
          description: 'Adaptive Matrix LED technology with dynamic sweeping indicator staging and automatic road-edge masking for safe nighttime Swiss alpine transit.',
          verifiedSpecs: {
            'Lighting Technology': 'Audi Digital Matrix LED',
            'Beam Precision': 'Pixelated Multi-Segment Array',
            'Dynamic Lighting': 'Animated Sweeping Turn Signals',
            'Safety Feature': 'Automatic Anti-Dazzle Cornering',
          },
          bookingNote: 'Included as standard factory equipment on Easy Cars Biel Audi A5.',
        },
        {
          id: 'wheels',
          name: '19" S-Line Sport Alloy Wheels',
          subtitle: 'Continental High-Grip Swiss Compound',
          category: 'exterior',
          x: 59.5,
          y: 76.5,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
          description: 'Original equipment 19-inch bi-color turbine alloy rims fitted with certified Swiss all-weather high-tread tires for maximum wet grip across mountain passes.',
          verifiedSpecs: {
            'Wheel Dimension': '19-Inch Multi-Spoke Bi-Color',
            'Tire Specification': 'All-Season Swiss Alpine Certified',
            'Tread Depth': 'Verified > 6.0 mm Safety Standard',
            'Braking System': 'Ventilated Disc Brakes with ABS',
          },
          bookingNote: 'Tire condition and pressure certified before every rental handover.',
        },
        {
          id: 'side-panels',
          name: 'S-Line Front Fender & Flared Arches',
          subtitle: 'Lightweight Aluminum Construction',
          category: 'exterior',
          x: 58.0,
          y: 51.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
          description: 'Distinctive flared wheel arch contour housing the wider front track, adorned with authentic Audi S-Line chrome and matte titanium wing emblem.',
          verifiedSpecs: {
            'Material': 'Formed High-Tensile Aluminum',
            'Insignia': 'Authentic Audi S-Line Chrome Emblem',
            'Paint Finish': 'Daytona Grey Pearl Metallic',
            'Clearcoat': 'Ceramic Wax Protective Sealant',
          },
        },
        {
          id: 'mirrors',
          name: 'Aerodynamic Side Mirrors',
          subtitle: 'Heated & Power Folding with LED Signals',
          category: 'exterior',
          x: 72.0,
          y: 35.5,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
          description: 'Aero-sculpted exterior mirrors with integrated sweeping LED direction indicators, automatic dimming, and electric defogging heating elements.',
          verifiedSpecs: {
            'Adjustment': 'Electric Power Adjustable & Folding',
            'Heating': 'Automatic Thermal Mirror Defrost',
            'Indicator': 'Integrated Dynamic Amber LED Strip',
            'Glass Finish': 'Hydrophobic Tinted Convex Mirror',
          },
        },
        {
          id: 'doors',
          name: 'Frameless Coupé Doors & Tornado Line',
          subtitle: 'Acoustic Double Glazing',
          category: 'exterior',
          x: 82.5,
          y: 53.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          description: 'Signature frameless coupé door design with acoustic double-glazing, automatic window index drop upon door handle actuation, and continuous Tornado shoulder line.',
          verifiedSpecs: {
            'Door Architecture': 'Frameless Sport Coupé Design',
            'Acoustic Glass': 'Double-Laminated Sound Insulation',
            'Body Crease': 'Continuous Tornado Shoulder Line',
            'Handles': 'Flush Ergonomic Pull Handles',
          },
        },
        {
          id: 'panoramic-roof',
          name: 'Electric Panoramic Glass Roof',
          subtitle: 'Tinted UV Protection & Alpine View',
          category: 'exterior',
          x: 60.0,
          y: 14.5,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_09.jpeg',
          description: 'Expansive tinted panoramic glass sunroof flooding the cabin with natural Swiss light, equipped with electric tilt/slide operation and power sunshade roller blind.',
          verifiedSpecs: {
            'Glass Type': 'Acoustic High-Tint Safety Glass',
            'Operation': 'Electric Tilt & Slide One-Touch',
            'Sunblind': 'Integrated Powered Blackout Blind',
          },
        },
        {
          id: 'rear-wheel',
          name: 'Rear Axle quattro Stance & Alloy Wheel',
          subtitle: 'Dynamic Torque Vectoring Hub',
          category: 'exterior',
          x: 92.5,
          y: 65.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
          description: 'Muscular rear haunch contour housing the 19-inch rear sport alloy wheel, engineered with permanent mechanical quattro self-locking center differential.',
          verifiedSpecs: {
            'Drivetrain': 'quattro Permanent All-Wheel Drive',
            'Torque Split': '40:60 Asymmetric Dynamic Distribution',
            'Rear Rims': '19-Inch Bi-Color Multi-Spoke',
          },
        },
      ],
    },
    {
      id: 'ext-side-profile',
      label: 'SIDE PROFILE',
      image: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
      hotspots: [
        {
          id: 'side-wheels-front',
          name: '19" Front S-Line Turbine Alloys',
          subtitle: 'Continental High-Grip Swiss Compound',
          category: 'exterior',
          x: 20.0,
          y: 68.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
          description: 'Front 19-inch bi-color turbine alloy wheel with certified high-tread Swiss alpine compound for sharp steering turn-in.',
          verifiedSpecs: {
            'Dimension': '19-Inch Multi-Spoke',
            'Tread Standard': '> 6.0 mm Verified Safety Margin',
          },
        },
        {
          id: 'side-mirror',
          name: 'Aerodynamic Side Mirror',
          subtitle: 'Heated & Power Folding with LED Indicator',
          category: 'exterior',
          x: 38.0,
          y: 34.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
          description: 'Aero-sculpted exterior mirror housing with integrated dynamic sweeping turn signal and heating defroster.',
          verifiedSpecs: {
            'Adjustment': 'Power Electric Folding & Heated',
            'Signal': 'Integrated Amber Dynamic LED',
          },
        },
        {
          id: 'side-front-door',
          name: 'Frameless Front Coupé Door',
          subtitle: 'Acoustic Double Glazed Glass',
          category: 'exterior',
          x: 46.0,
          y: 48.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          description: 'Driver frameless door featuring acoustic lamination that eliminates high-speed wind buffeting on Swiss motorways.',
          verifiedSpecs: {
            'Glazing': 'Double-Laminated Acoustic Insulation',
            'Operation': 'Automatic Index Window Drop',
          },
        },
        {
          id: 'side-rear-door',
          name: 'Frameless Rear Passenger Door',
          subtitle: 'Executive 4-Door Sportback Access',
          category: 'exterior',
          x: 63.0,
          y: 48.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          description: 'Full-sized rear passenger door seamlessly integrated into the sweeping coupé silhouette for effortless passenger entry.',
          verifiedSpecs: {
            'Design': '4-Door Sportback Coupé',
            'Child Lock': 'Electronic Driver Cabin Control',
          },
        },
        {
          id: 'side-roofline',
          name: 'Sweeping Coupé Roof Architecture',
          subtitle: 'Signature Wave Shoulder Crease',
          category: 'exterior',
          x: 58.0,
          y: 25.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_09.jpeg',
          description: 'Iconic roof contour descending towards the rear liftback, combining GT aesthetics with spacious 5-passenger practicality.',
          verifiedSpecs: {
            'Drag Coefficient': '0.27 Cd Optimized Aero Profile',
            'Roof Load': 'Certified for Ski Racks and Carriers',
          },
        },
        {
          id: 'side-wheels-rear',
          name: '19" Rear S-Line Turbine Alloys',
          subtitle: 'quattro Dynamic All-Weather Grip',
          category: 'exterior',
          x: 82.0,
          y: 68.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
          description: 'Rear 19-inch turbine rim with wide contact patch delivering 620 Nm of torque directly to the pavement without slippage.',
          verifiedSpecs: {
            'Braking': 'Disc Brakes with Electronic Stabilization',
            'Drive': 'quattro Permanent AWD',
          },
        },
      ],
    },
    {
      id: 'ext-rear-three-quarter',
      label: 'BACK & REAR DIFFUSER',
      image: '/assets/vehicles/audi-a5/exterior/a5_03.jpeg',
      hotspots: [
        {
          id: 'rear-lights',
          name: 'Dynamic LED Taillights',
          subtitle: 'Sweeping Indicator Sequence',
          category: 'exterior',
          x: 62.0,
          y: 44.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_03.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_14.jpeg',
          description: 'Three-dimensional sculptural LED rear light clusters featuring sweeping dynamic indicator animation and automatic vehicle departure lighting.',
          verifiedSpecs: {
            'Lighting Unit': 'Full 3D Sculptured LED Cluster',
            'Turn Indicators': 'Dynamic Sequential Staging',
            'Brake Lamps': 'High-Intensity Rapid Reaction LEDs',
            'Housing': 'Smoked Ruby Red Lens Cluster',
          },
        },
        {
          id: 'tailgate',
          name: 'Electric Fastback Tailgate',
          subtitle: 'Wide-Aperture Cargo Access',
          category: 'exterior',
          x: 48.0,
          y: 35.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_03.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_13.jpeg',
          description: 'Full-lifting electric tailgate encompassing the rear windshield, offering wide and accessible luggage loading for Swiss ski trips and executive luggage.',
          verifiedSpecs: {
            'Operation': 'Electric Push-Button Opening & Closing',
            'Cargo Hold': '480 Litres (1,280L Folded Seats)',
            'Load Lip': 'Low-Profile Stainless Steel Edge',
            'Accessory': 'Luggage Retaining Net & 12V Socket',
          },
          bookingNote: '480L volume easily accommodates 3 large suitcases or full ski gear.',
        },
        {
          id: 'bumper-exhaust',
          name: 'S-Line Rear Diffuser & Dual Exhaust',
          subtitle: 'Chrome Oval Twin Tailpipes',
          category: 'exterior',
          x: 68.0,
          y: 78.0,
          viewImage: '/assets/vehicles/audi-a5/exterior/a5_03.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/exterior/details/a5_14.jpeg',
          description: 'Rear aerodynamic diffuser blade with twin chrome exhaust pipes channeling the exhaust gases of the 286 PS 3.0 TDI V6 engine.',
          verifiedSpecs: {
            'Diffuser': 'S-Line Honeycomb Aerodynamic Blade',
            'Exhaust': 'Dual Chrome Chrome-Plated Outlets',
            'Sensors': 'Integrated Acoustic Parking Sensors',
            'Camera': 'Discreet Reversing Camera Housing',
          },
        },
      ],
    },
  ],
  interiorViews: [
    {
      id: 'int-cockpit-overview',
      label: 'DRIVER SANCTUARY & MMI',
      image: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
      hotspots: [
        {
          id: 'steering-wheel',
          name: 'S-Line Sport Multifunction Steering Wheel',
          subtitle: 'Perforated Leather with Shift Paddles',
          category: 'interior',
          x: 48.0,
          y: 65.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          description: 'Ergonomic 3-spoke leather-trimmed sport steering wheel with flat bottom, S-Line emblem, tactile aluminium paddle shifters, and multifunction controls for audio, phone, and virtual cockpit navigation.',
          verifiedSpecs: {
            'Design': 'S-Line Flat-Bottom Sport Architecture',
            'Grip Material': 'Perforated Nappa Leather with Contrast Seam',
            'Shift Controls': 'Electroplated Cast Aluminum Paddles',
            'Multifunction Keys': 'Integrated View, Media, and Voice Keys',
          },
          bookingNote: 'Cleaned and sanitized before every handover.',
        },
        {
          id: 'instrument-cluster',
          name: 'Audi Virtual Cockpit Plus',
          subtitle: '12.3-Inch Full HD Digital Instrument Display',
          category: 'interior',
          x: 42.0,
          y: 38.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          description: 'Brilliant 12.3-inch Full HD digital instrument cluster configurable between Classic twin-dial view and fullscreen 3D Google Earth terrain navigation map directly in the driver\'s primary sightline.',
          verifiedSpecs: {
            'Screen Resolution': '1920 x 720 Full HD Color Display',
            'Display Modes': 'Classic, Sport, and Dynamic Viewports',
            'GPS Integration': 'Full Screen Map View with Elevation',
            'Telemetry': 'Speed, RPM, Quattro Distribution, G-Meter',
          },
        },
        {
          id: 'infotainment-display',
          name: 'MMI Navigation Plus with Apple CarPlay',
          subtitle: 'Smartphone Interface & Swiss GPS',
          category: 'interior',
          x: 74.0,
          y: 36.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_06.jpeg',
          description: 'High-resolution color center touchscreen with 3D Swiss navigation, Apple CarPlay, Android Auto, Bluetooth audio streaming, and DAB+ digital radio.',
          verifiedSpecs: {
            'Smartphone Sync': 'Apple CarPlay & Android Auto Supported',
            'Navigation': 'Pre-Loaded Swiss & European Highway GPS',
            'Audio Connectivity': 'Bluetooth 5.0, Dual USB-A & AUX',
            'Sound Tuning': 'Audi Sound System Multi-Speaker DSP',
          },
          bookingNote: 'Connect your smartphone instantly for Spotify and Google Maps navigation.',
        },
        {
          id: 'dashboard-vents',
          name: 'Horizontal Architecture & Dual-Zone Climate',
          subtitle: 'Acoustic Precision Air Distribution',
          category: 'interior',
          x: 65.0,
          y: 48.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_06.jpeg',
          description: 'Continuous horizontal air vent strip providing draft-free cabin ventilation, paired with dual-zone automatic digital climate control and pollen ionizer filter.',
          verifiedSpecs: {
            'Climate Control': '2-Zone Fully Automatic Climatronic',
            'Air Filtration': 'Allergen & Fine Dust Activated Charcoal',
            'Trim Inlays': 'Brushed Matte Aluminum Facets',
            'Cabin Sanitization': 'Ozone-Purified Before Each Customer',
          },
        },
        {
          id: 'center-console',
          name: 'Center Console & Tiptronic Gear Selector',
          subtitle: 'Shift-by-Wire Automatic & Drive Select',
          category: 'interior',
          x: 60.0,
          y: 84.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_12.jpeg',
          description: 'Low-profile leather-wrapped Tiptronic gear selector, electronic parking brake with auto-hold function, Audi Drive Select mode toggles (Comfort, Auto, Dynamic, Individual), and twin cupholders.',
          verifiedSpecs: {
            'Transmission': '8-Speed Tiptronic Smooth Automatic',
            'Drive Modes': 'Audi Drive Select (Dynamic, Comfort, Auto)',
            'Brake Assist': 'Electromechanical Parking Brake + Auto Hold',
            'Power Ports': '12V Power Socket + Dual USB Outlets',
          },
        },
      ],
    },
    {
      id: 'int-seating-comfort',
      label: 'SEATING, ROOF & LUGGAGE',
      image: '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
      hotspots: [
        {
          id: 'front-seats',
          name: 'S-Line Heated Sports Seats with Massage Function',
          subtitle: 'Ergonomic Lateral Support & Multi-Program Massage',
          category: 'interior',
          x: 48.0,
          y: 52.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
          description: 'Contoured S-Line sport seats in premium leather/fabric combination featuring rapid multi-stage seat heating, pneumatic 4-way lumbar adjustment, and integrated multi-program driver back massage.',
          verifiedSpecs: {
            'Upholstery': 'S-Line Leather/Fabric with Contrast Stitching',
            'Heating': 'Rapid 3-Stage Heating for Driver & Passenger',
            'Massage Function': 'Pneumatic 3-Program Lumbar Massage',
            'Adjustment': 'Multi-Directional Power Adjustment',
          },
          bookingNote: 'Massage seats significantly reduce fatigue on long journeys across Switzerland.',
        },
        {
          id: 'panoramic-roof',
          name: 'Electric Panoramic Glass Sunroof',
          subtitle: 'Panoramic Alpine Vista & Sunblind',
          category: 'interior',
          x: 52.0,
          y: 18.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_09.jpeg',
          description: 'Expansive tinted panoramic glass sunroof flooding the cabin with natural Swiss light, equipped with electric tilt/slide operation and power sunshade roller blind.',
          verifiedSpecs: {
            'Glass Surface': 'UV-Reflective Tinted Safety Glass',
            'Operation': 'One-Touch Electric Tilt and Slide',
            'Sunblind': 'Electrically Operated Blackout Roller',
            'Wind Deflector': 'Integrated Aerodynamic Mesh Deflector',
          },
        },
        {
          id: 'rear-seating',
          name: 'Rear Passenger Cabin',
          subtitle: '3-Passenger Seating with ISOFIX Anchors',
          category: 'interior',
          x: 25.0,
          y: 72.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_08.jpeg',
          description: 'Spacious rear seating accommodating 3 passengers with ample legroom, dedicated rear ventilation outlets, folding center armrest with cupholders, and certified ISOFIX child seat anchor points.',
          verifiedSpecs: {
            'Capacity': '3 Full Passenger Seats with Headrests',
            'Child Safety': 'ISOFIX Top-Tether Child Seat Anchors',
            'Ventilation': 'Rear Central Climate Air Outlets',
            'Flexibility': '40:20:40 Split-Folding Rear Seatbacks',
          },
        },
        {
          id: 'boot-capacity',
          name: 'Fastback Luggage Compartment',
          subtitle: '480L Cargo Hold (1,280L Max)',
          category: 'interior',
          x: 82.0,
          y: 60.0,
          viewImage: '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
          closeupImage: '/assets/vehicles/audi-a5/interior/a5_13.jpeg',
          description: 'Deep and wide 480-liter luggage hold with low loading sill, luggage tie-down hooks, side storage nets, and 40:20:40 split-folding rear seats extending capacity to 1,280 liters.',
          verifiedSpecs: {
            'Base Capacity': '480 Litres',
            'Extended Capacity': '1,280 Litres with Folded Seats',
            'Loading Width': '1,000 mm Flat Load Floor',
            'Convenience': 'Under-Floor Storage Compartment',
          },
        },
      ],
    },
  ],
};

/* ==========================================================================
   AUDI A3 SPORTBACK 1.8 TFSI QUATTRO (2011) — SHOWROOM SPECIFICATION
   ========================================================================== */
export const AUDI_A3_SHOWROOM_CONFIG: VehicleShowroomConfig = {
  vehicleId: 'veh-audi-a3',
  vehicleName: 'Audi A3 Sportback 1.8 TFSI quattro',
  exteriorViews: [
    {
      id: 'ext-front-a3',
      label: 'EXTERIOR VIEW',
      image: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
      hotspots: [
        {
          id: 'headlights-a3',
          name: 'Audi Halogen & Daytime Headlamps',
          subtitle: 'Clear Lens Anti-Fog Optics',
          category: 'exterior',
          x: 72.0,
          y: 54.0,
          viewImage: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
          description: 'Aerodynamic clear-lens headlights with integrated high-beam reflectors and daytime running lights, calibrated for Swiss canton road requirements.',
          verifiedSpecs: {
            'Type': 'Reflector High-Beam Anti-Fog Headlamps',
            'Lens Material': 'Impact-Resistant Polycarbonate',
            'Visibility': 'Certified Swiss Road Standard',
          },
        },
        {
          id: 'grille-a3',
          name: 'Singleframe Grille with quattro Emblem',
          subtitle: '1.8 TFSI Turbo Induction Cooling',
          category: 'exterior',
          x: 52.0,
          y: 62.0,
          viewImage: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
          description: 'Signature Audi Singleframe radiator grille directing fresh cooling air to the 160 PS 1.8L TFSI turbocharged petrol engine and intercooler.',
          verifiedSpecs: {
            'Engine Cooling': 'Active Airflow Singleframe Inlet',
            'Badging': 'Genuine quattro All-Wheel Drive Badge',
            'Engine': '1.8-Liter TFSI Turbo Petrol (160 PS)',
          },
        },
        {
          id: 'wheels-a3',
          name: 'Audi OEM Alloy Wheels with All-Weather Tires',
          subtitle: 'quattro Permanent All-Wheel Drive',
          category: 'exterior',
          x: 26.0,
          y: 72.0,
          viewImage: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/exterior/a3_09.jpeg',
          description: 'Original equipment multi-spoke alloy wheels fitted with certified Swiss all-weather tires, delivering reliable traction and braking on snowy alpine roads.',
          verifiedSpecs: {
            'Drivetrain': 'quattro Permanent All-Wheel Drive',
            'Tires': 'All-Season M+S Certified Tires',
            'Safety': 'Electronic Stability Program (ESP) + ABS',
          },
        },
        {
          id: 'rear-hatch-a3',
          name: '5-Door Sportback Hatchback',
          subtitle: 'Compact Swiss Urban Versatility',
          category: 'exterior',
          x: 15.0,
          y: 50.0,
          viewImage: '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/exterior/a3_03.jpeg',
          description: 'Practical 5-door Sportback architecture with rear tailgate access and 370L luggage hold, ideal for parking in Biel/Bienne city centers and station hubs.',
          verifiedSpecs: {
            'Doors': '5 Doors with Child Locks',
            'Boot Capacity': '370 Litres (1,100L Max)',
            'Seats': '5 Full Seats with Head Restraints',
          },
        },
      ],
    },
  ],
  interiorViews: [
    {
      id: 'int-cockpit-a3',
      label: 'COCKPIT & SEATS',
      image: '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
      hotspots: [
        {
          id: 'transmission-a3',
          name: 'Manual 6-Speed Gearbox',
          subtitle: 'Direct Mechanical Driving Engagement',
          category: 'interior',
          x: 52.0,
          y: 78.0,
          viewImage: '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
          description: 'Short-throw 6-speed manual transmission delivering precise gear changes and direct driver feedback through Swiss pass serpentines.',
          verifiedSpecs: {
            'Transmission': '6-Speed Manual Gearbox',
            'Clutch': 'Hydraulic Assist Clutch',
            'Drive': 'Permanent quattro All-Wheel Drive',
          },
        },
        {
          id: 'seats-a3',
          name: 'Heated Front Comfort Seats',
          subtitle: 'Integrated Seat Heating & Lumbar Support',
          category: 'interior',
          x: 32.0,
          y: 58.0,
          viewImage: '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/interior/a3_05.jpeg',
          description: 'Ergonomic fabric sport seats equipped with multi-stage seat heating, manual height adjustment, and manual lumbar adjustment.',
          verifiedSpecs: {
            'Heating': 'Multi-Stage Driver & Passenger Seat Heating',
            'Fabric': 'Durable Dark Anthracite Textile',
            'Climate': 'Air Conditioning System with Recirculation',
          },
        },
        {
          id: 'multimedia-a3',
          name: 'Audi Concert Audio & Tempomat',
          subtitle: 'AUX/USB Interface & Cruise Control',
          category: 'interior',
          x: 62.0,
          y: 42.0,
          viewImage: '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
          closeupImage: '/assets/vehicles/audi-a3/interior/a3_06.jpeg',
          description: 'Audi Concert sound system with CD/MP3 drive, AUX-in audio port for smartphone connection, and Tempomat cruise control for relaxed motorway cruising.',
          verifiedSpecs: {
            'Audio': 'Audi Concert Stereo with AUX/USB Input',
            'Speed Control': 'Tempomat Cruise Control System',
            'Safety': 'Front, Side, and Curtain Airbags',
          },
        },
      ],
    },
  ],
};

export function getShowroomConfig(vehicleSlugOrId: string): VehicleShowroomConfig {
  const isA5 = (vehicleSlugOrId || '').toLowerCase().includes('a5');
  return isA5 ? AUDI_A5_SHOWROOM_CONFIG : AUDI_A3_SHOWROOM_CONFIG;
}
