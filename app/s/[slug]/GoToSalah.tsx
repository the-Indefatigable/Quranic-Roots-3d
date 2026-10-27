'use client';

import { useEffect } from 'react';

/** Sends a person who opened a shared link on to the salah path; link-preview bots don't run it. */
export function GoToSalah() {
  useEffect(() => { window.location.replace('/salah?src=share'); }, []);
  return null;
}
