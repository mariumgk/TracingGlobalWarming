import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 400;

function CO2Particles({ emissionLevel = 0.5 }) {
  const pointsRef = useRef();
  const clock = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start from bottom "factory" area
      positions[i * 3] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 1] = -2 + Math.random() * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      velocities[i] = 0.008 + Math.random() * 0.015;
    }
    return { positions, velocities };
  }, []);

  const posArray = useRef(positions.slice());

  useFrame(() => {
    clock.current += 0.016;
    const pos = posArray.current;
    const speed = 0.5 + emissionLevel * 1.5;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += velocities[i] * speed;
      pos[i * 3] += Math.sin(clock.current * 0.5 + i) * 0.003;

      // Reset when past the atmosphere sphere
      if (pos[i * 3 + 1] > 2.2) {
        pos[i * 3] = (Math.random() - 0.5) * 3;
        pos[i * 3 + 1] = -2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
      }
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.array.set(pos);
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
        size={0.04}
        color="#D95D39"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function AtmosphereSphere({ fillLevel }) {
  return (
    <group>
      {/* Transparent container */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#A7DDE8"
          transparent
          opacity={0.06}
          side={THREE.FrontSide}
          wireframe={false}
        />
      </mesh>
      {/* Wireframe outline */}
      <mesh>
        <sphereGeometry args={[2.02, 24, 24]} />
        <meshStandardMaterial
          color="#3A86A8"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      {/* CO₂ fill level */}
      <mesh position={[0, -2 + fillLevel * 4, 0]} scale={[1.8, fillLevel * 2, 1.8]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial
          color="#D95D39"
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  );
}

export default function CO2ParticlesScene({ emissionLevel = 0.5 }) {
  const fillLevel = Math.min(1, emissionLevel);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[0, -3, 2]} intensity={1.5} color="#D95D39" />
      <directionalLight position={[3, 5, 3]} intensity={0.8} />

      <AtmosphereSphere fillLevel={fillLevel} />
      <CO2Particles emissionLevel={emissionLevel} />
    </Canvas>
  );
}
