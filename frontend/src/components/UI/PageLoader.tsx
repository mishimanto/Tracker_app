import React, { useEffect, useState } from 'react';

interface PageLoaderProps {
  message?: string;
  exiting?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading',
  exiting = false,
}) => {
  void message;

  return (
    <div
      className={`flex h-96 items-center justify-center transition-all duration-300 ${
        exiting ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-5 animate-[fadeUp_0.4s_ease_both]">
        <div className="loader"></div>
      </div>
    </div>
  );
};

interface PageLoaderTransitionProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const PageLoaderTransition: React.FC<PageLoaderTransitionProps> = ({
  loading,
  message,
  children,
}) => {
  const [visible, setVisible] = useState(loading);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setExiting(false);
      return;
    }

    if (!visible) return;

    setExiting(true);

    const timeout = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [loading, visible]);

  if (visible) {
    return <PageLoader message={message} exiting={exiting} />;
  }

  return <>{children}</>;
};
