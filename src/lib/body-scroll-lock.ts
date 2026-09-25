let locks = 0;
let previousOverflow = "";

/** Vários modais podem travar o scroll ao mesmo tempo. O body só volta ao valor anterior quando o último fecha. */
export function lockBodyScroll() {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (locks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  locks += 1;
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    locks = Math.max(0, locks - 1);

    if (locks === 0) {
      document.body.style.overflow = previousOverflow;
    }
  };
}
