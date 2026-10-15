import { useEffect, useRef, useState } from "react";

/** Width of an element, tracked with ResizeObserver. Starts at `initial` for SSR. */
export function useWidth<T extends HTMLElement>(initial = 720) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** True once the element has scrolled into view (fires once). */
export function useSeen<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      setSeen(true); // already on screen at mount (e.g. an embed)
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setSeen(true),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Index of the scrolly step whose element is nearest the viewport's reading line. */
export function useActiveStep(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [count]);
  const bind = (i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  };
  return [active, bind] as const;
}
