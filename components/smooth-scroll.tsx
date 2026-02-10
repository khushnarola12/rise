'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';

function LenisRAF() {
  const lenis = useLenis();
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!lenis) return;

    function raf(time: number) {
      lenis?.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,          // Lower = smoother/more momentum. 0.08 gives a buttery feel.
        smoothWheel: true,    // Enable smooth scrolling for mouse wheel events.
        wheelMultiplier: 0.8, // Slightly reduce scroll speed for a premium feel.
        touchMultiplier: 1.5, // Touch scroll multiplier.
        infinite: false,
        syncTouch: true,      // Sync touch events for smooth touch scrolling on mobile.
        syncTouchLerp: 0.06,  // Touch smoothing factor.
        autoResize: true,     // Auto-resize on window resize.
      }}
    >
      <LenisRAF />
      {children}
    </ReactLenis>
  );
}
