import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { footerSections } from './content';
import { C } from './theme';

interface LandingFooterProps {
  brandName: string;
  logoUrl?: string | null;
  isAuthenticated: boolean;
  dashboardPath: string;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  brandName,
  logoUrl,
  isAuthenticated,
  dashboardPath,
}) => {
  const accountSection = {
    title: 'Account',
    links: isAuthenticated
      ? [
          { label: 'Dashboard', to: dashboardPath },
          { label: 'Profile', to: '/profile' },
        ]
      : [
          { label: 'Sign In', to: '/login' },
          { label: 'Create Account', to: '/register' },
        ],
  };

  return (
    <footer
      className="border-t bg-gray-900"
      // style={{ borderColor: '#e2e8f0' }}
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-16">
        <div
          className="grid gap-10 border-b pb-10 sm:gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]"
          style={{ borderColor: '#e2e8f0' }}
        >
          <div className="max-w-md">
            <Link to="/" className="mb-5 flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-10 w-10 object-cover"
                  style={{ borderColor: '#cbd5e1' }}
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-extrabold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                    boxShadow: `0 8px 24px ${C.accentGlow}`,
                  }}
                >
                  {brandName.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className="display-font text-base font-bold tracking-tight text-gray-300"
                // style={{ color: C.textPrimary }}
              >
                {brandName}
              </span>
            </Link>
            <p
              className="max-w-sm text-sm leading-7"
              style={{ color: C.textSecondary, fontWeight: 300 }}
            >
              Unified workspace for tasks, expenses, notes, and reports. Explore the
              features here, then jump into your dashboard when you are ready.
            </p>
            {/* <div className="mt-6 flex flex-wrap gap-2.5">
              {['Secure access', 'Responsive layout', 'Fast reports'].map((item, index) => (
                <span
                  key={item}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                  style={{
                    borderColor: [C.accent, C.violet, C.cyan][index] + '26',
                    background: '#ffffff',
                    color: C.textSecondary,
                  }}
                >
                  {item}
                </span>
              ))}
            </div> */}
          </div>

          {[...footerSections, accountSection].map((section) => (
            <div key={section.title}>
              <p
                className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]"
                style={{ color: C.textMuted }}
              >
                {section.title}
              </p>
              <div className="flex flex-col gap-3">
                {section.links.map((link) =>
                  link.to.startsWith('#') ? (
                    <a
                      key={link.label}
                      href={link.to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: C.textSecondary, fontWeight: 200 }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-sm transition-colors duration-200"
                      style={{ color: C.textSecondary, fontWeight: 500 }}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs" style={{ color: C.textMuted }}>
            &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: C.textMuted }}>
            <ShieldCheckIcon className="h-3.5 w-3.5" style={{ color: C.accent }} />
            Secured with industry-standard encryption
          </div>
        </div>
      </div>
    </footer>
  );
};
