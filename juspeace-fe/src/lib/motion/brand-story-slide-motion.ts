export const SCATTER_Y_BY_DEPTH = [-20, -14, -10] as const;
export const SCATTER_ROTATION_BY_DEPTH = [-6, 3, -4] as const;
export const SCATTER_ROTATION_PREV_BY_DEPTH = [6, -3, 4] as const;

export const SCATTER_DURATION = 0.2;
export const SETTLE_DURATION = 0.38;

export const SCATTER_EASE = 'power2.out';
export const SETTLE_EASE = 'back.out(1.4)';

export const STACK_DEPTH_BACKGROUNDS = ['#FBFBFB', '#F2F2F2', '#EAEAEAFA'] as const;

export type SlideDirection = 'next' | 'prev';
export type ScatterShadowDepth = 'scatter' | 'flat';

export interface StackSlotMetrics {
  inset: number;
  marginTop: number;
  width: number;
}

export function paperBackground(depth: number): string {
  return (
    STACK_DEPTH_BACKGROUNDS[depth] ??
    STACK_DEPTH_BACKGROUNDS[STACK_DEPTH_BACKGROUNDS.length - 1]
  );
}

export function stackSlotMetrics(
  depth: number,
  peekCount: number,
  peekX: number,
  peekY: number,
  folderWidth: number,
): StackSlotMetrics {
  return {
    inset: depth * peekX,
    marginTop: (peekCount - depth) * peekY,
    width: folderWidth - depth * 2 * peekX,
  };
}

export function scatterY(depth: number): number {
  return (
    SCATTER_Y_BY_DEPTH[depth] ??
    SCATTER_Y_BY_DEPTH[SCATTER_Y_BY_DEPTH.length - 1]
  );
}

export function scatterRotation(
  depth: number,
  direction: SlideDirection,
): number {
  const table =
    direction === 'next'
      ? SCATTER_ROTATION_BY_DEPTH
      : SCATTER_ROTATION_PREV_BY_DEPTH;
  return table[depth] ?? table[table.length - 1];
}

export function scatterShadow(depth: ScatterShadowDepth): string {
  if (depth === 'scatter') {
    return '0 16px 36px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)';
  }
  return '0 2px 8px rgba(0, 0, 0, 0.06)';
}
