import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

function IcebergMesh({ scrollProgress }) {
  const groupRef = useRef();
  const scale = Math.max(0.25, 1 - scrollProgress * 0.75);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Main iceberg body */}
      <mesh position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#A7DDE8"
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Submerged portion */}
      <mesh position={[0, -0.6, 0]} scale={[1.2, 0.6, 1.2]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#3A86A8"
          roughness={0.4}
          metalness={0.15}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Snow cap */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Ocean() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05 - 0.8;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 32, 32]} />
      <meshStandardMaterial
        color="#3A86A8"
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.3}
      />
    </mesh>
  );
}

export default function IcebergScene({ scrollProgress = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.6} color="#EAF2F5" />
      <directionalLight position={[3, 5, 3]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-3, -1, -2]} intensity={0.4} color="#3A86A8" />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <IcebergMesh scrollProgress={scrollProgress} />
      </Float>
      <Ocean />
    </Canvas>
  );
}
