import React, { useMemo } from "react";

const HeroPattern: React.FC<{ className?: string }> = ({ className }) => {
  // Generate random properties for 60 sparkles
  const sparkles = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 15 + 5, // 5px to 20px
      duration: Math.random() * 15 + 10, // 10s to 25s
      delay: Math.random() * -20, // Negative delay so they start at different points
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none text-white dark:text-black fill-white dark:fill-black ${className}`}
    >
      <style>
        {`
          @keyframes hero-float {
            0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
            10% { opacity: var(--op); }
            90% { opacity: var(--op); }
            100% { transform: translateY(-400px) rotate(180deg); opacity: 0; }
          }
          .sparkle-container {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .sparkle {
            position: absolute;
            fill: rgb(var(--bg-white)); 
            animation: hero-float var(--dur) linear infinite;
            animation-delay: var(--del);
            opacity: 0;
          }
        `}
      </style>

      <div className="sparkle-container">
        {sparkles.map((s) => (
          <svg
            key={s.id}
            viewBox="0 0 24 24"
            className="sparkle"
            style={
              {
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                "--dur": `${s.duration}s`,
                "--del": `${s.delay}s`,
                "--op": s.opacity,
              } as React.CSSProperties
            }
          >
            {/* Elegant 4-pointed twinkle star */}
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        ))}
      </div>
    </div>
  );
};

export default HeroPattern;
