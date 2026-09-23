"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Atraso extra ao entrar na viewport (ms). */
  delayMs?: number;
};

export function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delayMs = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    setArmed(true);
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.06 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stateClass = visible
    ? "reveal-visible"
    : armed
      ? "reveal-hidden"
      : "";

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${stateClass} ${className}`.trim()}
      style={
        armed || visible ? { transitionDelay: `${delayMs}ms` } : undefined
      }
    >
      {children}
    </Tag>
  );
}
