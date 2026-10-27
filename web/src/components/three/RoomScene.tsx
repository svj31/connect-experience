"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { AvatarColor, AvatarShape } from "@/lib/types";
import { AVATAR_HEX } from "../ui/Avatar";

export interface SceneSeat {
  shape: AvatarShape;
  color: AvatarColor;
  online: boolean;
}

function Shape({ shape }: { shape: AvatarShape }) {
  switch (shape) {
    case "square": return <boxGeometry args={[0.9, 0.9, 0.9]} />;
    case "triangle": return <coneGeometry args={[0.6, 1.0, 3]} />;
    case "diamond": return <octahedronGeometry args={[0.65]} />;
    case "hexagon": return <cylinderGeometry args={[0.55, 0.55, 0.8, 6]} />;
    case "star": return <icosahedronGeometry args={[0.6]} />;
    default: return <sphereGeometry args={[0.55, 48, 48]} />;
  }
}

function Seat({ seat, x, phase, pulse }: { seat: SceneSeat | null; x: number; phase: number; pulse: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const pulseStart = useRef(pulse);
  const lastPulse = useRef(pulse);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      pulseStart.current = t;
    }
    const since = t - pulseStart.current;
    const bump = since < 0.6 ? Math.sin((since / 0.6) * Math.PI) * 0.25 : 0;
    const bob = seat?.online ? Math.sin(t * 1.6 + phase) * 0.08 : 0;
    mesh.position.y = 0.75 + bob + bump;
    mesh.rotation.y = t * (seat?.online ? 0.5 : 0.1) + phase;
    mesh.scale.setScalar(1 + bump * 0.6);
  });

  if (!seat) {
    // An empty seat: a faint outline waiting for someone.
    return (
      <mesh position={[x, 0.75, 0]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color="#cfc6b8" wireframe transparent opacity={0.6} />
      </mesh>
    );
  }
  return (
    <mesh ref={ref} position={[x, 0.75, 0]}>
      <Shape shape={seat.shape} />
      <meshStandardMaterial color={AVATAR_HEX[seat.color]} roughness={0.4} transparent opacity={seat.online ? 1 : 0.45} />
    </mesh>
  );
}

/** Beads on the thread between the two seats. One bead for every moment shared, up to twelve. */
function Thread({ moments, active }: { moments: number; active: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.position.y = 0.75 + Math.sin(clock.getElapsedTime() * 1.2) * 0.03;
  });
  const count = Math.min(moments, 12);
  return (
    <group ref={group}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 2.6, 8]} />
        <meshBasicMaterial color={active ? "#1f1d1a" : "#cfc6b8"} />
      </mesh>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-1.1 + (2.2 * (i + 0.5)) / Math.max(count, 1), 0, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={i % 2 ? "#1e6b66" : "#c2452d"} />
        </mesh>
      ))}
    </group>
  );
}

export default function RoomScene({
  me,
  partner,
  moments,
  pulseMe,
  pulsePartner,
}: {
  me: SceneSeat;
  partner: SceneSeat | null;
  moments: number;
  pulseMe: number;
  pulsePartner: number;
}) {
  return (
    <Canvas camera={{ position: [0, 2.2, 5.2], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} aria-hidden="true">
      <ambientLight intensity={1.3} />
      <directionalLight position={[2, 5, 4]} intensity={2} />
      <group rotation={[0.1, 0, 0]}>
        {/* The table */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[2.4, 2.4, 0.16, 64]} />
          <meshStandardMaterial color="#f3eee5" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.25, 2.3, 64]} />
          <meshBasicMaterial color="#cfc6b8" />
        </mesh>
        <Seat seat={me} x={-1.35} phase={0} pulse={pulseMe} />
        <Seat seat={partner} x={1.35} phase={1.7} pulse={pulsePartner} />
        <Thread moments={moments} active={Boolean(partner?.online && me.online)} />
      </group>
    </Canvas>
  );
}
