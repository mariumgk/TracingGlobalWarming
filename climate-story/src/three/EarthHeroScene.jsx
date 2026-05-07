import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  
  // Load textures
  const [colorMap, specularMap, cloudsMap] = useTexture([
    `${import.meta.env.BASE_URL}textures/earth_atmos_2048.jpg`,
    `${import.meta.env.BASE_URL}textures/earth_specular_2048.jpg`,
    `${import.meta.env.BASE_URL}textures/earth_clouds_1024.png`
  ]);

  // Subtle auto-rotation
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.04;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.05; // clouds move slightly faster
    }
  });

  return (
    <group>
      {/* Main Earth Sphere */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          specularMap={specularMap}
          specular={new THREE.Color('#333333')}
          shininess={15}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.22, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.6}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Subtle Atmosphere Rim Glow */}
      <mesh>
        <sphereGeometry args={[2.35, 64, 64]} />
        <meshBasicMaterial
          color="#a7dde8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function EarthHeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.15} color="#ffffff" />
      {/* Sun directional light */}
      <directionalLight 
        position={[6, 4, 3]} 
        intensity={2.2} 
        color="#FFF8F0" 
        castShadow 
      />
      {/* Subtle fill light from opposite side */}
      <directionalLight 
        position={[-5, -2, -3]} 
        intensity={0.4} 
        color="#3A86A8" 
      />

      <Stars radius={120} depth={60} count={4000} factor={5} saturation={0} fade speed={0.5} />

      {/* Cinematic float motion */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group position={[1.5, 0, 0]}>
          <Suspense fallback={null}>
            <Earth />
          </Suspense>
        </group>
      </Float>
    </Canvas>
  );
}
