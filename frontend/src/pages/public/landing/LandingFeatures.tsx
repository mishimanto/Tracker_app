import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { features } from './content';
import { C } from './theme';
import { fadeIn, motion, ParallaxCard, Particles, Reveal, scaleReveal } from './shared';

export const LandingFeatures: React.FC = () => (
  <section id="features" className="relative overflow-hidden py-24 sm:py-36" style={{ background: C.dark }}>
    <Particles count={30} dark />
    <div className="grid-bg absolute inset-0" />

    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora-a absolute -left-[10%] top-[20%] h-[50vw] w-[50vw]  blur-[150px]" style={{ background: `${C.accent}15` }} />
      <div className="aurora-b absolute -right-[10%] bottom-[10%] h-[45vw] w-[45vw]  blur-[150px]" style={{ background: `${C.violet}12` }} />
      <div className="aurora-c absolute right-[25%] top-[10%] h-[35vw] w-[35vw]  blur-[130px]" style={{ background: `${C.cyan}10` }} />
    </div>

    <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
      <Reveal className="mx-auto mb-20 max-w-2xl text-center" variant={fadeIn}>
        <h2 className="display-font text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl sm:leading-[1.08]">
          Built for clarity. <span className="text-gradient-orange">Designed for speed.</span>
        </h2>
      </Reveal>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Reveal
              key={feature.title}
              delay={index * 0.08}
              variant={scaleReveal}
              className={feature.span === 2 ? 'sm:col-span-2' : ''}
            >
              <Link to={feature.href} className="block h-full">
                <ParallaxCard intensity={5} className="h-full">
                  <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.4, ease: 'easeOut' } }}
                    className="feature-card group relative flex h-full flex-col items-start gap-4 p-6 transition-all duration-500 sm:flex-row sm:gap-5 sm:p-8"
                    style={{
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(20px)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${feature.accent}30`;
                      e.currentTarget.style.boxShadow = `0 30px 80px rgba(0,0,0,0.3), 0 0 60px ${feature.accent}12`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ background: `radial-gradient(ellipse at top left, ${feature.accent}08, transparent 60%)` }}
                    />

                    <div
                      className="relative z-10 flex h-13 w-13 shrink-0 items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${feature.accent}, ${feature.accent}cc)`, boxShadow: `0 6px 24px ${feature.accent}35`, padding: '10px' }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="relative z-10 min-w-0 flex-1">
                      <div className="mb-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="display-font text-lg font-bold tracking-tight text-white">{feature.title}</h3>
                        <span
                          className="shrink-0  px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]"
                          style={{ background: `${feature.accent}18`, color: feature.accent }}
                        >
                          {feature.tag}
                        </span>
                      </div>
                      <p className="text-sm leading-[1.8]" style={{ color: 'rgba(255,255,255,0.42)', fontWeight: 300 }}>
                        {feature.desc}
                      </p>
                      <div
                        className="mt-4 flex items-center gap-1.5 text-[12px] font-semibold opacity-100 transition-all duration-300 sm:opacity-0 group-hover:opacity-100"
                        style={{ color: feature.accent }}
                      >
                        {feature.action}
                        <ArrowRightIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </motion.div>
                </ParallaxCard>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);
