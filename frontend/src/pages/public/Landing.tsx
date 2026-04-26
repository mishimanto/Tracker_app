import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsService } from '../../services/siteSettingsService';
import { useAuthStore } from '../../store/authStore';
import { resolveBrandingAssetUrl } from '../../utils/branding';
import { LandingFooter } from './landing/LandingFooter';
import { LandingHeader } from './landing/LandingHeader';
import { LandingHero } from './landing/LandingHero';
import { LandingMarquee } from './landing/LandingMarquee';
import { C } from './landing/theme';

const LandingStats = lazy(async () => {
  const module = await import('./landing/LandingStats');
  return { default: module.LandingStats };
});

const LandingFeatures = lazy(async () => {
  const module = await import('./landing/LandingFeatures');
  return { default: module.LandingFeatures };
});

const LandingHowItWorks = lazy(async () => {
  const module = await import('./landing/LandingHowItWorks');
  return { default: module.LandingHowItWorks };
});

const LandingTestimonials = lazy(async () => {
  const module = await import('./landing/LandingTestimonials');
  return { default: module.LandingTestimonials };
});

const LandingCta = lazy(async () => {
  const module = await import('./landing/LandingCta');
  return { default: module.LandingCta };
});

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; }
  .display-font { font-family: 'Bricolage Grotesque', sans-serif; }

  @keyframes auroraA {
    0%,100% { transform: translate(0%,0%) scale(1) rotate(0deg); opacity: 0.7; }
    33% { transform: translate(5%,-7%) scale(1.1) rotate(2deg); opacity: 0.9; }
    66% { transform: translate(-4%,5%) scale(0.92) rotate(-1.5deg); opacity: 0.6; }
  }
  @keyframes auroraB {
    0%,100% { transform: translate(0%,0%) scale(1); opacity: 0.6; }
    50% { transform: translate(-6%,4%) scale(1.14) rotate(-2.5deg); opacity: 0.8; }
  }
  @keyframes auroraC {
    0%,100% { transform: translate(0%,0%) scale(1); opacity: 0.5; }
    40% { transform: translate(4%,6%) scale(1.07); opacity: 0.7; }
    80% { transform: translate(-5%,-4%) scale(0.95); opacity: 0.4; }
  }
  @keyframes auroraD {
    0%,100% { transform: translate(0%,0%) scale(1) rotate(0deg); opacity: 0.4; }
    25% { transform: translate(3%,-5%) scale(1.05) rotate(1deg); opacity: 0.6; }
    75% { transform: translate(-3%,3%) scale(0.97) rotate(-0.5deg); opacity: 0.3; }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes shimmer {
    0% { background-position: -300% 0; }
    100% { background-position: 300% 0; }
  }
  @keyframes gridPulse {
    0%,100% { opacity: 0.02; }
    50% { opacity: 0.05; }
  }
  @keyframes scanLine {
    0% { top: -2px; }
    100% { top: 100%; }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 30px rgba(224,122,47,0.3), 0 0 60px rgba(224,122,47,0.1); }
    50% { box-shadow: 0 0 50px rgba(224,122,47,0.5), 0 0 100px rgba(224,122,47,0.2); }
  }
  @keyframes spin360 {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes particleFloat {
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
    33% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 0.5; }
    66% { transform: translateY(-10px) translateX(-8px) scale(0.9); opacity: 0.7; }
    100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
  }

  .aurora-a { animation: auroraA 16s ease-in-out infinite; }
  .aurora-b { animation: auroraB 20s ease-in-out infinite; }
  .aurora-c { animation: auroraC 13s ease-in-out infinite; }
  .aurora-d { animation: auroraD 24s ease-in-out infinite; }
  .marquee-fwd { animation: marquee 40s linear infinite; }
  .particle { animation: particleFloat var(--duration, 4s) ease-in-out infinite; animation-delay: var(--delay, 0s); }

  .shimmer-btn {
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%);
    background-size: 300% 100%;
    animation: shimmer 4s ease-in-out infinite;
  }

  .hero-overlay {
    background:
      radial-gradient(ellipse 70% 60% at 50% 0%, rgba(224,122,47,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%),
      linear-gradient(180deg, rgba(6,6,8,0.35) 0%, rgba(6,6,8,0.55) 40%, rgba(6,6,8,0.95) 100%);
  }

  .glass-nav {
    background: rgba(6,6,8,0.1);
    backdrop-filter: blur(2px) saturate(1.5) brightness(1.1);
    -webkit-backdrop-filter: blur(28px) saturate(1.5) brightness(1.1);
  }
  .glass-nav.scrolled {
    background: rgba(6,6,8,0.92);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 16px 60px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03);
  }

  .accent-gradient-border { position: relative; isolation: isolate; }
  .accent-gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(224,122,47,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(6,182,212,0.2) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .feature-card { position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1); }
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(224,122,47,0.08) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
  }
  .feature-card:hover::before { opacity: 1; }

  .stat-card { position: relative; overflow: hidden; }
  .stat-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent 0deg, rgba(224,122,47,0.04) 60deg, transparent 120deg);
    animation: spin360 8s linear infinite;
    pointer-events: none;
  }

  .glow-button { animation: glowPulse 3s ease-in-out infinite; }
  .glow-button:hover {
    animation: none;
    box-shadow: 0 0 60px rgba(224,122,47,0.6), 0 0 120px rgba(224,122,47,0.25), 0 8px 40px rgba(224,122,47,0.4);
  }

  .testimonial-card { position: relative; overflow: hidden; }
  .testimonial-card::before {
    content: '"';
    position: absolute;
    top: -20px;
    right: 20px;
    font-size: 180px;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 800;
    color: rgba(224,122,47,0.04);
    line-height: 1;
    pointer-events: none;
  }

  .grid-bg {
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: gridPulse 6s ease-in-out infinite;
  }
  .section-grid-bg {
    background-image:
      linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .text-gradient-orange {
    background: linear-gradient(135deg, ${C.accentLight} 0%, #ff8c42 40%, ${C.violet} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-gradient-violet {
    background: linear-gradient(135deg, ${C.violet} 0%, ${C.cyan} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card-shine { position: relative; overflow: hidden; }
  .card-shine::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 30%;
    height: 200%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transform: skewX(-20deg);
    animation: shimmer 5s ease-in-out infinite;
    pointer-events: none;
  }

  .number-glow { text-shadow: 0 0 40px rgba(224,122,47,0.4); }
  .icon-glow { filter: drop-shadow(0 0 8px rgba(224,122,47,0.5)); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export const Landing: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });

  const { data: publicStats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: siteSettingsService.getPublicStats,
    staleTime: 1000 * 60 * 10,
  });

  const brandName = settings?.site_name?.trim() || 'Task & Expense Tracker';
  const logoUrl = resolveBrandingAssetUrl(settings?.logo_url || settings?.logo_path);
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  const userDisplayName = user?.name?.trim() || 'Workspace User';

  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden antialiased" style={{ background: C.surface, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{globalStyles}</style>

      <LandingHeader
        brandName={brandName}
        logoUrl={logoUrl}
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        navScrolled={navScrolled}
        userDisplayName={userDisplayName}
        userRole={user?.role}
        profilePhotoPath={user?.profile_photo_path}
      />
      <LandingHero
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        userDisplayName={userDisplayName}
      />
      <LandingMarquee />
      <Suspense fallback={<div className="min-h-24" />}>
        <LandingStats publicStats={publicStats ?? null} />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingCta isAuthenticated={isAuthenticated} dashboardPath={dashboardPath} />
      </Suspense>
      <LandingFooter
        brandName={brandName}
        logoUrl={logoUrl}
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
      />
    </div>
  );
};
