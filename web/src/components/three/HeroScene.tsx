"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Two spheres, one for each person, drift toward each other and overlap.
 * Small shapes orbit them: the games and activities they can share.
 * Moving the pointer tilts the scene. Motion is gentle and stops under reduced motion.
 */
function Pair({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame(({ clock }) => {
    const t = still ? 1.2 : clock.getElapsedTime();
    // The two spheres breathe in and out of overlap.
    const gap = 0.95 + Math.sin(t * 0.6) * 0.35;
    if (left.current) left.current.position.x = -gap;
    if (right.current) right.current.position.x = gap;
    if (group.current) {
      group.current.rotation.y += ((still ? 0 : pointer.x * 0.35) - group.current.rotation.y) * 0.05;
      group.current.rotation.x += ((still ? 0 : -pointer.y * 0.2) - group.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={left} castShadow>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshStandardMaterial color="#c2452d" roughness={0.45} metalness={0.05} transparent opacity={0.92} />
      </mesh>
      <mesh ref={right} castShadow>
        <sphereGeometry args={[1.25, 64, 64]} />
        <meshStandardMaterial color="#1e6b66" roughness={0.45} metalness={0.05} transparent opacity={0.92} />
      </mesh>
      <Orbiters still={still} />
    </group>
  );
}

function Orbiters({ still }: { still: boolean }) {
  const items = useMemo(
    () => [
      { geo: <boxGeometry args={[0.32, 0.32, 0.32]} />, color: "#d99a1e", radius: 2.6, speed: 0.35, offset: 0, tilt: 0.3 },
      { geo: <octahedronGeometry args={[0.24]} />, color: "#1f1d1a", radius: 2.9, speed: -0.28, offset: 2, tilt: -0.4 },
      { geo: <torusGeometry args={[0.2, 0.07, 16, 32]} />, color: "#3d7a3a", radius: 2.4, speed: 0.22, offset: 4, tilt: 0.6 },
      { geo: <coneGeometry args={[0.2, 0.36, 24]} />, color: "#2f5f9e", radius: 3.1, speed: 0.18, offset: 1, tilt: -0.1 },
      { geo: <sphereGeometry args={[0.12, 24, 24]} />, color: "#d99a1e", radius: 2.2, speed: -0.4, offset: 3.4, tilt: 0.9 },
    ],
    [],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.getElapsedTime();
    items.forEach((item, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const a = t * item.speed + item.offset;
      mesh.position.set(Math.cos(a) * item.radius, Math.sin(a) * item.radius * 0.35 + item.tilt, Math.sin(a) * 1.2);
      mesh.rotation.x = t * 0.6 + i;
      mesh.rotation.y = t * 0.4 + i;
    });
  });

  return (
    <>
      {items.map((item, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          {item.geo}
          <meshStandardMaterial color={item.color} roughness={0.5} />
        </mesh>
      ))}
    </>
  );
}

export default function HeroScene() {
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas
      camera={{ position: [0, 0, 8.6], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={still ? "demand" : "always"}
      aria-hidden="true"
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, -2, 2]} intensity={0.6} color="#f8ebcb" />
      <Pair still={still} />
    </Canvas>
  );
}
