"use client";

import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const garuxBusyOverlayClass =
  "fixed inset-0 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm";

const garuxBusyPanelClass =
  "flex w-full max-w-xs flex-col rounded-3xl border border-emerald-400/20 bg-white px-8 py-10 shadow-[0_0_80px_rgba(52,211,153,0.12)] dark:bg-zinc-950";

export function GaruxBusyOverlay({
  zIndexClass,
  className = "",
  ...props
}: ComponentProps<"div"> & { zIndexClass: string }) {
  return (
    <div
      className={`${garuxBusyOverlayClass} ${zIndexClass} ${className}`.trim()}
      {...props}
    />
  );
}

export function GaruxBusyPanel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${garuxBusyPanelClass} ${className}`.trim()}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function GaruxBusyDialog({
  open,
  titleId,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  titleId: string;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !portalReady) {
    return null;
  }

  return createPortal(
    <GaruxBusyOverlay
      zIndexClass="z-[115]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <GaruxBusyPanel className="gap-4">
        <div className="text-center">
          <p
            id={titleId}
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">{children}</div>
      </GaruxBusyPanel>
    </GaruxBusyOverlay>,
    document.body,
  );
}

const MIN_BUSY_MS = 2000;

type BusyContextValue = {
  busy: boolean;
  run: <T>(fn: () => Promise<T>) => Promise<T>;
};

const BusyContext = createContext<BusyContextValue | null>(null);

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function BusyProvider({ children }: { children: ReactNode }) {
  const [depth, setDepth] = useState(0);
  const run = useCallback(async <T,>(fn: () => Promise<T>) => {
    setDepth((current) => current + 1);
    const started = Date.now();

    try {
      return await fn();
    } finally {
      const remaining = MIN_BUSY_MS - (Date.now() - started);
      if (remaining > 0) {
        await wait(remaining);
      }
      setDepth((current) => Math.max(0, current - 1));
    }
  }, []);
  const value = useMemo(
    () => ({ busy: depth > 0, run }),
    [depth, run],
  );

  return (
    <BusyContext.Provider value={value}>
      {children}
      {depth > 0 ? <BusyModal /> : null}
    </BusyContext.Provider>
  );
}

export function useBusy() {
  const context = useContext(BusyContext);

  if (!context) {
    throw new Error("useBusy must be used within BusyProvider.");
  }

  return context;
}

export function useBusyAction<State>(
  action: (state: Awaited<State>, payload: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
) {
  const { run } = useBusy();
  const wrapped = useCallback(
    (state: Awaited<State>, formData: FormData) =>
      run(async () => action(state, formData)),
    [action, run],
  );

  return useActionState(wrapped, initialState);
}

export function PendingForm({
  action,
  ...props
}: Omit<ComponentProps<"form">, "action"> & {
  action: (formData: FormData) => void | Promise<void>;
}) {
  const { run } = useBusy();

  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        void run(async () => {
          await action(formData);
        });
      }}
    />
  );
}

export function ActionForm({
  action,
  ...props
}: Omit<ComponentProps<"form">, "action"> & {
  action: (formData: FormData) => void;
}) {
  return (
    <form
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        action(new FormData(event.currentTarget));
      }}
    />
  );
}

function BusyModal() {
  return (
    <GaruxBusyOverlay
      zIndexClass="z-[120]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garux-busy-title"
      aria-busy="true"
    >
      <GaruxBusyPanel className="items-center gap-5">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border-2 border-zinc-200 dark:border-zinc-800" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-300" />
          <span className="absolute inset-3 animate-pulse rounded-full bg-emerald-400/15" />
        </div>
        <div className="text-center">
          <p
            id="garux-busy-title"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Salvando
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Só um instante…</p>
        </div>
      </GaruxBusyPanel>
    </GaruxBusyOverlay>
  );
}
