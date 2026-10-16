import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Sun, Moon, Sparkles, Layers, Sliders, Play, Pause } from 'lucide-react';

interface Studio3DViewerProps {
  vehicleName?: string;
  initialColor?: string;
  className?: string;
}

interface LightingPreset {
  id: string;
  label: string;
  ambientIntensity: number;
  spot1Color: string;
  spot1Intensity: number;
  spot2Color: string;
  spot2Intensity: number;
  floorColor: string;
}

const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  alpine: {
    id: 'alpine',
    label: 'Alpine Showroom',
    ambientIntensity: 0.45,
    spot1Color: '#ffffff',
    spot1Intensity: 3.2,
    spot2Color: '#e0e5ff',
    spot2Intensity: 1.8,
    floorColor: '#0a0a0c',
  },
  midnight: {
    id: 'midnight',
    label: 'Midnight Neon',
    ambientIntensity: 0.25,
    spot1Color: '#ffffff',
    spot1Intensity: 2.2,
    spot2Color: '#ed1c2e',
    spot2Intensity: 2.8,
    floorColor: '#050507',
  },
  studio: {
    id: 'studio',
    label: 'Pure Studio Daylight',
    ambientIntensity: 0.65,
    spot1Color: '#fff5ea',
    spot1Intensity: 2.8,
    spot2Color: '#d6e4ff',
    spot2Intensity: 2.0,
    floorColor: '#121214',
  },
};

const COLOR_SWATCHES = [
  { name: 'Daytona Grey Pearl', hex: '#2c2e33' },
  { name: 'Mythos Black Metallic', hex: '#111215' },
  { name: 'Glacier White Metallic', hex: '#e8eaed' },
  { name: 'Tango Red Metallic', hex: '#a8131d' },
];

// Procedural stylized Audi Sportback 3D Digital Twin Mesh
const AudiDigitalTwinMesh: React.FC<{ color: string; isAutoRotating: boolean }> = ({ color, isAutoRotating }) => {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    if (groupRef.current && isAutoRotating) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.42, 0]}>
      {/* Lower chassis body */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.6, 1.88]} />
        <meshStandardMaterial
          color={color}
          metalness={0.92}
          roughness={0.16}
          envMapIntensity={1.8}
        />
      </mesh>

      {/* Aerodynamic Sportback Coupé cabin roofline */}
      <mesh position={[-0.15, 0.88, 0]} castShadow>
        <boxGeometry args={[2.5, 0.54, 1.54]} />
        <meshPhysicalMaterial
          color="#060608"
          transmission={0.7}
          opacity={0.88}
          transparent
          roughness={0.08}
          ior={1.52}
        />
      </mesh>

      {/* Panoramic Sunroof Glass */}
      <mesh position={[-0.1, 1.16, 0]}>
        <boxGeometry args={[1.5, 0.02, 1.2]} />
        <meshStandardMaterial color="#020202" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Sloped front hood */}
      <mesh position={[1.45, 0.46, 0]} rotation={[0, 0, -0.14]} castShadow>
        <boxGeometry args={[1.3, 0.28, 1.82]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.16} />
      </mesh>

      {/* Hexagonal Singleframe Grille */}
      <mesh position={[2.22, 0.42, 0]}>
        <boxGeometry args={[0.06, 0.46, 1.15]} />
        <meshStandardMaterial color="#1a1a1d" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Audi 4-Rings Emblem Badge */}
      <mesh position={[2.26, 0.52, 0]}>
        <boxGeometry args={[0.02, 0.08, 0.3]} />
        <meshStandardMaterial color="#dcdcdc" metalness={0.98} roughness={0.1} />
      </mesh>

      {/* Digital Matrix LED Headlight Left */}
      <mesh position={[2.18, 0.52, 0.68]}>
        <boxGeometry args={[0.08, 0.09, 0.36]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Digital Matrix LED Headlight Right */}
      <mesh position={[2.18, 0.52, -0.68]}>
        <boxGeometry args={[0.08, 0.09, 0.36]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Aerodynamic Side Mirrors */}
      <mesh position={[0.7, 0.78, 1.05]}>
        <boxGeometry args={[0.22, 0.12, 0.26]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.78, -1.05]}>
        <boxGeometry args={[0.22, 0.12, 0.26]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Rear Sloped Liftback Tailgate */}
      <mesh position={[-1.75, 0.66, 0]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[1.1, 0.24, 1.76]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.16} />
      </mesh>

      {/* Continuous LED Rear Taillight blade */}
      <mesh position={[-2.22, 0.56, 0]}>
        <boxGeometry args={[0.06, 0.08, 1.74]} />
        <meshBasicMaterial color="#ed1c2e" />
      </mesh>

      {/* Rear S-Line Diffuser & Twin Exhausts */}
      <mesh position={[-2.22, 0.24, 0]}>
        <boxGeometry args={[0.08, 0.18, 1.4]} />
        <meshStandardMaterial color="#1a1a1d" metalness={0.8} roughness={0.5} />
      </mesh>
      <mesh position={[-2.24, 0.22, 0.42]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[-2.24, 0.22, -0.42]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* 19-Inch Wheels */}
      {/* Front Left */}
      <mesh position={[1.35, -0.04, 0.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.28, 36]} />
        <meshStandardMaterial color="#28282b" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Front Right */}
      <mesh position={[1.35, -0.04, -0.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.28, 36]} />
        <meshStandardMaterial color="#28282b" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Rear Left */}
      <mesh position={[-1.35, -0.04, 0.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.28, 36]} />
        <meshStandardMaterial color="#28282b" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Rear Right */}
      <mesh position={[-1.35, -0.04, -0.96]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.28, 36]} />
        <meshStandardMaterial color="#28282b" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
};

