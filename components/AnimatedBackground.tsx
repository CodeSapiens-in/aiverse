import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    const tx = reducedMotion ? 0 : pointer.x * 0.5;
    const ty = reducedMotion ? 0.14 : 0.14 + pointer.y * 0.26;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.04);
    camera.lookAt(0, 0, -2.4);
  });

  return null;
}

function StoryAurora({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.z += delta * 0.03;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.28) * 0.18;
  });

  return (
    <mesh ref={ref} position={[0, -0.2, -3.8]}>
      <planeGeometry args={[14, 9, 1, 1]} />
      <meshBasicMaterial color="#4cf7ff" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function EnergyRibbons({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.z += delta * 0.02;
    groupRef.current.children.forEach((child, i) => {
      child.rotation.z += delta * (0.07 + i * 0.015);
      child.position.y = Math.sin(state.clock.elapsedTime * (0.5 + i * 0.2)) * (0.05 + i * 0.05);
    });
  });

  return (
    <group ref={groupRef} position={[0.2, -0.3, -2.5]}>
      <mesh rotation={[0, 0, 0.2]}>
        <torusGeometry args={[2.7, 0.03, 14, 220]} />
        <meshBasicMaterial color="#56f6ff" transparent opacity={0.22} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0, 0, -0.45]}>
        <torusGeometry args={[2.05, 0.025, 12, 200]} />
        <meshBasicMaterial color="#ff9f5f" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[0, 0, 0.9]}>
        <torusGeometry args={[1.45, 0.02, 12, 180]} />
        <meshBasicMaterial color="#9dfcf8" transparent opacity={0.24} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

type ShardData = {
  angle: number;
  radius: number;
  speed: number;
  offset: number;
  y: number;
  scale: number;
  color: string;
};

function StoryShards({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const shards = useMemo<ShardData[]>(() => {
    const palette = ['#56f6ff', '#ff9f5f', '#8cdcff', '#b5fff9'];
    return Array.from({ length: 24 }, (_, idx) => ({
      angle: Math.random() * Math.PI * 2,
      radius: 1.3 + Math.random() * 3.4,
      speed: 0.2 + Math.random() * 0.55,
      offset: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * 3.3,
      scale: 0.08 + Math.random() * 0.2,
      color: palette[idx % palette.length],
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const s = shards[i];
      if (!s) return;
      const t = state.clock.elapsedTime * s.speed + s.offset;
      child.position.x = Math.cos(s.angle + t) * s.radius;
      child.position.z = -2.6 + Math.sin(s.angle + t) * (s.radius * 0.7);
      child.position.y = s.y + Math.sin(t * 1.8) * 0.2;
      if (!reducedMotion) {
        child.rotation.x += delta * (0.15 + s.speed * 0.4);
        child.rotation.y += delta * (0.2 + s.speed * 0.45);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {shards.map((s, i) => (
        <mesh key={i} scale={s.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.18} roughness={0.3} metalness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function DustFlow({ reducedMotion }: { reducedMotion: boolean }) {
  const attrRef = useRef<THREE.BufferAttribute>(null);
  const count = reducedMotion ? 90 : 160;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = -16 + Math.random() * 20;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (reducedMotion || !attrRef.current) return;
    const arr = attrRef.current.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 2] += delta * 4.8;
      if (arr[i + 2] > 4.4) {
        arr[i] = (Math.random() - 0.5) * 14;
        arr[i + 1] = (Math.random() - 0.5) * 8;
        arr[i + 2] = -16;
      }
    }
    attrRef.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={attrRef} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#c5f9ff" size={0.04} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function AnimatedBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(76,247,255,0.2),transparent_42%),radial-gradient(circle_at_82%_14%,rgba(255,159,95,0.13),transparent_37%),linear-gradient(160deg,#030711_10%,#08101f_52%,#040915_100%)]" />
      <Canvas dpr={[1, 1.8]} camera={{ position: [0, 0.14, 7.6], fov: 50 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#020611']} />
        <fog attach="fog" args={['#020611', 7, 23]} />
        <ambientLight intensity={0.34} />
        <directionalLight position={[4, 3, 5]} intensity={1.05} color="#a4f6ff" />
        <pointLight position={[-3.4, 2.2, 1.8]} intensity={4.1} distance={15} color="#4cf7ff" />
        <pointLight position={[2.8, -2.1, 2.7]} intensity={3.3} distance={12} color="#ff9f5f" />

        <Stars radius={110} depth={60} count={reducedMotion ? 1200 : 2500} factor={4} fade speed={reducedMotion ? 0 : 0.28} />
        <Sparkles count={reducedMotion ? 18 : 34} scale={[14, 8, 11]} size={2.3} speed={reducedMotion ? 0.08 : 0.3} color="#b8ffff" opacity={0.27} />
        <StoryAurora reducedMotion={reducedMotion} />
        <EnergyRibbons reducedMotion={reducedMotion} />
        <StoryShards reducedMotion={reducedMotion} />
        <DustFlow reducedMotion={reducedMotion} />
        <CameraRig reducedMotion={reducedMotion} />
      </Canvas>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,17,0.14),rgba(3,7,17,0.62)_66%,rgba(3,7,17,0.9))]" />
    </div>
  );
}
