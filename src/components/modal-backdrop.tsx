"use client";

import { lockBodyScroll } from "@/lib/body-scroll-lock";
import { modalBackdropClass, modalPanelClass } from "@/lib/ui";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

/** Alinhado a --modal-unmount-delay em globals.css */
export const MODAL_UNMOUNT_MS = 320;

type ModalBackdropProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  open: boolean;
  children: ReactNode;
  className?: string;
  onExitComplete?: () => void;
};

function parseUnmountMs() {
  if (typeof document === "undefined") {
    return MODAL_UNMOUNT_MS;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--modal-unmount-delay",
  );
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : MODAL_UNMOUNT_MS;
}

/** Portal no body + animação de overlay; mantém DOM até terminar o exit. */
export const ModalBackdrop = forwardRef<HTMLDivElement, ModalBackdropProps>(
  function ModalBackdrop(
    { open, children, className = "", onExitComplete, ...props },
    ref,
  ) {
    const [portalReady, setPortalReady] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [state, setState] = useState<"closed" | "open">("closed");
    const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const enterFrame = useRef<number | null>(null);
    const wasVisible = useRef(false);

    useEffect(() => {
      setPortalReady(true);
    }, []);

    useEffect(() => {
      if (open) {
        if (exitTimer.current) {
          clearTimeout(exitTimer.current);
          exitTimer.current = null;
        }
        if (enterFrame.current !== null) {
          cancelAnimationFrame(enterFrame.current);
        }
        wasVisible.current = true;
        setShouldRender(true);
        setState("closed");
        enterFrame.current = requestAnimationFrame(() => {
          enterFrame.current = requestAnimationFrame(() => {
            enterFrame.current = null;
            setState("open");
          });
        });
        return;
      }

      if (!wasVisible.current) {
        return;
      }

      setState("closed");
      exitTimer.current = setTimeout(() => {
        wasVisible.current = false;
        setShouldRender(false);
        onExitComplete?.();
      }, parseUnmountMs());

      return () => {
        if (exitTimer.current) {
          clearTimeout(exitTimer.current);
          exitTimer.current = null;
        }
      };
    }, [open, onExitComplete]);

    useEffect(() => {
      if (!shouldRender) {
        return;
      }

      return lockBodyScroll();
    }, [shouldRender]);

    if (!portalReady || !shouldRender) {
      return null;
    }

    return createPortal(
      <div
        ref={ref}
        data-state={state}
        className={`modal-backdrop ${modalBackdropClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

export function ModalPanel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`modal-panel ${modalPanelClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
