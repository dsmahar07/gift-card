import { HugeiconsIcon } from '@hugeicons/react';

interface HugeIconProps {
  icon: any;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function HugeIcon({ 
  icon, 
  size = 24, 
  color = "currentColor", 
  strokeWidth = 1.5,
  className 
}: HugeIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}
