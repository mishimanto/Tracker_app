import React from 'react';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { C } from './theme';
import { BgRevealSection, BG_IMAGES, Particles, Reveal, scaleReveal } from './shared';

interface LandingCtaProps {
  isAuthenticated: boolean;
  dashboardPath: string;
}

export const LandingCta: React.FC<LandingCtaProps> = ({ isAuthenticated, dashboardPath }) => (
  <BgRevealSection imageUrl={BG_IMAGES.cta} overlayColor="rgba(248,247,245,0.89)" className="py-24 sm:py-32 section-grid-bg">
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2"
        style={{ background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)` }}
      />
    </div>

    <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
      <Reveal variant={scaleReveal}>
        <div className="relative overflow-hidden -[3rem] px-8 py-16 sm:px-14 sm:py-24" style={{ background: C.dark }}>
          <div className="absolute inset-0 overflow-hidden -[3rem]">
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${C.accent}15, ${C.violet}10, ${C.cyan}08)` }} />
            <div className="absolute inset-0 border border-white/6" />
          </div>

          <Particles count={15} dark />
          <div className="grid-bg absolute inset-0" />

          <div className="aurora-a absolute -left-20 -top-20 h-64 w-64 -full blur-[100px]" style={{ background: `${C.accent}25` }} />
          <div className="aurora-b absolute -bottom-20 -right-20 h-72 w-72 -full blur-[100px]" style={{ background: `${C.violet}18` }} />
          <div className="aurora-c absolute right-[30%] top-[30%] h-48 w-48 -full blur-[80px]" style={{ background: `${C.cyan}15` }} />

          <div className="relative flex flex-col items-center gap-12 text-center lg:flex-row lg:gap-20 lg:text-left">
            <div className="flex-1">
              <h3 className="display-font my-5 max-w-lg text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl sm:leading-[1.1]">
                Take control of your <span className="text-gradient-orange">productivity today.</span>
              </h3>
              <p className="my-5 max-w-md text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 300 }}>
                Join thousands who manage tasks, expenses, and reports in one clean workspace. Free to start. No card required.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                {['No credit card', 'Free forever plan', 'Cancel anytime'].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: `${C.accent}20` }}>
                      <CheckCircleIcon className="h-3 w-3" style={{ color: C.accentLight }} />
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex min-w-55 flex-col gap-3.5">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="glow-button group relative inline-flex items-center justify-center gap-2.5 overflow-hidden -full px-10 py-4 text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)` }}
                  >
                    <span className="relative z-10">Create Free Account</span>
                    <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    <div className="shimmer-btn absolute inset-0" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center -full border px-10 py-4 text-sm font-semibold transition-all duration-300"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Sign in to workspace
                  </Link>
                </>
              ) : (
                <Link
                  to={dashboardPath}
                  className="glow-button group relative inline-flex items-center justify-center gap-2.5 overflow-hidden -full px-10 py-4 text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)` }}
                >
                  <span className="relative z-10">Get Started</span>
                  <ArrowRightIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="shimmer-btn absolute inset-0" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </BgRevealSection>
);
