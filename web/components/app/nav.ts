import {
  ChartColumn,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Map as MapIcon,
  ScanSearch,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; mobile?: boolean };

/** App navigation. `mobile: true` items sit in the bottom bar, the rest under "More". */
export const APP_NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/app/analyze", label: "Analyze", icon: ScanSearch, mobile: true },
  { href: "/app/reports", label: "Reports", icon: FileText, mobile: true },
  { href: "/app/map", label: "Map", icon: MapIcon, mobile: true },
  { href: "/app/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/app/rules", label: "Rules", icon: SlidersHorizontal },
  { href: "/app/model", label: "Model", icon: FlaskConical },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(href + "/");
}
