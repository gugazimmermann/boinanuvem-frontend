import { useState, useEffect } from "react";

interface UseAutoRotateOptions {
  itemsCount: number;
  interval?: number;
}

export function useAutoRotate({ itemsCount, interval = 5000 }: UseAutoRotateOptions) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % itemsCount);
    }, interval);
    return () => clearInterval(timer);
  }, [itemsCount, interval]);

  return [activeIndex, setActiveIndex] as const;
}

