import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownIcon, ArrowRightIcon, BoltIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { C } from './theme';
import { easeOut, fadeIn, fadeUp, motion, Particles, useScroll, useTransform } from './shared';

interface LandingHeroProps {
  isAuthenticated: boolean;
  dashboardPath: string;
  userDisplayName: string;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  isAuthenticated,
  dashboardPath,
  userDisplayName,
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.8], [0.6, 0.15]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scheduleLoad = () => setShouldLoadVideo(true);

    if ('requestIdleCallback' in window) {
      const idleId = (window as Window & {
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      }).requestIdleCallback(scheduleLoad, { timeout: 1200 });

      return () => {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = setTimeout(scheduleLoad, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: C.hero }}
    >
      {shouldLoadVideo ? (
        <motion.div style={{ scale: videoScale, opacity: videoOpacity }} className="absolute inset-0 -z-20">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
          >
            <source
              src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>
      ) : (
        <div className="absolute inset-0 -z-20 bg-[#060608]" />
      )}

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="aurora-a absolute -left-[20%] top-[0%] h-[70vw] w-[70vw] -full blur-[150px]"
          style={{ background: `radial-gradient(circle, ${C.accent}35 0%, ${C.accentDark}15 50%, transparent 70%)` }}
        />
        <div
          className="aurora-b absolute -right-[15%] top-[-5%] h-[65vw] w-[65vw] -full blur-[150px]"
          style={{ background: `radial-gradient(circle, ${C.violet}28 0%, transparent 60%)` }}
        />
        <div
          className="aurora-c absolute -bottom-[20%] left-[20%] h-[55vw] w-[55vw] -full blur-[130px]"
          style={{ background: `radial-gradient(circle, ${C.cyan}18 0%, transparent 60%)` }}
        />
        <div
          className="aurora-d absolute top-[30%] left-[40%] h-[40vw] w-[40vw] -full blur-[120px]"
          style={{ background: `radial-gradient(circle, ${C.accent}12 0%, transparent 60%)` }}
        />
      </div>

      <div className="hero-overlay absolute inset-0" />
      <div className="grid-bg absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 opacity-[0.015]"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.accentLight}, transparent)`,
            animation: 'scanLine 8s linear infinite',
          }}
        />
      </div>

      <Particles count={25} dark />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-28 text-center sm:px-8"
      >
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="display-font my-10 mx-auto max-w-5xl text-[2.8rem] font-extrabold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5rem] lg:leading-[1.04]"
        >
          Your work, <span className="text-gradient-orange">unified</span> and
          <br className="hidden sm:block" /> <span className="text-gradient-violet">amplified.</span>
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="mt-20 flex flex-col items-center justify-center gap-3.5 sm:flex-row"
        >
          {!isAuthenticated ? (
            <>
              <Link
                to="/register"
                className="glow-button group relative inline-flex items-center justify-center gap-2.5 overflow-hidden  px-10 py-4 text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)` }}
              >
                <span className="relative z-10">Create Free Account</span>
                <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="shimmer-btn absolute inset-0" />
              </Link>
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2  border px-10 py-4 text-sm font-semibold backdrop-blur-sm transition-all duration-400"
                style={{ borderColor: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              <div
                className="inline-flex items-center justify-center  border px-6 py-4 text-sm font-semibold"
                style={{
                  borderColor: 'rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.82)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                Welcome back, {userDisplayName}
              </div>
              <Link
                to={dashboardPath}
                className="glow-button group relative inline-flex items-center justify-center gap-2.5 overflow-hidden  px-10 py-4 text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)` }}
              >
                <span className="relative z-10">Go to Dashboard</span>
                <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="shimmer-btn absolute inset-0" />
              </Link>
            </>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          custom={5}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          {[
            { icon: LockClosedIcon, text: 'Safe and Secure' },
            { icon: GlobeAltIcon, text: 'Works on any device' },
            { icon: BoltIcon, text: 'Fast response' },
          ].map((badge) => (
            <span
              key={badge.text}
              className="inline-flex items-center gap-1.5  px-4 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-all duration-300"
              style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.025)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              <badge.icon className="h-3 w-3" style={{ color: `${C.accent}99` }} />
              {badge.text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Scroll
        </span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowDownIcon className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
};
