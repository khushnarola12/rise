'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef, useCallback } from 'react';

function LenisRAF() {
  const lenis = useLenis();
  const rafRef = useRef<number | undefined>(undefined);

  const animate = useCallback((time: number) => {
    lenis?.raf(time);
    rafRef.current = requestAnimationFrame(animate);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [lenis, animate]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.075,          // Lower = smoother/more momentum. 0.075 for buttery feel.
        smoothWheel: true,     // Smooth scrolling for mouse wheel.
        wheelMultiplier: 0.8,  // Slightly reduce scroll speed for premium feel.
        touchMultiplier: 2,    // Touch scroll multiplier for mobile responsiveness.
        infinite: false,
        syncTouch: true,       // CRITICAL: Enables smooth scrolling on touch/mobile devices.
        syncTouchLerp: 0.075,  // Touch smoothing factor - same as desktop for consistency.
        autoResize: true,      // Auto-resize on window resize / orientation change.
        prevent: (node: HTMLElement) => {
          // Don't interfere with elements that have their own scroll
          return node.hasAttribute('data-lenis-prevent') || 
                 node.classList.contains('overflow-y-auto') ||
                 node.classList.contains('overflow-x-auto') ||
                 node.tagName === 'INPUT' ||
                 node.tagName === 'TEXTAREA' ||
                 node.tagName === 'SELECT';
        },
      }}
    >
      <LenisRAF />
      {children}
    </ReactLenis>
  );
}
