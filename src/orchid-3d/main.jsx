import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

const modelItems = [
  {
    id: "orchid",
    nameZh: "兰花",
    nameEn: "Orchid",
    path: "/models/orchid.glb",
    frontRotationY: Math.PI,
  },
  {
    id: "hibiscus",
    nameZh: "芙蓉",
    nameEn: "Hibiscus",
    path: "/models/hibiscus.glb",
    frontRotationY: Math.PI,
  },
  {
    id: "narcissus",
    nameZh: "水仙",
    nameEn: "Narcissus",
    path: "/models/narcissus.glb",
    frontRotationY: Math.PI,
  },
  {
    id: "chrysanthemum",
    nameZh: "菊花",
    nameEn: "Chrysanthemum",
    path: "/models/chrysanthemum.glb",
    frontRotationY: Math.PI,
  },
  {
    id: "plum-blossom",
    nameZh: "梅花",
    nameEn: "Plum Blossom",
    path: "/models/plum-blossom.glb",
  },
];

const DEFAULT_CAMERA_POSITION = [0, 0.55, 6.2];
const DEFAULT_CAMERA_TARGET = [0, 0.04, 0];
const MODEL_DISPLAY_SIZE = 3.28;
const TRANSITION_OUT_SECONDS = 0.46;
const TRANSITION_IN_SECONDS = 0.54;

function wrapIndex(index) {
  return (index + modelItems.length) % modelItems.length;
}

function formatIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getProjectDescription(item) {
  return `以蜀锦纹样与${item.nameZh}形态为线索，将传统花卉意象转译为可旋转、可探索的数字植物模型。页面保留模型原始材质与色彩，通过克制的黑色空间、细网格和柔和轮廓光，呈现实验性数字艺术作品的展示氛围。`;
}

function cloneMaterialForFade(material) {
  const cloned = material.clone();
  cloned.transparent = true;
  cloned.needsUpdate = true;

  return {
    material: cloned,
    baseOpacity: material.opacity,
    baseTransparent: material.transparent,
    baseDepthWrite: material.depthWrite,
  };
}

class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.error) {
      return (
        <Html center>
          <div className="model-error" role="alert">
            <strong>{this.props.item.nameZh}模型加载失败</strong>
            <span>请确认 {this.props.item.path} 存在且文件完整。</span>
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}

function LoadingScreen({ item }) {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="model-loading" aria-live="polite">
        <span>{Math.round(progress)}%</span>
        <div className="model-loading-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
        <small>LOADING {item.nameEn.toUpperCase()} MODEL</small>
      </div>
    </Html>
  );
}

function AutoRotate({ groupRef, paused }) {
  useFrame((state, delta) => {
    if (!groupRef.current || paused) return;
    const pointerX = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const pointerY = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    groupRef.current.rotation.y += delta * 0.072;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointerY * 0.075, 0.035);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointerX * 0.03, 0.035);
  });
  return null;
}

function FittedModel({ item, transitionPhase, paused }) {
  const { scene } = useGLTF(item.path);
  const transitionRef = useRef();
  const modelRef = useRef();
  const progressRef = useRef(transitionPhase === "in" ? 0 : 1);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);
    const materialStates = [];

    clone.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => {
          const state = cloneMaterialForFade(material);
          materialStates.push(state);
          return state.material;
        });
      } else if (child.material) {
        const state = cloneMaterialForFade(child.material);
        materialStates.push(state);
        child.material = state.material;
      }
    });

    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = MODEL_DISPLAY_SIZE / maxAxis;

    return { clone, center, scale, materialStates };
  }, [scene]);

  React.useEffect(() => {
    progressRef.current = transitionPhase === "in" ? 0 : 1;
  }, [item.id, transitionPhase]);

  React.useEffect(() => {
    return () => {
      normalized.materialStates.forEach(({ material }) => material.dispose());
    };
  }, [normalized]);

  useFrame((_, delta) => {
    const group = transitionRef.current;
    if (!group) return;

    if (transitionPhase === "out") {
      progressRef.current = Math.max(0, progressRef.current - delta / TRANSITION_OUT_SECONDS);
    } else if (transitionPhase === "in") {
      progressRef.current = Math.min(1, progressRef.current + delta / TRANSITION_IN_SECONDS);
    } else {
      progressRef.current = 1;
    }

    const eased = easeInOutCubic(progressRef.current);
    group.scale.setScalar(0.9 + eased * 0.1);
    group.rotation.y = (1 - eased) * -0.24;
    group.rotation.z = (1 - eased) * 0.035;
    group.position.y = -0.08 + eased * 0.08;

    normalized.materialStates.forEach((state) => {
      state.material.opacity = state.baseOpacity * eased;
      state.material.transparent = eased < 0.999 ? true : state.baseTransparent;
      state.material.depthWrite = eased < 0.999 ? false : state.baseDepthWrite;
      state.material.needsUpdate = true;
    });

  });

  return (
    <group ref={transitionRef}>
      <group ref={modelRef} scale={normalized.scale} position={[0, -0.14, 0]} rotation={[0, item.frontRotationY ?? 0, 0]}>
        <primitive object={normalized.clone} position={[-normalized.center.x, -normalized.center.y, -normalized.center.z]} />
        <AutoRotate groupRef={modelRef} paused={paused} />
      </group>
    </group>
  );
}

