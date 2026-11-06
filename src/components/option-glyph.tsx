import {
  BarChart3,
  Briefcase,
  Code2,
  Compass,
  Cpu,
  Layers,
  Palette,
  PenTool,
  Rocket,
  Sigma,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { OptionIcon } from "@/lib/types";
import { cn } from "@/lib/utils";

const GLYPHS: Record<OptionIcon, LucideIcon> = {
  code: Code2,
  palette: Palette,
  wrench: Wrench,
  rocket: Rocket,
  users: Users,
  sigma: Sigma,
  compass: Compass,
  blocks: Layers,
  chart: BarChart3,
  pen: PenTool,
  cpu: Cpu,
  briefcase: Briefcase,
};

export function OptionGlyph({
  icon,
  className,
}: {
  icon: OptionIcon;
  className?: string;
}) {
  const Glyph = GLYPHS[icon] ?? Compass;
  return <Glyph className={cn("size-5", className)} aria-hidden="true" />;
}
