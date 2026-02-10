'use client';

export default function RiseFitLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center bg-background/80 backdrop-blur-sm">
      <div className="relative inline-block">
        {/* Outline Text (Background) */}
        <h1
          className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-transparent select-none leading-none"
          style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.15)' }}
        >
          RISE.FIT
        </h1>

        {/* Filled Text (Foreground - Clip Mask Animating) */}
        <div className="absolute inset-0 overflow-hidden rise-clip-mask">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-primary select-none whitespace-nowrap leading-none">
            RISE.FIT
          </h1>
        </div>
      </div>

      {/* Animated loading bar */}
      <div className="mt-8 w-32 sm:w-40 h-[3px] bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full rise-bar-slide" />
      </div>

      <style jsx>{`
        @keyframes clipReveal {
          0%   { clip-path: inset(100% 0 0 0); }
          40%  { clip-path: inset(0 0 0 0); }
          60%  { clip-path: inset(0 0 0 0); }
          100% { clip-path: inset(100% 0 0 0); }
        }
        .rise-clip-mask {
          animation: clipReveal 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes barSlide {
          0%   { transform: translateX(-100%); width: 40%; }
          50%  { transform: translateX(150%); width: 60%; }
          100% { transform: translateX(-100%); width: 40%; }
        }
        .rise-bar-slide {
          animation: barSlide 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
