'use client';

import React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // TODO: Add SessionProvider and QueryClientProvider when dependencies are installed
  // For now, just wrap children to avoid dependency issues during initial setup
  return <>{children}</>;
} 