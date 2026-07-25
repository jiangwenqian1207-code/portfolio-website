import React, { Suspense, useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

const VIEWS = [
  {
    label: "FRONT",
    title: "正面整体",
    position: [0, 0.45, 6.2],
    target: [0, 0.15, 0]
  },
  {
    label: "LEFT CLOSE",
    title: "左侧近景",
    position: [-3.4, 1.05, 4.45],
    target: [0, 0.28, 0]
  },
  {
    label: "RIGHT CLOSE",
    title: "右侧近景",
    position: [3.4, 0.8, 4.35],
    target: [0, 0.25, 0]
  },
  {
    label: "TOP VIEW",
    title: "顶部俯视",
    position: [0.65, 4.4, 4.9],
    target: [0, 0.05, 0]
  }
];

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Html center>
          <div className="model-error">
            <strong>模型加载失败</strong>
            <span>请确认 /public/models/orchid.glb 存在且文件完整。</span>
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}

function LoadingScreen() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="model-loading" aria-live="polite">
        <span>{Math.round(progress)}%</span>
        <div className="model-loading-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <small>LOADING ORCHID MODEL</small>
      </div>
    </Html>
  );
}

function OrchidModel({ activeView, paused }) {
  const { scene } = useGLTF("/models/orchid.glb");
  const groupRef = React.useRef();
  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.25 / maxAxis;

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return { clone, center, scale };
  }, [scene]);

  const targetTilt = useMemo(() => new THREE.Vector2(), []);

  React.useEffect(() => {
    const view = VIEWS[activeView];
    targetTilt.set(view.position[0] * 0.015, view.position[1] * 0.01);
  }, [activeView, targetTilt]);

  return (
    <group
      ref={groupRef}
      scale={normalized.scale}
      position={[0, -0.24, 0]}
      rotation={[targetTilt.y, targetTilt.x, 0]}
    >
      <primitive object={normalized.clone} position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]} />
      <AutoRotate groupRef={groupRef} paused={paused} />
    </group>
  );
}

function AutoRotate({ groupRef, paused }) {
  useFrame((state, delta) => {
    if (!groupRef.current || paused) return;
    const pointerX = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const pointerY = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    groupRef.current.rotation.y += delta * 0.085;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointerY * 0.08, 0.035);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointerX * 0.035, 0.035);
  });
  return null;
}

function CameraRig({ activeView, controlsRef, isInteracting }) {
  const { camera } = useThree();
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const animatingRef = React.useRef(true);

  React.useEffect(() => {
    animatingRef.current = true;
  }, [activeView]);

  React.useEffect(() => {
    if (isInteracting) animatingRef.current = false;
  }, [isInteracting]);

  useFrame(() => {
    if (isInteracting || !animatingRef.current) return;

    const view = VIEWS[activeView];
    desiredPosition.set(...view.position);
    desiredTarget.set(...view.target);
    position.copy(camera.position).lerp(desiredPosition, 0.06);
    camera.position.copy(position);

    if (controlsRef.current) {
      target.copy(controlsRef.current.target).lerp(desiredTarget, 0.07);
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    } else {
      camera.lookAt(desiredTarget);
    }

    if (camera.position.distanceTo(desiredPosition) < 0.018 && (!controlsRef.current || controlsRef.current.target.distanceTo(desiredTarget) < 0.018)) {
      animatingRef.current = false;
    }
  });

  return null;
}

function Scene({ activeView, paused, isInteracting, setIsInteracting }) {
  const controlsRef = React.useRef();

  return (
    <>
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 8, 15]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3.8, 5.6, 4.8]} intensity={2.45} castShadow />
      <directionalLight position={[-4.6, 2.8, 3.6]} intensity={1.28} color="#f2ecff" />
      <directionalLight position={[0, 2.4, -4.8]} intensity={1.12} color="#b7a4ff" />
      <spotLight position={[0.25, 4.8, 5.2]} angle={0.46} penumbra={0.82} intensity={2.35} color="#ffffff" />
      <pointLight position={[-1.8, 1.8, 2.6]} intensity={0.82} color="#f7d7ff" distance={7} />
      <Environment preset="studio" environmentIntensity={0.72} />

      <ModelErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
          <OrchidModel activeView={activeView} paused={paused || isInteracting} />
          <ContactShadows position={[0, -1.72, 0]} opacity={0.32} scale={6.2} blur={2.8} far={3.2} />
        </Suspense>
      </ModelErrorBoundary>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        minDistance={3.4}
        maxDistance={8.2}
        minPolarAngle={0.01}
        maxPolarAngle={Math.PI - 0.01}
        rotateSpeed={0.82}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
      />
      <CameraRig activeView={activeView} controlsRef={controlsRef} isInteracting={isInteracting} />
    </>
  );
}

