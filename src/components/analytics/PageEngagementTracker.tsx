'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, shouldTrackPath } from '@/lib/tracking';

const INACTIVITY_THRESHOLD = 30000;
const MAX_ENGAGEMENT_SECONDS = 1800;

export function PageEngagementTracker() {
  const pathname = usePathname();

  const lastActivityRef = useRef<number>(0);
  const engagementStartRef = useRef<number>(0);
  const accumulatedSecondsRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);
  const currentPathRef = useRef<string | null>(null);

  const flushEngagement = useCallback(() => {
    if (accumulatedSecondsRef.current <= 0 || !currentPathRef.current) return;

    let secondsToReport = Math.round(accumulatedSecondsRef.current);
    if (secondsToReport > MAX_ENGAGEMENT_SECONDS) {
      secondsToReport = MAX_ENGAGEMENT_SECONDS;
    }

    if (secondsToReport > 0 && shouldTrackPath(currentPathRef.current)) {
      trackEvent({
        event_name: 'page_engagement',
        page_path: currentPathRef.current,
        engagement_seconds: secondsToReport,
      });
    }

    accumulatedSecondsRef.current = 0;
  }, []);

  const startTracking = useCallback(() => {
    if (!currentPathRef.current || !shouldTrackPath(currentPathRef.current)) return;
    if (!isTrackingRef.current && document.visibilityState === 'visible') {
      isTrackingRef.current = true;
      engagementStartRef.current = Date.now();
      lastActivityRef.current = Date.now();
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (!isTrackingRef.current) return;

    const now = Date.now();
    if (now - lastActivityRef.current < INACTIVITY_THRESHOLD) {
      accumulatedSecondsRef.current += (now - engagementStartRef.current) / 1000;
    } else {
      accumulatedSecondsRef.current +=
        (lastActivityRef.current + INACTIVITY_THRESHOLD - engagementStartRef.current) / 1000;
    }
    isTrackingRef.current = false;
  }, []);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isTrackingRef.current && document.visibilityState === 'visible') {
      startTracking();
    }
  }, [startTracking]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (currentPathRef.current && currentPathRef.current !== pathname) {
      stopTracking();
      flushEngagement();
    }
    currentPathRef.current = pathname;
    startTracking();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTracking();
      } else {
        stopTracking();
        flushEngagement();
      }
    };

    const handlePageHide = () => {
      stopTracking();
      flushEngagement();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    const intervalId = setInterval(() => {
      if (
        isTrackingRef.current &&
        Date.now() - lastActivityRef.current > INACTIVITY_THRESHOLD
      ) {
        stopTracking();
      }
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(intervalId);
    };
  }, [pathname, flushEngagement, startTracking, stopTracking, handleActivity]);

  return null;
}