function CameraRig({ resetSignal, controlsRef, isInteracting }) {
  const { camera } = useThree();
  const position = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(...DEFAULT_CAMERA_POSITION), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(...DEFAULT_CAMERA_TARGET), []);
  const animatingRef = useRef(true);

  React.useEffect(() => {
    animatingRef.current = true;
  }, [resetSignal]);

  useFrame(() => {
    if (isInteracting || !animatingRef.current) return;

    position.copy(camera.position).lerp(desiredPosition, 0.07);
    camera.position.copy(position);

    if (controlsRef.current) {
      target.copy(controlsRef.current.target).lerp(desiredTarget, 0.08);
      controlsRef.current.target.copy(target);
      controlsRef.current.update();
    } else {
      camera.lookAt(desiredTarget);
    }

    if (camera.position.distanceTo(desiredPosition) < 0.012 && (!controlsRef.current || controlsRef.current.target.distanceTo(desiredTarget) < 0.012)) {
      camera.position.copy(desiredPosition);
      if (controlsRef.current) {
        controlsRef.current.target.copy(desiredTarget);
        controlsRef.current.update();
      }
      animatingRef.current = false;
    }
  });

  return null;
}

function Scene({
  visibleItem,
  transitionPhase,
  paused,
  isInteracting,
  setIsInteracting,
  resetSignal,
  onEnterComplete,
}) {
  const controlsRef = useRef();

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

      <ModelErrorBoundary key={visibleItem.id} item={visibleItem} onError={onEnterComplete}>
        <Suspense fallback={<LoadingScreen item={visibleItem} />}>
          <FittedModel
            key={visibleItem.id}
            item={visibleItem}
            transitionPhase={transitionPhase}
            paused={paused || isInteracting}
          />
          <ContactShadows position={[0, -1.72, 0]} opacity={0.32} scale={6.2} blur={2.8} far={3.2} />
        </Suspense>
      </ModelErrorBoundary>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        enableDamping
        dampingFactor={0.075}
        minDistance={3.35}
        maxDistance={8.4}
        minPolarAngle={0.01}
        maxPolarAngle={Math.PI - 0.01}
        rotateSpeed={0.82}
        zoomSpeed={0.72}
        onStart={() => setIsInteracting(true)}
        onEnd={() => setIsInteracting(false)}
      />
      <CameraRig resetSignal={resetSignal} controlsRef={controlsRef} isInteracting={isInteracting} />
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

function ThumbnailNavigation({ activeIndex, isSwitching, onSelect, onNext, onPrev }) {
  return (
    <aside className="view-panel" aria-label="3D 模型切换">
      <div className="view-count" aria-live="polite">
        {formatIndex(activeIndex)}/{formatIndex(modelItems.length - 1)}
      </div>
      <div className="thumb-grid">
        {modelItems.map((item, index) => (
          <button
            className={`thumb-card ${index === activeIndex ? "is-active" : ""}`}
            type="button"
            key={item.id}
            onClick={() => onSelect(index)}
            aria-disabled={isSwitching ? "true" : undefined}
            aria-label={`切换到${item.nameZh}模型`}
            aria-current={index === activeIndex ? "true" : undefined}
          >
            <span>{formatIndex(index)}</span>
            <strong>{item.nameZh}</strong>
            <small>{item.nameEn}</small>
          </button>
        ))}
      </div>
      <div className="arrow-row" aria-label="模型前后切换">
        <button type="button" onClick={onPrev} aria-disabled={isSwitching ? "true" : undefined} aria-label="切换至上一个 3D 模型">
          ←
        </button>
        <button type="button" onClick={onNext} aria-disabled={isSwitching ? "true" : undefined} aria-label="切换至下一个 3D 模型">
          →
        </button>
      </div>
    </aside>
  );
}

function Interface({ activeIndex, isSwitching, onSelect, onNext, onPrev }) {
  const item = modelItems[activeIndex];

  return (
    <div className="interface">
      <header className="topbar">
        <a href="./index.html#works">← 返回首页</a>
        <span>INTERACTIVE 3D STUDY · 2025</span>
      </header>

      <section className="title-panel" aria-labelledby="showcase-title">
        <p className="kicker">SHU BROCADE DIGITAL ART</p>
        <h1 id="showcase-title">
          蜀锦与{item.nameZh}
          <span>Brocade in Bloom</span>
        </h1>
        <p>{getProjectDescription(item)}</p>
      </section>

      <ThumbnailNavigation
        activeIndex={activeIndex}
        isSwitching={isSwitching}
        onSelect={onSelect}
        onNext={onNext}
        onPrev={onPrev}
      />
    </div>
  );
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [isSwitching, setIsSwitching] = useState(false);
  const [paused, setPaused] = useState(document.hidden);
  const [isInteracting, setIsInteracting] = useState(false);
  const pageRef = useRef(null);
  const outTimerRef = useRef(null);
  const unlockTimerRef = useRef(null);
  const exitHandledRef = useRef(false);
  const switchLockRef = useRef(false);

  const completeSwitch = useCallback(() => {
    if (unlockTimerRef.current) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    switchLockRef.current = false;
    setTransitionPhase("idle");
    setIsSwitching(false);
  }, []);

  const beginEnter = useCallback(
    (nextIndex) => {
      if (exitHandledRef.current) return;
      exitHandledRef.current = true;
      if (outTimerRef.current) {
        window.clearTimeout(outTimerRef.current);
        outTimerRef.current = null;
      }

      setVisibleIndex(nextIndex);
      setTransitionPhase("in");
    },
    []
  );

  const startSwitch = useCallback(
    (nextIndex) => {
      const wrappedNextIndex = wrapIndex(nextIndex);
      if (switchLockRef.current || wrappedNextIndex === activeIndex) return;

      if (outTimerRef.current) {
        window.clearTimeout(outTimerRef.current);
      }

      if (unlockTimerRef.current) {
        window.clearTimeout(unlockTimerRef.current);
      }

      exitHandledRef.current = false;
      switchLockRef.current = true;
      setActiveIndex(wrappedNextIndex);
      setIsSwitching(true);
      setIsInteracting(false);
      setTransitionPhase("out");
      outTimerRef.current = window.setTimeout(() => beginEnter(wrappedNextIndex), TRANSITION_OUT_SECONDS * 1000 + 80);
      unlockTimerRef.current = window.setTimeout(
        completeSwitch,
        (TRANSITION_OUT_SECONDS + TRANSITION_IN_SECONDS) * 1000 + 160
      );
    },
    [activeIndex, beginEnter, completeSwitch]
  );

  const next = useCallback(() => startSwitch(activeIndex + 1), [activeIndex, startSwitch]);
  const prev = useCallback(() => startSwitch(activeIndex - 1), [activeIndex, startSwitch]);
  const selectModel = useCallback((index) => startSwitch(index), [startSwitch]);

  React.useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  React.useEffect(() => {
    return () => {
      if (outTimerRef.current) {
        window.clearTimeout(outTimerRef.current);
      }
      if (unlockTimerRef.current) {
        window.clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const previousItem = modelItems[wrapIndex(visibleIndex - 1)];
    const nextItem = modelItems[wrapIndex(visibleIndex + 1)];
    useGLTF.preload(previousItem.path);
    useGLTF.preload(nextItem.path);
  }, [visibleIndex]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  const handlePointerMove = useCallback((event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2;
    const y = (event.clientY / window.innerHeight - 0.5) * 2;
    pageRef.current?.style.setProperty("--mx", `${x * 16}px`);
    pageRef.current?.style.setProperty("--my", `${y * 16}px`);
  }, []);

  const visibleItem = modelItems[visibleIndex];
  const activeItem = modelItems[activeIndex];

  return (
    <main
      className="orchid-page"
      ref={pageRef}
      onPointerMove={handlePointerMove}
    >
      <BackgroundGrid />
      <div className="canvas-wrap" aria-label={`可拖动旋转的${activeItem.nameZh} 3D 模型`}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: DEFAULT_CAMERA_POSITION, fov: 38, near: 0.1, far: 100 }}
        >
          <Scene
            visibleItem={visibleItem}
            transitionPhase={transitionPhase}
            paused={paused}
            isInteracting={isInteracting}
            setIsInteracting={setIsInteracting}
            resetSignal={visibleItem.id}
            onEnterComplete={completeSwitch}
          />
        </Canvas>
      </div>
      <Interface
        activeIndex={activeIndex}
        isSwitching={isSwitching}
        onSelect={selectModel}
        onNext={next}
        onPrev={prev}
      />
    </main>
  );
}

useGLTF.preload(modelItems[0].path);

createRoot(document.getElementById("root")).render(<App />);
