"use client";

/**
 * The navigation icon registry.
 *
 * Navigation is built on the server, but rendered by client sidebar
 * components - and a React component cannot be handed across that boundary as
 * a prop. So `NavItem` carries an icon *name*, a plain string that serialises
 * fine, and the lookup happens here on the client side of the line.
 */

import {
  BadgeCheck,
  Blocks,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Flag,
  Home,
  Info,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPinned,
  Megaphone,
  Palette,
  ScrollText,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export const NAV_ICONS = {
  home: Home,
  trophy: Trophy,
  calendar: CalendarDays,
  members: UsersRound,
  info: Info,
  rules: ScrollText,
  flag: Flag,
  overview: LayoutDashboard,
  users: Users,
  memberBadge: BadgeCheck,
  user: User,
  settings: Settings,
  palette: Palette,
  megaphone: Megaphone,
  payments: CreditCard,
  teeSheet: MapPinned,
  integrations: Blocks,
  pro: Sparkles,
  registration: ClipboardList,
  scoring: ListChecks,
  club: Building2,
  mail: Mail,
} as const;

export type IconName = keyof typeof NAV_ICONS;

export function NavIcon({ name, className }: { name?: IconName; className?: string }) {
  if (!name) return null;
  const Icon: LucideIcon = NAV_ICONS[name];
  return <Icon className={className} aria-hidden />;
}
