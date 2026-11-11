import {
  BookOpen,
  ChartColumn,
  DoorOpen,
  FileText,
  FlaskConical,
  GitCompareArrows,
  House,
  LayoutDashboard,
  Map as MapIcon,
  ScanSearch,
  Search,
  Settings,
  SlidersHorizontal,
  TrafficCone,
  type LucideIcon,
} from "lucide-react";
import { MODULES, type ModuleId } from "@/lib/brand";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar (the rest sit under "More"). */
  mobile?: boolean;
  /** Active only on this exact path (overview pages). */
  exact?: boolean;
  /** Extra path prefixes that count as this item (detail pages without their own entry). */
  also?: string[];
};

export const MODULE_ICONS: Record<ModuleId, LucideIcon> = { roads: TrafficCone, restrooms: DoorOpen };

export const HOME_ITEM: NavItem = { href: "/app", label: "Home", icon: House, exact: true };

/** Pages of each module, in sidebar order. */
export const MODULE_NAV: Record<ModuleId, NavItem[]> = {
  roads: [
    { href: MODULES.roads.href, label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/app/roads/analyze", label: "Analyze", icon: ScanSearch, mobile: true },
    { href: "/app/roads/reports", label: "Reports", icon: FileText, mobile: true },
    { href: "/app/roads/map", label: "Map", icon: MapIcon, mobile: true },
    { href: "/app/roads/rules", label: "Rules", icon: SlidersHorizontal },
  ],
  restrooms: [
    { href: MODULES.restrooms.href, label: "Overview", icon: LayoutDashboard, exact: true, mobile: true, also: ["/app/restrooms/checks"] },
    { href: "/app/restrooms/compare", label: "Compare", icon: GitCompareArrows, mobile: true },
    { href: "/app/restrooms/match", label: "Match", icon: Search, mobile: true },
    { href: "/app/restrooms/ioai", label: "IOAI task", icon: BookOpen },
    { href: "/app/restrooms/rules", label: "Rules", icon: SlidersHorizontal },
  ],
};

/** Shared by both modules. */
export const PLATFORM_NAV: NavItem[] = [
  { href: "/app/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/app/model", label: "Model", icon: FlaskConical },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function isActive(pathname: string, item: Pick<NavItem, "href" | "exact" | "also">) {
  if (item.also?.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

/** Which module a path belongs to, or null for platform pages. */
export function moduleFromPath(pathname: string): ModuleId | null {
  if (pathname === MODULES.roads.href || pathname.startsWith(MODULES.roads.href + "/")) return "roads";
  if (pathname === MODULES.restrooms.href || pathname.startsWith(MODULES.restrooms.href + "/")) return "restrooms";
  return null;
}
