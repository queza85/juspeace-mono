/** Sidebar width token — keep in sync with Tailwind `w-60`. */
export const SIDEBAR_WIDTH_CLASS = 'w-60';

/** Desktop sidebar open/close animation duration (ms). */
export const SIDEBAR_ANIMATION_MS = 300;

/** Chart resize debounce — waits until sidebar animation finishes. */
export const SIDEBAR_CHART_RESIZE_DELAY_MS = SIDEBAR_ANIMATION_MS + 80;

export const sidebarAnimateClass =
  'sidebar-animate transition-[width,padding,border-color] duration-300 ease-in-out';

export const sidebarContentAnimateClass = 'sidebar-content-animate';
