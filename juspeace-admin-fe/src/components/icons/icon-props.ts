import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function iconSizeProps(size = 20): Pick<IconProps, 'width' | 'height'> {
  return { width: size, height: size };
}
