import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Vehicle3DProps {
  color?: string;
}

// Procedural stylized automotive silhouette mesh
const ProceduralCarMesh: React.FC<Vehicle3DProps> = ({ color = '#1c1c1e' }) => {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating yaw rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.45, 0]}>
      {/* Lower chassis body */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.65, 1.85]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Aerodynamic cabin greenhouse */}
      <mesh position={[-0.2, 0.85, 0]} castShadow>
        <boxGeometry args={[2.4, 0.55, 1.5]} />
        <meshPhysicalMaterial
          color="#0a0a0a"
          transmission={0.6}
          opacity={0.8}
          transparent
          roughness={0.1}
          ior={1.5}
        />
      </mesh>

      {/* Front hood slope */}
      <mesh position={[1.4, 0.45, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[1.2, 0.3, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.92} roughness={0.12} />
      </mesh>

      {/* Signature Headlight strips */}
      <mesh position={[2.08, 0.45, 0.65]}>
        <boxGeometry args={[0.08, 0.1, 0.38]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[2.08, 0.45, -0.65]}>
        <boxGeometry args={[0.08, 0.1, 0.38]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Tail light blade */}
      <mesh position={[-2.08, 0.5, 0]}>
        <boxGeometry args={[0.08, 0.08, 1.7]} />
        <meshBasicMaterial color="#ff2a2a" />
      </mesh>

      {/* Wheels */}
      {/* Front Left */}
      <mesh position={[1.3, -0.05, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 32]} />
        <meshStandardMaterial color="#2c2c2e" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Front Right */}
      <mesh position={[1.3, -0.05, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 32]} />
        <meshStandardMaterial color="#2c2c2e" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Rear Left */}
      <mesh position={[-1.3, -0.05, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 32]} />
        <meshStandardMaterial color="#2c2c2e" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Rear Right */}
      <mesh position={[-1.3, -0.05, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 32]} />
        <meshStandardMaterial color="#2c2c2e" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

export const VehicleScene: React.FC<{ color?: string; className?: string }> = ({
  color = '#151517',
  className = '',
}) => {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setWebglSupported(supported);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={`w-full h-full bg-obsidian flex items-center justify-center ${className}`}>
        <img
          src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=80"
          alt="Audi 3D Studio"
          className="w-full h-full object-cover opacity-80"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-gradient-to-b from-charcoal via-obsidian to-black ${className}`}>
      <Canvas
        shadows
        camera={{ position: [4.5, 2.2, 4.5], fov: 42 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />

        {/* Studio Lighting Rig */}
        <spotLight
          position={[6, 8, 4]}
          angle={0.6}
          penumbra={0.8}
          intensity={2.5}
          castShadow
          color="#ffffff"
        />
        <spotLight
          position={[-6, 6, -4]}
          angle={0.5}
          penumbra={0.9}
          intensity={1.2}
          color="#c9a96e"
        />
        <pointLight position={[0, 4, 0]} intensity={1.5} color="#e5e5ea" />

        {/* Studio Floor Reflector */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={512}
            mirror={0.6}
            mixBlur={0.8}
            mixStrength={1.5}
            roughness={0.3}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#080808"
            metalness={0.8}
          />
        </mesh>

        {/* Floating Car Mesh */}
        <ProceduralCarMesh color={color} />

        {/* Interactive Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>

      {/* Studio HUD Badge */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-widest text-silver">
        <span>3D SHADOW STUDIO — REAL-TIME THREE.JS</span>
      </div>
    </div>
  );
};
