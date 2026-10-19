import React from 'react';
import {
  Banknote,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Users,
  CircleEllipsis,
  Briefcase,
  Gift,
  TrendingUp,
  Store,
  Smile,
  PlusCircle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Banknote,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Users,
  CircleEllipsis,
  Briefcase,
  Gift,
  TrendingUp,
  Store,
  Smile,
  PlusCircle,
};

interface CategoryIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 20,
  color,
  className = '',
}) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent size={size} color={color} className={className} />;
};
