'use client';

import { useEffect, useState } from 'react';

/**
 * Manages the qari-selection dropdown's open state and a global
 * outside-click handler that closes it.
 */
export function useQariMenu() {
  const [showQariMenu, setShowQariMenu] = useState(false);

  useEffect(() => {
    if (!showQariMenu) return;
    const handler = () => setShowQariMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showQariMenu]);

  return { showQariMenu, setShowQariMenu };
}