function BackgroundGrid() {
  return (
    <div className="technical-background" aria-hidden="true">
      <div className="grid-plane" />
      <div className="arc arc-one" />
      <div className="arc arc-two" />
      <div className="crosshair crosshair-left" />
      <div className="crosshair crosshair-right" />
      <div className="axis-line axis-horizontal" />
      <div className="axis-line axis-vertical" />
    </div>
  );
}

function ThumbnailNavigation({ activeView, onSelect, onNext, onPrev }) {
  return (
    <aside className="view-panel" aria-label="作品视角切换">
      <div className="view-count">{String(activeView + 1).padStart(2, "0")}/04</div>
      <div className="thumb-grid">
        {VIEWS.map((view, index) => (
          <button
            className={`thumb-card ${index === activeView ? "is-active" : ""}`}
            type="button"
            key={view.label}
            onClick={() => onSelect(index)}
            aria-label={`切换到${view.title}`}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <small>{view.label}</small>
          </button>
        ))}
      </div>
      <div className="arrow-row">
        <button type="button" onClick={onPrev} aria-label="上一个视角">
          ←
        </button>
        <button type="button" onClick={onNext} aria-label="下一个视角">
          →
        </button>
      </div>
    </aside>
  );
}

function Interface({ activeView, setActiveView }) {
  const selectView = useCallback((next) => setActiveView(next), [setActiveView]);
  const next = useCallback(() => setActiveView((view) => (view + 1) % VIEWS.length), [setActiveView]);
  const prev = useCallback(() => setActiveView((view) => (view + VIEWS.length - 1) % VIEWS.length), [setActiveView]);

  return (
    <div className="interface">
      <header className="topbar">
        <a href="./index.html#works">← 返回首页</a>
        <span>INTERACTIVE 3D STUDY · 2025</span>
      </header>

      <section className="title-panel" aria-labelledby="showcase-title">
        <p className="kicker">SHU BROCADE DIGITAL ART</p>
        <h1 id="showcase-title">
          蜀锦与兰
          <span>Brocade in Bloom</span>
        </h1>
        <p>
          以蜀锦纹样与兰花形态为线索，将传统纹样转译为可旋转、可探索的数字植物模型。页面保留模型原始材质，
          通过克制的黑色空间、细网格与柔和轮廓光，呈现实验性数字艺术作品的展示氛围。
        </p>
      </section>

      <ThumbnailNavigation activeView={activeView} onSelect={selectView} onNext={next} onPrev={prev} />
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState(0);
  const [paused, setPaused] = useState(document.hidden);
  const [isInteracting, setIsInteracting] = useState(false);
  const pageRef = React.useRef(null);

  React.useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handlePointerMove = useCallback((event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    pageRef.current?.style.setProperty("--mx", `${x * 16}px`);
    pageRef.current?.style.setProperty("--my", `${y * 16}px`);
  }, []);

  return (
    <main className="orchid-page" ref={pageRef} onPointerMove={handlePointerMove}>
      <BackgroundGrid />
      <div className="canvas-wrap" aria-label="可拖动旋转的兰花 3D 模型">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: VIEWS[0].position, fov: 38, near: 0.1, far: 100 }}
        >
          <Scene activeView={activeView} paused={paused} isInteracting={isInteracting} setIsInteracting={setIsInteracting} />
        </Canvas>
      </div>
      <Interface activeView={activeView} setActiveView={setActiveView} />
    </main>
  );
}

useGLTF.preload("/models/orchid.glb");

createRoot(document.getElementById("root")).render(<App />);
