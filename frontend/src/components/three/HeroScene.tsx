"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.9);
  s.bezierCurveTo(-0.35, -0.55, -1.05, -0.2, -1.05, 0.3);
  s.bezierCurveTo(-1.05, 0.85, -0.35, 1.0, 0, 0.55);
  s.bezierCurveTo(0.35, 1.0, 1.05, 0.85, 1.05, 0.3);
  s.bezierCurveTo(1.05, -0.2, 0.35, -0.55, 0, -0.9);
  return s;
}

function Heart({ hover }: { hover: React.RefObject<boolean> }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(heartShape(), { depth: 0.35, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 6, curveSegments: 32 });
    g.center();
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const beat = 1 + Math.max(0, Math.sin(t * (hover.current ? 7 : 3.2))) * (hover.current ? 0.1 : 0.05);
    ref.current.scale.setScalar(0.62 * beat);
    ref.current.rotation.y = Math.sin(t * 0.6) * 0.5;
  });
  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial color="#7657D6" roughness={0.35} metalness={0.1} emissive="#3b2394" emissiveIntensity={0.25} />
    </mesh>
  );
}

function Orbit({ tilt, color, dashed }: { tilt: number; color: string; dashed?: boolean }) {
  const line = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 2.6, 1.6, 0, Math.PI * 2);
    const pts = curve.getPoints(160).map((p) => new THREE.Vector3(p.x, p.y, 0));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.9 })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const l = new THREE.Line(geo, mat);
    if (dashed) l.computeLineDistances();
    return l;
  }, [color, dashed]);
  return <primitive object={line} rotation={[1.15, 0, tilt]} />;
}

function World({ tilt, phase, color, speed, hover }: { tilt: number; phase: number; color: string; speed: number; hover: React.RefObject<boolean> }) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(phase);
  const matrix = useMemo(() => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(1.15, 0, tilt)), [tilt]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    angle.current += dt * speed * (hover.current ? 2.4 : 1);
    const v = new THREE.Vector3(Math.cos(angle.current) * 2.6, Math.sin(angle.current) * 1.6, 0).applyMatrix4(matrix);
    ref.current.position.copy(v);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.22, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

/** Same scatter on every render: a cheap hash in place of Math.random. */
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Sparkles() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 160;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 3 + hash(i, 1) * 3;
      const a = hash(i, 2) * Math.PI * 2;
      const b = (hash(i, 3) - 0.5) * Math.PI;
      pos.set([r * Math.cos(a) * Math.cos(b), r * Math.sin(b), r * Math.sin(a) * Math.cos(b) - 2], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.03;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#E5A2D5" size={0.05} transparent opacity={0.85} />
    </points>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ pointer }) => {
    if (!ref.current) return;
    ref.current.rotation.y += (pointer.x * 0.5 - ref.current.rotation.y) * 0.05;
    ref.current.rotation.x += (-pointer.y * 0.3 - ref.current.rotation.x) * 0.05;
  });
  return <group ref={ref}>{children}</group>;
}

/** Two worlds orbiting a beating heart. Move the pointer to tilt it; hover to make the worlds race. */
export default function HeroScene() {
  const hover = useRef(false);
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
      aria-hidden="true"
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <pointLight position={[0, 0, 2]} intensity={6} color="#f9d9f0" />
      <Rig>
        <Orbit tilt={-0.56} color="#9B83E8" dashed />
        <Orbit tilt={0.56} color="#C5B3F8" />
        <World tilt={-0.56} phase={0} color="#7657D6" speed={0.7} hover={hover} />
        <World tilt={0.56} phase={Math.PI} color="#E5A2D5" speed={0.55} hover={hover} />
        <Heart hover={hover} />
      </Rig>
      <Sparkles />
    </Canvas>
  );
}
