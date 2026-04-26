import React from 'react';
import { CheckCircleIcon, ClipboardDocumentListIcon, UsersIcon } from '@heroicons/react/24/outline';
import { C } from './theme';
import {
  AnimatedCounter,
  BgRevealSection,
  BG_IMAGES,
  easeOut,
  motion,
  ParallaxCard,
  Reveal,
  scaleReveal,
  sectionSurfaceShadow,
  subtleInsetShadow,
} from './shared';

interface LandingStatsProps {
  publicStats?: {
    totalUsers?: number;
    totalTasks?: number;
    activeUsers?: number;
  } | null;
}

export const LandingStats: React.FC<LandingStatsProps> = ({ publicStats }) => (
  <BgRevealSection imageUrl={BG_IMAGES.stats} overlayColor="rgba(248,247,245,0.90)" className="py-24 sm:py-32 section-grid-bg">
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 "
        style={{ background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)` }}
      />
    </div>

    <div className="relative mx-auto max-w-6xl px-6 sm:px-8">
      <Reveal className="mx-auto mb-16 max-w-xl text-center">
        <h2 className="display-font text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl" style={{ color: C.textPrimary }}>
          Trusted by teams <span className="text-gradient-orange">worldwide.</span>
        </h2>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          { label: 'Total Users', value: Number(publicStats?.totalUsers) || 0, icon: UsersIcon, color: C.accent, suffix: '+' },
          { label: 'Tasks Managed', value: Number(publicStats?.totalTasks) || 0, icon: ClipboardDocumentListIcon, color: C.violet, suffix: '+' },
          { label: 'Active Users', value: Number(publicStats?.activeUsers) || 0, icon: CheckCircleIcon, color: C.cyan, suffix: '' },
        ].map((stat, index) => (
          <Reveal key={stat.label} delay={index} variant={scaleReveal}>
            <ParallaxCard intensity={6}>
              <div
                className="stat-card accent-gradient-border card-shine group relative overflow-hidden -[2rem] bg-white p-8 transition-all duration-500 hover:-translate-y-2"
                style={{ boxShadow: `${sectionSurfaceShadow}, ${subtleInsetShadow}` }}
              >
                <div className="relative flex items-center gap-5">
                  <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center -[1.25rem] text-white transition-transform duration-500 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`, boxShadow: `0 6px 24px ${stat.color}30` }}
                  >
                    <stat.icon className="icon-glow h-6 w-6" />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: C.textMuted }}>
                      {stat.label}
                    </p>
                    <p className="display-font number-glow text-3xl font-extrabold tracking-tight" style={{ color: C.textPrimary }}>
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-1  overflow-hidden" style={{ background: `${stat.color}15` }}>
                  <motion.div
                    className="h-full "
                    style={{ background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)` }}
                    initial={{ width: 0 }}
                    whileInView={{ width: '75%' }}
                    transition={{ duration: 1.5, delay: index * 0.2, ease: easeOut }}
                    viewport={{ once: true }}
                  />
                </div>
              </div>
            </ParallaxCard>
          </Reveal>
        ))}
      </div>
    </div>
  </BgRevealSection>
);
