import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// Climate Data Orbits
function ClimateOrbits() {
  const arcs = [
    { radius: 2.5, tilt: 0.15, color: "#D95D39", length: Math.PI * 1.4, speed: 0.05 }, // Warming (amber)
    { radius: 2.65, tilt: -0.25, color: "#a7dde8", length: Math.PI * 1.2, speed: 0.03 }, // Ice/Ocean (cyan)
    { radius: 2.8, tilt: 0.35, color: "#F4B860", length: Math.PI * 0.9, speed: 0.04 }, // CO2 (gold)
    { radius: 2.95, tilt: -0.1, color: "#9ca3af", length: Math.PI * 1.6, speed: 0.02 }  // Neutral scientific
  ];

  const groupRefs = useRef([]);

  useFrame((state, delta) => {
    groupRefs.current.forEach((group, i) => {
      if (group) {
        group.rotation.y += delta * arcs[i].speed;
      }
    });
  });

  return (
    <group rotation={[0.2, 0, 0.1]}>
      {arcs.map((arc, i) => (
        <group key={i} rotation={[arc.tilt, 0, 0]} ref={(el) => (groupRefs.current[i] = el)}>
          {/* Orbital arc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[arc.radius, arc.radius + 0.003, 64, 1, 0, arc.length]} />
            <meshBasicMaterial color={arc.color} transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
          {/* Traveling marker at the head of the arc */}
          <mesh position={[Math.cos(arc.length) * arc.radius, 0, -Math.sin(arc.length) * arc.radius]}>
             <sphereGeometry args={[0.015, 8, 8]} />
             <meshBasicMaterial color={arc.color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Tiny Earth-Observation Satellite
function ObservationSatellite() {
  const satRef = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    if (satRef.current) {
      satRef.current.rotation.y -= delta * 0.04; 
    }
    if (lightRef.current) {
      lightRef.current.opacity = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
    }
  });

  return (
    <group ref={satRef} rotation={[0.4, 0, -0.2]}>
      <group position={[3.2, 0, 0]}>
        {/* Satellite core */}
        <mesh>
          <boxGeometry args={[0.06, 0.03, 0.03]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Solar panels */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.015, 0.1, 0.05]} />
          <meshStandardMaterial color="#1E3A8A" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.015, 0.1, 0.05]} />
          <meshStandardMaterial color="#1E3A8A" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Blinking measurement light */}
        <mesh position={[0.03, 0, 0]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial ref={lightRef} color="#F4B860" transparent />
        </mesh>
        {/* Faint scanning beam towards Earth */}
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.1, 0.4, 16]} />
          <meshBasicMaterial color="#a7dde8" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// Scientific Grid (Faint lat/lon sphere)
function ScientificGrid() {
  const gridRef = useRef();
  
  useFrame((state, delta) => {
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.01; 
    }
  });

  return (
    <mesh ref={gridRef}>
      <sphereGeometry args={[2.3, 32, 32]} />
      <meshBasicMaterial 
        color="#a7dde8" 
        wireframe 
        transparent 
        opacity={0.04} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

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

      {/* Stronger Atmosphere Rim Glow */}
      <mesh>
        <sphereGeometry args={[2.38, 64, 64]} />
        <meshBasicMaterial
          color="#60A5FA"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner Glow Transition */}
      <mesh>
        <sphereGeometry args={[2.28, 64, 64]} />
        <meshBasicMaterial
          color="#38BDF8"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <ScientificGrid />
      <ClimateOrbits />
      <ObservationSatellite />
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
      {/* Sun directional light - warmer */}
      <directionalLight 
        position={[6, 4, 3]} 
        intensity={2.8} 
        color="#FFF1E0" 
        castShadow 
      />
      {/* Warm rim light from edge */}
      <directionalLight 
        position={[3, 1, -5]} 
        intensity={1.2} 
        color="#D95D39" 
      />
      {/* Subtle fill light from opposite side */}
      <directionalLight 
        position={[-5, -2, -3]} 
        intensity={0.6} 
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
