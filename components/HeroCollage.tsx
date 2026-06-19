"use client";

import Image from "next/image";
import { useRef, useEffect } from "react";

interface CollagImage {
  src: string;
  width: number;
  height: number;
  /** absolute-position styles for the wrapper (top/left/right/bottom/zIndex) */
  wrapStyle: React.CSSProperties;
  /** decoration styles for the <img> element (rotate, animationDelay, willChange) */
  imgStyle: React.CSSProperties;
  /** parallax depth multiplier: 0.02–0.08 */
  depth: number;
}

const IMAGES: CollagImage[] = [
  { src: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400",
    width: 180, height: 220, wrapStyle: { top: "-20px",  left:  "2%",  zIndex: 2 }, imgStyle: { rotate: "-8deg",  animationDelay: "0ms"   }, depth: 0.05 },
  { src: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?w=400",
    width: 140, height: 170, wrapStyle: { top:  "40px",  left: "12%",  zIndex: 4 }, imgStyle: { rotate:  "5deg",  animationDelay: "80ms"  }, depth: 0.03 },
  { src: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400",
    width: 220, height: 270, wrapStyle: { top: "-30px",  left: "22%",  zIndex: 1 }, imgStyle: { rotate: "-13deg", animationDelay: "160ms" }, depth: 0.07 },
  { src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?w=400",
    width: 160, height: 200, wrapStyle: { bottom: "-30px", left:  "8%", zIndex: 3 }, imgStyle: { rotate:  "7deg",  animationDelay: "240ms" }, depth: 0.04 },
  { src: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=400",
    width: 130, height: 160, wrapStyle: { bottom: "-10px", left: "28%", zIndex: 5 }, imgStyle: { rotate: "-4deg",  animationDelay: "300ms" }, depth: 0.06 },
  { src: "https://images.pexels.com/photos/2611917/pexels-photo-2611917.jpeg?w=400",
    width: 200, height: 240, wrapStyle: { top:  "10px",  right: "22%", zIndex: 2 }, imgStyle: { rotate: "10deg",  animationDelay: "100ms" }, depth: 0.08 },
  { src: "https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?w=400",
    width: 150, height: 150, wrapStyle: { bottom: "-20px", right: "30%", zIndex: 4 }, imgStyle: { rotate: "-9deg",  animationDelay: "200ms" }, depth: 0.02 },
  { src: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?w=400",
    width: 180, height: 220, wrapStyle: { top: "-25px",  right: "12%", zIndex: 1 }, imgStyle: { rotate:  "6deg",  animationDelay: "350ms" }, depth: 0.06 },
  { src: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?w=400",
    width: 140, height: 180, wrapStyle: { top:  "50px",  right:  "3%", zIndex: 3 }, imgStyle: { rotate: "-12deg", animationDelay: "430ms" }, depth: 0.04 },
  { src: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=400",
    width: 220, height: 260, wrapStyle: { bottom: "-40px", right:  "8%", zIndex: 5 }, imgStyle: { rotate:  "4deg",  animationDelay: "510ms" }, depth: 0.07 },
  { src: "https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?w=400",
    width: 160, height: 190, wrapStyle: { bottom: "-15px", right: "20%", zIndex: 2 }, imgStyle: { rotate: "-6deg",  animationDelay: "590ms" }, depth: 0.03 },
  { src: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?w=400",
    width: 130, height: 160, wrapStyle: { top:  "30px",  left: "35%",  zIndex: 0 }, imgStyle: { rotate: "14deg",  animationDelay: "670ms", willChange: "transform" }, depth: 0.05 },
  { src: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?w=400",
    width: 150, height: 190, wrapStyle: { bottom: "-25px", left: "42%", zIndex: 3 }, imgStyle: { rotate: "-11deg", animationDelay: "750ms", willChange: "transform" }, depth: 0.08 },
  { src: "https://images.pexels.com/photos/2611917/pexels-photo-2611917.jpeg?w=400",
    width: 180, height: 140, wrapStyle: { top: "-10px",  right: "35%", zIndex: 1 }, imgStyle: { rotate:  "3deg",  animationDelay: "800ms" }, depth: 0.02 },
];

const LERP = 0.10;
const MAX_MOUSE = 30;
const MAX_GYRO = 20;

type Vec2 = { x: number; y: number };