export const Studio3DViewer: React.FC<Studio3DViewerProps> = ({
  vehicleName = 'Audi A5 Sportback 3.0 TDI quattro',
  initialColor = '#2c2e33',
  className = '',
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [activeLighting, setActiveLighting] = useState<string>('alpine');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setWebglSupported(supported);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const preset = LIGHTING_PRESETS[activeLighting] || LIGHTING_PRESETS.alpine;

  if (!webglSupported) {
    return (
      <div className={`relative w-full h-full bg-obsidian flex flex-col items-center justify-center p-8 text-center ${className}`}>
        <div className="max-w-md p-6 bg-charcoal border border-white/10 rounded-none shadow-2xl">
          <Sparkles size={28} className="text-brand-red mx-auto mb-3" />
          <h4 className="font-display text-white text-lg font-bold mb-2 uppercase tracking-wider">
            Interactive 3D Studio
          </h4>
          <p className="text-ash text-xs font-mono mb-4 leading-relaxed">
            Hardware acceleration is currently unavailable in this browser environment. You can explore high-resolution interactive photography in the Exterior Explorer and Interior Cockpit modes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-[#09090b] via-[#050506] to-black select-none ${className}`}>
      {/* 3D Canvas Viewport */}
      <Canvas
        shadows
        camera={{ position: [4.6, 2.2, 4.4], fov: 40 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={preset.ambientIntensity} />

          {/* Key Spotlight */}
          <spotLight
            position={[6, 8, 4]}
            angle={0.65}
            penumbra={0.8}
            intensity={preset.spot1Intensity}
            castShadow
            color={preset.spot1Color}
          />

          {/* Fill Spotlight / Accent Light */}
          <spotLight
            position={[-6, 6, -4]}
            angle={0.55}
            penumbra={0.9}
            intensity={preset.spot2Intensity}
            color={preset.spot2Color}
          />

          {/* Top Diffused Studio Glow */}
          <pointLight position={[0, 4.5, 0]} intensity={1.2} color="#ffffff" />

          {/* Reflective Studio Floor */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[32, 32]} />
            <MeshReflectorMaterial
              blur={[400, 100]}
              resolution={512}
              mirror={0.65}
              mixBlur={0.85}
              mixStrength={1.4}
              roughness={0.28}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color={preset.floorColor}
              metalness={0.82}
            />
          </mesh>

          {/* Audi Vehicle Mesh Model */}
          <AudiDigitalTwinMesh color={selectedColor} isAutoRotating={isAutoRotating} />

          {/* 360° Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            minDistance={3.5}
            maxDistance={8.5}
            enablePan={false}
            maxPolarAngle={Math.PI / 2 - 0.04}
            minPolarAngle={Math.PI / 6}
          />
        </Suspense>
      </Canvas>

      {/* Top Left Studio Telemetry Badge */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 text-silver font-mono text-[10px] uppercase tracking-widest shadow-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
        <span>3D WEBGL STUDIO • {vehicleName.toUpperCase()}</span>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Color Swatch Selector */}
        <div className="flex items-center gap-2 p-2 bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
          <span className="text-[10px] font-mono text-silver uppercase tracking-wider pl-1 pr-2 hidden md:inline">
            BODY FINISH:
          </span>
          <div className="flex items-center gap-1.5">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch.name}
                type="button"
                onClick={() => setSelectedColor(swatch.hex)}
                title={swatch.name}
                className={`w-6 h-6 border transition-all cursor-pointer ${
                  selectedColor === swatch.hex
                    ? 'border-brand-red scale-110 shadow-[0_0_10px_rgba(237,28,46,0.6)] ring-1 ring-brand-red'
                    : 'border-white/20 hover:border-white/60'
                }`}
                style={{ backgroundColor: swatch.hex }}
                aria-label={`Select ${swatch.name}`}
              />
            ))}
          </div>
        </div>

        {/* Lighting Atmosphere Selector */}
        <div className="flex items-center gap-1 p-1 bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
          {Object.values(LIGHTING_PRESETS).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveLighting(p.id)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                activeLighting === p.id
                  ? 'bg-brand-red text-white font-bold'
                  : 'text-silver hover:text-white'
              }`}
            >
              {p.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Orbit Control Actions */}
        <div className="flex items-center gap-2 p-1 bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="p-1.5 text-silver hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isAutoRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
            aria-label="Toggle auto rotation"
          >
            {isAutoRotating ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-silver hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Reset 3D camera to front 3/4 angle"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">RESET ANGLE</span>
          </button>
        </div>
      </div>

      {/* Interaction Indicator */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/5 text-[9px] font-mono text-ash tracking-widest uppercase">
          INTERACTIVE 3D STUDIO
        </div>
      </div>
    </div>
  );
};
