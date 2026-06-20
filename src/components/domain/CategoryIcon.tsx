import { icons, CircleDashed, type LucideProps } from "lucide-react"

// Convert a kebab-case icon name (as stored on categories) to lucide's
// PascalCase component key.
function toPascal(name: string): string {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("")
}

// Render a lucide icon by stored name, falling back to a neutral glyph.
export function CategoryIcon({ name, ...props }: { name?: string } & LucideProps) {
  if (!name) return <CircleDashed {...props} />
  const Cmp = icons[toPascal(name) as keyof typeof icons] ?? CircleDashed
  return <Cmp {...props} />
}

// All available icon names for the category editor (kebab-case).
export const ICON_NAMES: string[] = Object.keys(icons).map((pascal) =>
  pascal.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase(),
)
