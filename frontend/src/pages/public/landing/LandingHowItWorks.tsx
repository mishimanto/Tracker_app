import React from 'react';
import { steps } from './content';
import { C } from './theme';
import { BgRevealSection, BG_IMAGES, fadeIn, fadeUp, motion, ParallaxCard, Reveal } from './shared';

export const LandingHowItWorks: React.FC = () => (
  <BgRevealSection
    id="how-it-works"
    imageUrl={BG_IMAGES.howItWorks}
    overlayColor="rgba(248,247,245,0.91)"
    className="py-24 sm:py-36 section-grid-bg"
  >
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute left-1/2 top-1/2 h-175 w-175 -translate-x-1/2 -translate-y-1/2 -full"
        style={{ background: `radial-gradient(circle, ${C.violet}06 0%, transparent 65%)` }}
      />
    </div>

    <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
      <Reveal className="mx-auto mb-20 max-w-2xl text-center" variant={fadeIn}>
        <h2 className="display-font text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl sm:leading-[1.1]" style={{ color: C.textPrimary }}>
          Start organizing in <span className="text-gradient-orange">three steps.</span>
        </h2>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.num} delay={index * 0.12} variant={fadeUp}>
            <ParallaxCard intensity={5} className="h-full">
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: 'easeOut' } }}
                className="group relative flex h-full flex-col overflow-hidden -[2rem] bg-white"
                style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.06)', border: `1px solid ${C.lightBorder}` }}
              >
                <div
                  className="pointer-events-none absolute right-5 top-3 display-font text-[7rem] font-extrabold leading-none select-none"
                  style={{ color: `${step.color}07` }}
                >
                  {step.num}
                </div>

                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${step.color}, ${step.color}60)` }} />

                <div className="relative z-10 flex flex-1 flex-col p-8">
                  <div className="mb-6 flex items-center gap-4">
                    <span className="display-font text-5xl font-extrabold tabular-nums" style={{ color: `${step.color}40` }}>
                      {step.num}
                    </span>
                  </div>

                  <h3 className="display-font mb-3 text-xl font-bold tracking-tight" style={{ color: C.textPrimary }}>
                    {step.title}
                  </h3>
                  <p className="flex-1 text-sm leading-[1.85]" style={{ color: C.textSecondary, fontWeight: 300 }}>
                    {step.desc}
                  </p>

                  <div className="mt-6 flex items-center gap-2">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className="h-1.5 -full transition-all duration-300"
                        style={{
                          width: dot === index ? 20 : 6,
                          background: dot === index ? step.color : `${step.color}30`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </ParallaxCard>
          </Reveal>
        ))}
      </div>
    </div>
  </BgRevealSection>
);
