const STAGGER_MS = 70;

export function revealDelay(index: number) {
  return index * STAGGER_MS;
}
