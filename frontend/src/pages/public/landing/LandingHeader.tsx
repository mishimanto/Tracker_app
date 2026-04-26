import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { C } from './theme';
import { easeOut } from './shared';

const getProfileImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
  return `${baseUrl}/storage/${path}`;
};

interface LandingHeaderProps {
  brandName: string;
  logoUrl?: string | null;
  isAuthenticated: boolean;
  dashboardPath: string;
  navScrolled: boolean;
  userDisplayName: string;
  userRole?: 'user' | 'admin';
  profilePhotoPath?: string | null;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  brandName,
  logoUrl,
  isAuthenticated,
  dashboardPath,
  navScrolled,
  userDisplayName,
  userRole,
  profilePhotoPath,
}) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const profilePhotoUrl = getProfileImageUrl(profilePhotoPath);
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    window.scrollBy({
      top: event.deltaY,
      left: 0,
      behavior: 'auto',
    });
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: easeOut }}
      className={`glass-nav fixed inset-x-0 top-0 z-50 transition-all duration-700 ${navScrolled ? 'scrolled' : ''}`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-9 w-9 object-cover" />
          ) : (
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-extrabold text-white overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                boxShadow: `0 4px 24px ${C.accentGlow}`,
              }}
            >
              <span className="relative z-10">{brandName.charAt(0).toUpperCase()}</span>
              <div className="shimmer-btn absolute inset-0" />
            </div>
          )}
          <span
            className="display-font max-w-36 truncate text-sm font-bold tracking-tight sm:max-w-none"
            style={{ color: 'rgba(255,255,255,0.9)' }}
          >
            {brandName}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {['Features', 'How it Works', 'Testimonials'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 hover:bg-white/6"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="border px-3 py-2 text-[12px] font-semibold transition-all duration-300 hover:bg-white/5 hover:border-white/15 sm:px-5 sm:text-[13px]"
                style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)' }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="glow-button group relative overflow-hidden px-3 py-2 text-[12px] font-bold text-white sm:px-5 sm:text-[13px]"
                style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)` }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  Get started
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                <div className="shimmer-btn absolute inset-0" />
              </Link>
            </>
          ) : (
            <>
              {/* <Link
                to={dashboardPath}
                className="hidden rounded-full border border-white/10 px-4 py-2 text-[12px] font-semibold text-white/80 transition hover:bg-white/5 md:inline-flex"
              >
                {userRole === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link> */}

              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 px-2.5 py-2 text-white/85 transition">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt={userDisplayName} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})` }}
                    >
                      {userInitial}
                    </div>
                  )}
                  <div className="hidden text-left sm:block">
                    <div className="max-w-32 truncate text-md font-semibold">{userDisplayName}</div>
                    {/* <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">{userRole}</div> */}
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-white/55" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items
                    onWheel={handleMenuWheel}
                    className="absolute right-0 z-20 mt-2 w-56 origin-top-right border border-slate-200 bg-white p-2 shadow-xl focus:outline-none"
                  >
                    {/* <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{userDisplayName}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {userRole === 'admin' ? 'Administrator account' : 'Signed in workspace'}
                      </p>
                    </div> */}

                    <div className="py-2">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={dashboardPath}
                            className={`block px-3 py-2 text-sm ${active ? 'bg-slate-50' : ''}`}
                          >
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`block px-3 py-2 text-sm ${active ? 'bg-slate-50' : ''}`}
                          >
                            My Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/change-password"
                            className={`block px-3 py-2 text-sm ${active ? 'bg-slate-50' : ''}`}
                          >
                            Change Password
                          </Link>
                        )}
                      </Menu.Item>
                      {userRole === 'admin' && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin/settings"
                              className={`block px-3 py-2 text-sm ${active ? 'bg-slate-50' : ''}`}
                            >
                              Site Settings
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                    </div>

                    <div className="border-t border-slate-100 px-1 pt-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={`block w-full px-3 py-2 text-left text-sm text-red-600 ${active ? 'bg-red-50' : ''}`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};
