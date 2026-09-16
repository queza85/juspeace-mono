'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SIDEBAR_CHART_RESIZE_DELAY_MS } from '@/components/layout/admin-layout.constants';

const DEFAULT_DEBOUNCE_MS = SIDEBAR_CHART_RESIZE_DELAY_MS;

function useDebouncedElementSize(debounceMs = DEFAULT_DEBOUNCE_MS) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let frameId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      frameId = requestAnimationFrame(() => {
        timeoutId = setTimeout(measure, debounceMs);
      });
    };

    measure();

    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [debounceMs]);

  return { ref, size };
}

export function ChartContainer({
  height,
  children,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: {
  height: number;
  debounceMs?: number;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const { ref, size } = useDebouncedElementSize(debounceMs);

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}
