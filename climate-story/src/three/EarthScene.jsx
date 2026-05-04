import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, useTexture, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
  const meshRef = useRef();
  // Procedural Earth — blue ocean base with land highlights
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group>
      {/* Main Earth sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#2a6b9c"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow — outer shell */}
      <mesh>
        <sphereGeometry args={[2.32, 64, 64]} />
        <meshStandardMaterial
          color="#a7dde8"
          transparent
          opacity={0.12}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere rim glow */}
      <mesh>
        <sphereGeometry args={[2.42, 64, 64]} />
        <meshStandardMaterial
          color="#6fb3d9"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Heat band — equatorial warming glow */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[2.25, 0.18, 8, 64]} />
        <meshStandardMaterial
          color="#D95D39"
          transparent
          opacity={0.25}
          emissive="#D95D39"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

function Particles() {
  const count = 300;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.6 + Math.random() * 1.2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const pointsRef = useRef();
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0004;
      pointsRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#F4B860"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function EarthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.8} color="#FFF8F0" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#3A86A8" />
      {/* Warm heat light on the warming side */}
      <pointLight position={[3, 0, 3]} intensity={1.5} color="#D95D39" distance={10} />

      <Stars radius={80} depth={60} count={3000} factor={3} saturation={0.2} fade speed={0.5} />

      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
        <Earth />
      </Float>

      <Particles />
    </Canvas>
  );
}
