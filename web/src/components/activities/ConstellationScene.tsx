"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export interface StarPoint {
  id: number;
  uid: number;
  x: number;
  y: number;
  z: number;
}

const RADIUS = 2.6;
const clamp = (v: number) => Math.max(-1, Math.min(1, Math.round(v * 1000) / 1000));

function Links({ stars }: { stars: StarPoint[] }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(stars.map((s) => new THREE.Vector3(s.x * RADIUS, s.y * RADIUS, s.z * RADIUS)));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#1f1d1a", transparent: true, opacity: 0.55 }));
  }, [stars]);
  useEffect(() => () => {
    line.geometry.dispose();
    (line.material as THREE.Material).dispose();
  }, [line]);
  return stars.length > 1 ? <primitive object={line} /> : null;
}

/** A star grows in when it is new, then twinkles gently. */
function Star({ star, color, animateIn }: { star: StarPoint; color: string; animateIn: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const born = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    if (born.current === null) born.current = animateIn ? t : t - 10;
    const grow = Math.min(1, (t - born.current) / 0.4);
    mesh.scale.setScalar(grow * (1 + Math.sin(t * 2 + star.id) * 0.12));
  });
  return (
    <mesh ref={ref} position={[star.x * RADIUS, star.y * RADIUS, star.z * RADIUS]}>
      <icosahedronGeometry args={[0.09, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
    </mesh>
  );
}

function Sky({
  stars,
  colorFor,
  onPlace,
  done,
}: {
  stars: StarPoint[];
  colorFor: (uid: number) => string;
  onPlace: (p: { x: number; y: number; z: number }) => void;
  done: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0.2, y: 0 });
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const { gl } = useThree();
  // Stars present when the board opened appear instantly; later ones grow in.
  const [initialMaxId] = useState(() => stars.reduce((m, s) => Math.max(m, s.id), 0));

  // Drag to rotate, handled on the canvas element so taps still place stars.
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current = { x: e.clientX, y: e.clientY, moved: false };
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
      target.current.y += dx * 0.008;
      target.current.x = Math.max(-1.2, Math.min(1.2, target.current.x + dy * 0.008));
      d.x = e.clientX;
      d.y = e.clientY;
    };
    const up = () => {
      drag.current = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [gl]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    if (!drag.current) target.current.y += 0.0012;
    g.rotation.x += (target.current.x - g.rotation.x) * 0.15;
    g.rotation.y += (target.current.y - g.rotation.y) * 0.15;
  });

  function click(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    // e.delta is how far the pointer moved since it went down; a drag is not a tap.
    if (done || e.delta > 6 || !group.current) return;
    const local = group.current.worldToLocal(e.point.clone()).divideScalar(RADIUS);
    onPlace({ x: clamp(local.x), y: clamp(local.y), z: clamp(local.z) });
  }

  return (
    <group ref={group}>
      <mesh onClick={click}>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 0.995, 24, 16]} />
        <meshBasicMaterial color="#cfc6b8" wireframe transparent opacity={0.35} />
      </mesh>
      {stars.map((s) => <Star key={s.id} star={s} color={colorFor(s.uid)} animateIn={s.id > initialMaxId} />)}
      <Links stars={stars} />
    </group>
  );
}

export default function ConstellationScene(props: {
  stars: StarPoint[];
  colorFor: (uid: number) => string;
  onPlace: (p: { x: number; y: number; z: number }) => void;
  done: boolean;
}) {
  return (
    <div className="h-full w-full cursor-grab touch-none active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7.2], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 4, 5]} intensity={1.5} />
        <Sky {...props} />
      </Canvas>
    </div>
  );
}
