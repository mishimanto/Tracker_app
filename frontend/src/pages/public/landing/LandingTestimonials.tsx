import React from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { testimonials } from './content';
import { C } from './theme';
import { fadeIn, motion, ParallaxCard, Particles, Reveal, scaleReveal } from './shared';

export const LandingTestimonials: React.FC = () => (
  <section id="testimonials" className="relative overflow-hidden py-24 sm:py-36" style={{ background: C.darkDeep }}>
    <Particles count={20} dark />
    <div className="grid-bg absolute inset-0" />

    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="aurora-c absolute right-[-10%] top-[10%] h-[60vw] w-[60vw] rounded-full blur-[160px]" style={{ background: `${C.violet}15` }} />
      <div className="aurora-a absolute bottom-[5%] left-[-10%] h-[50vw] w-[50vw] rounded-full blur-[140px]" style={{ background: `${C.accent}12` }} />
    </div>

    <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
      <Reveal className="mx-auto mb-20 max-w-2xl text-center" variant={fadeIn}>
        <h2 className="display-font text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl sm:leading-[1.1]">
          Loved by <span className="text-gradient-orange">professionals.</span>
        </h2>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * 0.1} variant={scaleReveal}>
            <ParallaxCard intensity={5} className="h-full">
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.4, ease: 'easeOut' } }}
                className="testimonial-card group flex h-full flex-col  p-7 transition-all duration-500"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${testimonial.accent}25`;
                  e.currentTarget.style.boxShadow = `0 30px 80px rgba(0,0,0,0.3), 0 0 60px ${testimonial.accent}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  className="mb-6 h-0.5 w-12 transition-all duration-500 group-hover:w-20"
                  style={{ background: `linear-gradient(90deg, ${testimonial.accent}, ${testimonial.accent}40)` }}
                />

                <div className="mb-5 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <StarIcon
                      key={starIndex}
                      className="h-4 w-4 transition-transform duration-300"
                      style={{ color: C.accentLight, transitionDelay: `${starIndex * 50}ms` }}
                    />
                  ))}
                </div>

                <p className="mb-7 flex-1 text-sm leading-[1.9]" style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-3.5 border-t pt-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="relative">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${testimonial.accent}, ${testimonial.accent}cc)`,
                        boxShadow: `0 4px 16px ${testimonial.accent}30`,
                      }}
                    >
                      {testimonial.initials}
                    </div>
                    <div
                      className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
                      style={{ background: '#10b981', borderColor: C.darkDeep }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{testimonial.name}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </ParallaxCard>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
