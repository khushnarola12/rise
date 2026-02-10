'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef, useCallback, useState } from 'react';

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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  // On mobile touch devices, use native CSS smooth scroll instead of Lenis
  // Lenis syncTouch can cause jank and fight with native touch momentum
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.075,
        smoothWheel: true,
        wheelMultiplier: 0.8,
        infinite: false,
        autoResize: true,
        prevent: (node: HTMLElement) => {
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
