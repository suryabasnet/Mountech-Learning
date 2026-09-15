import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', size = 'md' }) => {
  const sizeMap = {
    sm: { icon: 32, textClass: 'text-base', subClass: 'text-[10px]' },
    md: { icon: 42, textClass: 'text-xl', subClass: 'text-xs' },
    lg: { icon: 54, textClass: 'text-2xl', subClass: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Reproduction of Mountech Solutions Logo */}
      <svg
        width={currentSize.icon}
        height={currentSize.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-sm"
      >
        {/* Pine Trees on left */}
        <polygon points="14,48 10,54 13,54 9,60 12,60 7,68 21,68 16,60 19,60 15,54 18,54" fill="#15803d" />
        <polygon points="21,38 17,45 20,45 16,52 19,52 14,64 28,64 23,52 26,52 22,45 25,45" fill="#166534" />
        <rect x="13" y="68" width="2" height="6" fill="#14532d" />
        <rect x="20" y="64" width="2" height="10" fill="#14532d" />

        {/* Mountain Silhouette with Sky Blue gradient */}
        <defs>
          <linearGradient id="mountGrad" x1="10" y1="25" x2="85" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="binaryGrad" x1="60" y1="20" x2="95" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>

        {/* Mountain body */}
        <path
          d="M 12 62 Q 28 42 48 26 Q 54 22 62 30 Q 72 38 88 56 C 82 58 76 60 70 54 C 62 48 56 55 48 51 C 40 47 34 56 26 58 C 18 60 14 62 12 62 Z"
          fill="url(#mountGrad)"
        />

        {/* Snow Peak highlights */}
        <path
          d="M 48 26 Q 52 35 44 42 Q 54 38 60 44 Q 63 36 62 30 Q 54 22 48 26 Z"
          fill="#f0f9ff"
          opacity="0.95"
        />

        {/* Lower mountain foreground swoop */}
        <path
          d="M 10 65 C 24 58 38 62 50 63 C 65 64 78 58 88 58 C 80 66 60 68 40 68 C 25 68 15 67 10 65 Z"
          fill="#38bdf8"
        />

        {/* Orbiting Digital Binary Swirl Circles (0 and 1) */}
        {/* Arc of dots: Green and Teal binary bits */}
        <g fill="none" stroke="#22c55e" strokeWidth="1">
          {/* Outer arc */}
          <circle cx="62" cy="27" r="2.8" fill="#22c55e" />
          <circle cx="68" cy="26" r="2.8" fill="#10b981" />
          <circle cx="75" cy="27" r="2.8" fill="#14b8a6" />
          <circle cx="81" cy="30" r="3.2" fill="#06b6d4" />
          <circle cx="87" cy="36" r="3.2" fill="#22c55e" />
          <circle cx="91" cy="43" r="3.5" fill="#16a34a" />
          <circle cx="93" cy="51" r="3.8" fill="#10b981" />
          <circle cx="91" cy="60" r="4.2" fill="#22c55e" />
          <circle cx="87" cy="69" r="4.5" fill="#15803d" />
          <circle cx="80" cy="77" r="4.8" fill="#16a34a" />
          <circle cx="72" cy="80" r="4.5" fill="#22c55e" />

          {/* Inner arc */}
          <circle cx="66" cy="32" r="2.2" fill="#38bdf8" />
          <circle cx="72" cy="33" r="2.2" fill="#0284c7" />
          <circle cx="78" cy="37" r="2.5" fill="#38bdf8" />
          <circle cx="82" cy="44" r="2.8" fill="#06b6d4" />
          <circle cx="83" cy="52" r="3.0" fill="#38bdf8" />
          <circle cx="80" cy="60" r="3.2" fill="#0284c7" />
          <circle cx="75" cy="68" r="3.5" fill="#38bdf8" />
        </g>

        {/* Binary numbers inside major dots */}
        <text x="81" y="32" fontSize="3" fill="#ffffff" fontWeight="bold" textAnchor="middle">1</text>
        <text x="87" y="38" fontSize="3" fill="#ffffff" fontWeight="bold" textAnchor="middle">0</text>
        <text x="91" y="45" fontSize="3.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">1</text>
        <text x="93" y="53" fontSize="3.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">0</text>
        <text x="91" y="62" fontSize="4" fill="#ffffff" fontWeight="bold" textAnchor="middle">1</text>
        <text x="87" y="71" fontSize="4.2" fill="#ffffff" fontWeight="bold" textAnchor="middle">0</text>
        <text x="80" y="79" fontSize="4.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">1</text>
        <text x="72" y="82" fontSize="4.2" fill="#ffffff" fontWeight="bold" textAnchor="middle">0</text>
      </svg>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center tracking-tight">
            <span className={`font-extrabold ${currentSize.textClass} text-sky-600`}>
              MounTech
            </span>
            <span className={`font-bold ml-1 ${currentSize.textClass} ${variant === 'white' ? 'text-teal-300' : 'text-emerald-600'}`}>
              Learning
            </span>
          </div>
          <span className={`font-medium ${currentSize.subClass} text-slate-500 flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            by Mountech Solutions
          </span>
        </div>
      )}
    </div>
  );
};