export default function HeroCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const cur = useRef<Vec2[]>(IMAGES.map(() => ({ x: 0, y: 0 })));
  const tgt = useRef<Vec2[]>(IMAGES.map(() => ({ x: 0, y: 0 })));
  const inViewport = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Attach pointer events to the <header> (parent) so the overlay div
    // at z-6 doesn't swallow mousemove before it reaches the collage wrapper.
    const heroEl: HTMLElement = container.parentElement ?? container;

    // ── helpers ────────────────────────────────────────────────────────────

    function clamp(v: number, max: number) {
      return Math.max(-max, Math.min(max, v));
    }

    function applyTransforms() {
      for (let i = 0; i < IMAGES.length; i++) {
        const el = imgRefs.current[i];
        if (el) el.style.transform = `translate(${cur.current[i].x.toFixed(2)}px, ${cur.current[i].y.toFixed(2)}px)`;
      }
    }

    // ── rAF loop ───────────────────────────────────────────────────────────

    function tick() {
      let dirty = false;
      for (let i = 0; i < IMAGES.length; i++) {
        const dx = tgt.current[i].x - cur.current[i].x;
        const dy = tgt.current[i].y - cur.current[i].y;
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          cur.current[i].x += dx * LERP;
          cur.current[i].y += dy * LERP;
          dirty = true;
        } else {
          cur.current[i].x = tgt.current[i].x;
          cur.current[i].y = tgt.current[i].y;
        }
      }
      if (dirty) applyTransforms();
      if (inViewport.current) rafRef.current = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (rafRef.current != null || !inViewport.current) return;
      rafRef.current = requestAnimationFrame(tick);
    }

    function stopLoop() {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    // ── mouse parallax ─────────────────────────────────────────────────────

    function onMouseMove(e: MouseEvent) {
      const rect = heroEl.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      for (let i = 0; i < IMAGES.length; i++) {
        tgt.current[i].x = clamp(dx * IMAGES[i].depth, MAX_MOUSE);
        tgt.current[i].y = clamp(dy * IMAGES[i].depth, MAX_MOUSE);
      }
    }

    function onMouseLeave() {
      for (let i = 0; i < IMAGES.length; i++) {
        tgt.current[i] = { x: 0, y: 0 };
      }
    }

    // ── gyroscope parallax ─────────────────────────────────────────────────

    let gyroAttached = false;

    function onDeviceOrientation(e: DeviceOrientationEvent) {
      const gamma = e.gamma ?? 0; // left-right tilt, -90..90
      const beta  = e.beta  ?? 0; // front-back tilt, -180..180; ~45° neutral hold
      for (let i = 0; i < IMAGES.length; i++) {
        tgt.current[i].x = clamp(gamma * IMAGES[i].depth * 10, MAX_GYRO);
        tgt.current[i].y = clamp((beta - 45) * IMAGES[i].depth * 10, MAX_GYRO);
      }
    }

    function attachGyro() {
      window.addEventListener("deviceorientation", onDeviceOrientation);
      gyroAttached = true;
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      const DOE = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof DOE.requestPermission === "function") {
        // iOS 13+: must gate behind a user gesture
        const onFirstTouch = () => {
          DOE.requestPermission!()
            .then((result) => { if (result === "granted") attachGyro(); })
            .catch(() => {/* silently ignore */});
        };
        heroEl.addEventListener("touchstart", onFirstTouch, { once: true });
      } else if (typeof DeviceOrientationEvent !== "undefined") {
        attachGyro();
      }
    } else {
      heroEl.addEventListener("mousemove", onMouseMove);
      heroEl.addEventListener("mouseleave", onMouseLeave);
    }

    // ── IntersectionObserver ───────────────────────────────────────────────

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewport.current = entry.isIntersecting;
        if (entry.isIntersecting) startLoop();
        else stopLoop();
      },
      { threshold: 0.1 }
    );
    observer.observe(heroEl);

    // ── cleanup ────────────────────────────────────────────────────────────

    return () => {
      stopLoop();
      observer.disconnect();
      heroEl.removeEventListener("mousemove", onMouseMove);
      heroEl.removeEventListener("mouseleave", onMouseLeave);
      if (gyroAttached) window.removeEventListener("deviceorientation", onDeviceOrientation);
    };
  }, []);

  return (
    <>
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
      `}</style>

      {/* Wrapper sits over the full hero */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-hidden="true"
      >
        {IMAGES.map((img, i) => (
          // Outer div: absolute position + parallax translate
          <div
            key={i}
            ref={(el) => { imgRefs.current[i] = el; }}
            style={{ position: "absolute", ...img.wrapStyle }}
          >
            <Image
              src={img.src}
              alt=""
              width={img.width}
              height={img.height}
              className="hero-img-el"
              style={img.imgStyle}
            />
          </div>
        ))}
      </div>
    </>
  );
}
