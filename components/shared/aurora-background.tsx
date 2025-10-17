'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, type CSSProperties } from 'react';
import { useSeasonalTheme } from '@/components/shared/seasonal-theme-provider';

const fallbackPalette = {
  gradientStart: '#B8A8EA',
  gradientEnd: '#7FB9A7',
  background: '#050A1A',
};

export function AuroraBackground() {
  const { theme } = useSeasonalTheme();
  const palette = theme?.palette ?? fallbackPalette;
  const prefersReducedMotion = useReducedMotion();

  const layers = useMemo(
    () => [
      { top: '-10%', left: '12%', size: '48vw', opacity: 0.65 },
      { top: '30%', right: '5%', size: '42vw', opacity: 0.6 },
      { bottom: '-15%', left: '28%', size: '52vw', opacity: 0.55 },
    ],
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_65%)]"
        style={{ backgroundColor: palette.background }}
      />
      {layers.map((layer, index) => {
        const style: CSSProperties = {
          background: `linear-gradient(135deg, ${palette.gradientStart}, ${palette.gradientEnd})`,
          mixBlendMode: 'screen',
          opacity: layer.opacity,
        };

        return (
          <motion.span
            key={index}
            className="absolute aspect-square max-w-[520px] rounded-full blur-3xl"
            style={{
              ...style,
              top: layer.top,
              left: layer.left,
              right: layer.right,
              bottom: layer.bottom,
              width: layer.size,
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: ['0%', '6%', '-4%', '0%'],
                    y: ['0%', '-4%', '3%', '0%'],
                    rotate: [0, 12, -8, 0],
                  }
            }
            transition={{ duration: 28 + index * 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
        );
      })}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22 viewBox=%220 0 4 4%22%3E%3Cpath fill=%22%23ffffff%22 fill-opacity=%220.08%22 d=%22M0 1h1V0H0zm2 0h1V0H2zM0 3h1V2H0zm2 0h1V2H2z%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay" />
    </div>
  );
}
