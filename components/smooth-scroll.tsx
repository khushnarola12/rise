'use client';

import { ReactLenis } from 'lenis/react';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Configuration for a premium smooth scrolling experience
  const lenisOptions = {
    lerp: 0.1,         // The "smoothness" factor. Lower values = smoother (more momentum), higher = more instant. 0.1 is a sweet spot.
    duration: 1.2,     // The duration of the scroll animation.
    smoothWheel: true, // Enable smooth scrolling for mouse wheel events.
    wheelMultiplier: 1,// The multiplier for the mouse wheel event delta.
    touchMultiplier: 2,// The multiplier for the touch event delta.
    infinite: false,   // Infinite scrolling.
  };

  return (
    <ReactLenis root options={lenisOptions}>
      {children}
    </ReactLenis>
  );
}
