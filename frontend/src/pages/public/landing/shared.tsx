import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  animate as motionAnimate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from 'framer-motion';
import { C } from './theme';

export const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: easeOut, delay: i * 0.1 },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.9, delay: i * 0.1 },
  }),
};

export const scaleReveal = {
  hidden: { opacity: 0, scale: 0.88, y: 24, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: easeOutQuart, delay: i * 0.1 },
  }),
};

export function AnimatedCounter({
  target,
  duration = 2.2,
  suffix = '',
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v: number) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on('change', (v: number) => setDisplay(v));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    if (inView && target > 0) {
      const controls = motionAnimate(0, target, {
        duration,
        ease: easeOut,
        onUpdate: (value) => mv.set(value),
      });

      return () => controls.stop();
    }
  }, [duration, inView, mv, target]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Reveal({
  children,
  className = '',
  variant = fadeUp,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: any;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variant}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxCard({
  children,
  className = '',
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current || reducedMotionRef.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const nextX = ((e.clientY - cy) / rect.height) * intensity;
      const nextY = -((e.clientX - cx) / rect.width) * intensity;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.transform = `perspective(800px) rotateX(${nextX}deg) rotateY(${nextY}deg)`;
      });
    },
    [intensity]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.4s ease',
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export function Particles({ count = 20, dark = true }: { count?: number; dark?: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle absolute -full"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: dark
                ? `rgba(224,122,47,${p.opacity})`
                : `rgba(224,122,47,${p.opacity * 0.6})`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export const BG_IMAGES = {
  stats: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=80',
  howItWorks:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80',
  cta: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1800&q=80',
} as const;

export function BgRevealSection({
  children,
  imageUrl,
  overlayColor = 'rgba(248,247,245,0.88)',
  overlayDark = false,
  className = '',
  id,
}: {
  children: React.ReactNode;
  imageUrl: string;
  overlayColor?: string;
  overlayDark?: boolean;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.06, 1.12]);
  const revealOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.5, 0.85, 1],
    [0, 0.55, 1, 0.55, 0]
  );

  return (
    <section
      ref={ref}
      id={id}
      className={`relative overflow-hidden ${className}`}
      style={{ position: 'relative' }}
    >
      <motion.div className="absolute inset-0 -z-20 will-change-transform" style={{ y: bgY, scale: bgScale }}>
        <img src={imageUrl} alt="" aria-hidden className="h-full w-full object-cover object-center" loading="lazy" />
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-0 -z-10" style={{ opacity: revealOpacity }}>
        <div
          className="absolute inset-0"
          style={{
            background: overlayDark
              ? 'radial-gradient(ellipse 65% 55% at 50% 50%, transparent 0%, rgba(10,10,15,0.72) 55%, rgba(10,10,15,0.97) 100%)'
              : `radial-gradient(ellipse 65% 55% at 50% 50%, transparent 0%, ${overlayColor} 55%, ${overlayColor} 100%)`,
          }}
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 -z-[9]"
        style={{
          background: overlayDark ? 'rgba(10,10,15,0.82)' : overlayColor,
        }}
      />

      {children}
    </section>
  );
}

export const sectionSurfaceShadow = '0 4px 30px rgba(0,0,0,0.06)';
export const subtleInsetShadow = '0 1px 0 rgba(255,255,255,0.8) inset';
export { motion, useScroll, useTransform };
