"use client";

import Image from "next/image";
import { useRef, useEffect, type ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

// ── Types ────────────────────────────────────────────────────────────────────

type Vec2 = { x: number; y: number };

interface CollagImg {
  src: string;
  width: number;
  height: number;
  wrapStyle: React.CSSProperties;
  imgStyle: React.CSSProperties;
  depth?: number; // mobile gyro depth multiplier
}

// ── Desktop collage data ──────────────────────────────────────────────────────

const DESKTOP: CollagImg[] = [
  { src: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400",
    width: 180, height: 220, wrapStyle: { top: "-20px", left: "2%", zIndex: 2 }, imgStyle: { rotate: "-8deg", animationDelay: "0ms" } },
  { src: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400",
    width: 140, height: 170, wrapStyle: { top: "40px", left: "12%", zIndex: 4 }, imgStyle: { rotate: "5deg", animationDelay: "80ms" } },
  { src: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400",
    width: 220, height: 270, wrapStyle: { top: "-30px", left: "22%", zIndex: 1 }, imgStyle: { rotate: "-13deg", animationDelay: "160ms" } },
  { src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?w=400",
    width: 160, height: 200, wrapStyle: { bottom: "-30px", left: "8%", zIndex: 3 }, imgStyle: { rotate: "7deg", animationDelay: "240ms" } },
  { src: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400",
    width: 130, height: 160, wrapStyle: { bottom: "-10px", left: "28%", zIndex: 5 }, imgStyle: { rotate: "-4deg", animationDelay: "300ms" } },
  { src: "https://images.pexels.com/photos/2611917/pexels-photo-2611917.jpeg?w=400",
    width: 200, height: 240, wrapStyle: { top: "10px", right: "22%", zIndex: 2 }, imgStyle: { rotate: "10deg", animationDelay: "100ms" } },
  { src: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?w=400",
    width: 150, height: 150, wrapStyle: { bottom: "-20px", right: "30%", zIndex: 4 }, imgStyle: { rotate: "-9deg", animationDelay: "200ms" } },
  { src: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?w=400",
    width: 180, height: 220, wrapStyle: { top: "-25px", right: "12%", zIndex: 1 }, imgStyle: { rotate: "6deg", animationDelay: "350ms" } },
  { src: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?w=400",
    width: 140, height: 180, wrapStyle: { top: "50px", right: "3%", zIndex: 3 }, imgStyle: { rotate: "-12deg", animationDelay: "430ms" } },
  { src: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400",
    width: 220, height: 260, wrapStyle: { bottom: "-40px", right: "8%", zIndex: 5 }, imgStyle: { rotate: "4deg", animationDelay: "510ms" } },
  { src: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?w=400",
    width: 160, height: 190, wrapStyle: { bottom: "-15px", right: "20%", zIndex: 2 }, imgStyle: { rotate: "-6deg", animationDelay: "590ms" } },
  { src: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400",
    width: 130, height: 160, wrapStyle: { top: "30px", left: "35%", zIndex: 0 }, imgStyle: { rotate: "14deg", animationDelay: "670ms", willChange: "transform" } },
  { src: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400",
    width: 150, height: 190, wrapStyle: { bottom: "-25px", left: "42%", zIndex: 3 }, imgStyle: { rotate: "-11deg", animationDelay: "750ms", willChange: "transform" } },
  { src: "https://images.pexels.com/photos/2611917/pexels-photo-2611917.jpeg?w=400",
    width: 180, height: 140, wrapStyle: { top: "-10px", right: "35%", zIndex: 1 }, imgStyle: { rotate: "3deg", animationDelay: "800ms" } },
];

// ── Mobile collage data — 8 images, 2 per corner ─────────────────────────────
// Each pair partially cropped off-screen; center stays clear for text.
// 130×160px portrait, rotations -12 to +12deg.

const MOBILE: CollagImg[] = [
  // Top-left corner
  { src: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400",
    width: 130, height: 160, depth: 0.05,
    wrapStyle: { top: "-30px", left: "-22px", zIndex: 2 },
    imgStyle: { rotate: "-9deg", animationDelay: "0ms" } },
  { src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?w=400",
    width: 130, height: 160, depth: 0.03,
    wrapStyle: { top: "60px", left: "14px", zIndex: 3 },
    imgStyle: { rotate: "6deg", animationDelay: "120ms" } },

  // Top-right corner
  { src: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400",
    width: 130, height: 160, depth: 0.06,
    wrapStyle: { top: "-25px", right: "-22px", zIndex: 2 },
    imgStyle: { rotate: "8deg", animationDelay: "60ms" } },
  { src: "https://images.pexels.com/photos/2611917/pexels-photo-2611917.jpeg?w=400",
    width: 130, height: 160, depth: 0.04,
    wrapStyle: { top: "55px", right: "10px", zIndex: 3 },
    imgStyle: { rotate: "-11deg", animationDelay: "180ms" } },

  // Bottom-left corner
  { src: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400",
    width: 130, height: 160, depth: 0.07,
    wrapStyle: { bottom: "-28px", left: "-18px", zIndex: 2 },
    imgStyle: { rotate: "10deg", animationDelay: "240ms" } },
  { src: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?w=400",
    width: 130, height: 160, depth: 0.04,
    wrapStyle: { bottom: "60px", left: "12px", zIndex: 3 },
    imgStyle: { rotate: "-7deg", animationDelay: "320ms" } },

  // Bottom-right corner
  { src: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?w=400",
    width: 130, height: 160, depth: 0.05,
    wrapStyle: { bottom: "-25px", right: "-20px", zIndex: 2 },
    imgStyle: { rotate: "-12deg", animationDelay: "200ms" } },
  { src: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400",
    width: 130, height: 160, depth: 0.06,
    wrapStyle: { bottom: "58px", right: "8px", zIndex: 3 },
    imgStyle: { rotate: "4deg", animationDelay: "360ms" } },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const REPEL_LERP   = 0.10;
const MAX_REPEL    = 55;
const REPEL_RADIUS = 200;

const GYRO_LERP      = 0.08;
const GYRO_MAX_PX    = 18;
const GYRO_TILT_CAP  = 30;
const GYRO_DEPTH_MID = 0.05;

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroCollage({ children }: { children: ReactNode }) {
  const headerRef = useRef<HTMLElement>(null);

  // Desktop repel
  const desktopWrapRef = useRef<HTMLDivElement>(null);
  const imgWrapRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const repelRafRef    = useRef<number | null>(null);
  const repelCur       = useRef<Vec2[]>(DESKTOP.map(() => ({ x: 0, y: 0 })));
  const repelTgt       = useRef<Vec2[]>(DESKTOP.map(() => ({ x: 0, y: 0 })));
  const desktopInView  = useRef(false);

  // Mobile gyro
  const mobileImgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gyroRafRef    = useRef<number | null>(null);
  const gyroCur       = useRef<Vec2[]>(MOBILE.map(() => ({ x: 0, y: 0 })));
  const gyroTgt       = useRef<Vec2[]>(MOBILE.map(() => ({ x: 0, y: 0 })));
  const gyroInView    = useRef(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    function clamp(v: number, max: number): number {
      return Math.max(-max, Math.min(max, v));
    }

    // ── Desktop repel loop ───────────────────────────────────────────────────

    function applyRepel() {
      for (let i = 0; i < DESKTOP.length; i++) {
        const el = imgWrapRefs.current[i];
        if (el) el.style.transform = `translate(${repelCur.current[i].x.toFixed(2)}px,${repelCur.current[i].y.toFixed(2)}px)`;
      }
    }

    function repelTick() {
      let dirty = false;
      for (let i = 0; i < DESKTOP.length; i++) {
        const dx = repelTgt.current[i].x - repelCur.current[i].x;
        const dy = repelTgt.current[i].y - repelCur.current[i].y;
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          repelCur.current[i].x += dx * REPEL_LERP;
          repelCur.current[i].y += dy * REPEL_LERP;
          dirty = true;
        } else {
          repelCur.current[i].x = repelTgt.current[i].x;
          repelCur.current[i].y = repelTgt.current[i].y;
        }
      }
      if (dirty) applyRepel();
      if (desktopInView.current) repelRafRef.current = requestAnimationFrame(repelTick);
      else repelRafRef.current = null;
    }

    function startRepelLoop() {
      if (repelRafRef.current == null) repelRafRef.current = requestAnimationFrame(repelTick);
    }

    function stopRepelLoop() {
      if (repelRafRef.current != null) { cancelAnimationFrame(repelRafRef.current); repelRafRef.current = null; }
    }

    function onMouseMove(e: MouseEvent) {
      let minDist = Infinity;
      let closestIdx = -1;
      for (let i = 0; i < DESKTOP.length; i++) {
        const el = imgWrapRefs.current[i];
        if (!el) continue;
        const r    = el.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (dist < minDist) { minDist = dist; closestIdx = i; }
      }
      for (let i = 0; i < DESKTOP.length; i++) repelTgt.current[i] = { x: 0, y: 0 };
      if (closestIdx >= 0) {
        const el  = imgWrapRefs.current[closestIdx]!;
        const r   = el.getBoundingClientRect();
        const cx  = r.left + r.width / 2;
        const cy  = r.top  + r.height / 2;
        const rawDx = cx - e.clientX;
        const rawDy = cy - e.clientY;
        const len   = Math.hypot(rawDx, rawDy) || 1;
        const str   = MAX_REPEL * Math.max(0, 1 - minDist / REPEL_RADIUS);
        repelTgt.current[closestIdx] = { x: (rawDx / len) * str, y: (rawDy / len) * str };
      }
      startRepelLoop();
    }

    function onMouseLeave() {
      for (let i = 0; i < DESKTOP.length; i++) repelTgt.current[i] = { x: 0, y: 0 };
      startRepelLoop();
    }

    // ── Mobile gyro loop ─────────────────────────────────────────────────────

    function applyGyro() {
      for (let i = 0; i < MOBILE.length; i++) {
        const el = mobileImgRefs.current[i];
        if (el) el.style.transform = `translate(${gyroCur.current[i].x.toFixed(2)}px,${gyroCur.current[i].y.toFixed(2)}px)`;
      }
    }

    function gyroTick() {
      let dirty = false;
      for (let i = 0; i < MOBILE.length; i++) {
        const dx = gyroTgt.current[i].x - gyroCur.current[i].x;
        const dy = gyroTgt.current[i].y - gyroCur.current[i].y;
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          gyroCur.current[i].x += dx * GYRO_LERP;
          gyroCur.current[i].y += dy * GYRO_LERP;
          dirty = true;
        } else {
          gyroCur.current[i].x = gyroTgt.current[i].x;
          gyroCur.current[i].y = gyroTgt.current[i].y;
        }
      }
      if (dirty) applyGyro();
      if (gyroInView.current) gyroRafRef.current = requestAnimationFrame(gyroTick);
      else gyroRafRef.current = null;
    }

    function startGyroLoop() {
      if (gyroRafRef.current == null) gyroRafRef.current = requestAnimationFrame(gyroTick);
    }

    function stopGyroLoop() {
      if (gyroRafRef.current != null) { cancelAnimationFrame(gyroRafRef.current); gyroRafRef.current = null; }
    }

    function onDeviceOrientation(e: DeviceOrientationEvent) {
      const gamma = clamp(e.gamma ?? 0, GYRO_TILT_CAP);
      const beta  = clamp((e.beta ?? 45) - 45, GYRO_TILT_CAP);
      for (let i = 0; i < MOBILE.length; i++) {
        const scale = ((MOBILE[i].depth ?? GYRO_DEPTH_MID) / GYRO_DEPTH_MID) * GYRO_MAX_PX;
        gyroTgt.current[i] = {
          x: clamp((gamma / GYRO_TILT_CAP) * scale, GYRO_MAX_PX),
          y: clamp((beta  / GYRO_TILT_CAP) * scale, GYRO_MAX_PX),
        };
      }
      startGyroLoop();
    }

    // ── Wire up ──────────────────────────────────────────────────────────────

    let gyroAttached = false;

    function attachGyro() {
      window.addEventListener("deviceorientation", onDeviceOrientation);
      gyroAttached = true;
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof DOE.requestPermission === "function") {
        const onFirstTouch = () => {
          DOE.requestPermission!().then((r) => { if (r === "granted") attachGyro(); }).catch(() => {});
        };
        header.addEventListener("touchstart", onFirstTouch, { once: true });
      } else if (typeof DeviceOrientationEvent !== "undefined") {
        attachGyro();
      }
    } else {
      header.addEventListener("mousemove", onMouseMove);
      header.addEventListener("mouseleave", onMouseLeave);
    }

    // ── IntersectionObservers ────────────────────────────────────────────────

    const desktopWrap = desktopWrapRef.current;
    const repelObserver = new IntersectionObserver(
      ([entry]) => { desktopInView.current = entry.isIntersecting; if (!entry.isIntersecting) stopRepelLoop(); },
      { threshold: 0.1 }
    );
    if (desktopWrap) repelObserver.observe(desktopWrap);

    const gyroObserver = new IntersectionObserver(
      ([entry]) => { gyroInView.current = entry.isIntersecting; if (!entry.isIntersecting) stopGyroLoop(); },
      { threshold: 0.1 }
    );
    gyroObserver.observe(header);

    // ── Cleanup ──────────────────────────────────────────────────────────────

    return () => {
      stopRepelLoop();
      stopGyroLoop();
      repelObserver.disconnect();
      gyroObserver.disconnect();
      header.removeEventListener("mousemove", onMouseMove);
      header.removeEventListener("mouseleave", onMouseLeave);
      if (gyroAttached) window.removeEventListener("deviceorientation", onDeviceOrientation);
    };
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <header
      ref={headerRef}
      className="relative bg-gradient-to-r from-orange-500 to-emerald-600 text-white overflow-hidden
                 flex flex-col justify-center min-h-[100svh]
                 md:flex-none md:min-h-0 md:block md:py-12 md:px-4"
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0px);  }
        }
        .hero-img-el {
          display: block;
          border-radius: 13px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          object-fit: cover;
          animation: fadeUp 0.7s ease both;
        }
        .mob-img-el {
          display: block;
          border-radius: 14px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.30);
          object-fit: cover;
          animation: fadeUp 0.6s ease both;
        }
      `}</style>

      {/* ── Desktop: absolute collage ─────────────────────────────────────── */}
      <div
        ref={desktopWrapRef}
        className="hidden md:block absolute inset-0"
        aria-hidden="true"
      >
        {DESKTOP.map((img, i) => (
          <div
            key={`d-${i}`}
            ref={(el) => { imgWrapRefs.current[i] = el; }}
            style={{ position: "absolute", ...img.wrapStyle }}
          >
            <Image src={img.src} alt="" width={img.width} height={img.height}
              className="hero-img-el" style={img.imgStyle} />
          </div>
        ))}
      </div>

      {/* Desktop overlay */}
      <div className="absolute inset-0 hidden md:block" style={{
        background: "linear-gradient(to right, rgba(0,0,0,0.42), rgba(0,0,0,0.38))",
        zIndex: 6, pointerEvents: "none",
      }} />

      {/* ── Mobile: corner collage ────────────────────────────────────────── */}
      <div className="md:hidden absolute inset-0" aria-hidden="true">
        {MOBILE.map((img, i) => (
          <div
            key={`m-${i}`}
            ref={(el) => { mobileImgRefs.current[i] = el; }}
            style={{ position: "absolute", ...img.wrapStyle }}
          >
            <Image src={img.src} alt="" width={img.width} height={img.height}
              className="mob-img-el" style={img.imgStyle} />
          </div>
        ))}
      </div>

      {/* Mobile overlay — radial: stronger at center for text, vivid at corners */}
      <div className="absolute inset-0 md:hidden" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 100%)",
        zIndex: 6, pointerEvents: "none",
      }} />

      {/* ── Text content ─────────────────────────────────────────────────── */}
      <div className="relative w-full px-4 py-8 md:py-0" style={{ zIndex: 10 }}>
        {children}
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4" style={{ zIndex: 20 }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
