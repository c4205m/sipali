import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  CollapsibleCard,
  Button,
  IconButton,
  Drawer,
  Field,
  Input,
  SegmentedControl,
  ListItem,
  IconBubble,
  Badge,
} from "@/components/ui"
import { useToast } from "@/components/ui/Toast"
import { CategoryIcon, ICON_NAMES } from "@/components/domain/CategoryIcon"
import { cn } from "@/lib/cn"
import {
  useCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/hooks/useCategories"
import type { Category } from "@/types"

type CatType = "expense" | "income" | "both"

export function CategorySettings() {
  const categories = useCategories() ?? []
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <CollapsibleCard
      id="categories"
      title="Categories"
      action={
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={14} /> Add
        </Button>
      }
    >
      <CategoryGroup
        label="Expense"
        items={categories.filter((c) => c.categoryType !== "income")}
        onEdit={setEditing}
      />
      <CategoryGroup
        label="Income"
        items={categories.filter((c) => c.categoryType !== "expense")}
        onEdit={setEditing}
      />

      <CategoryDrawer
        open={creating}
        onClose={() => setCreating(false)}
      />
      <CategoryDrawer
        open={!!editing}
        existing={editing ?? undefined}
        onClose={() => setEditing(null)}
      />
    </CollapsibleCard>
  )
}

function CategoryGroup({
  label,
  items,
  onEdit,
}: {
  label: string
  items: Category[]
  onEdit: (c: Category) => void
}) {
  return (
    <div className="mt-2">
      <p className="px-1 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="px-1 pb-2 text-xs text-muted">No categories.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((c) => (
            <ListItem
              key={c.id}
              leading={
                <IconBubble color={c.color}>
                  <CategoryIcon name={c.icon} size={16} />
                </IconBubble>
              }
              title={
                <span className="flex items-center gap-2">
                  {c.name}
                  {!c.categoryType && <Badge>both</Badge>}
                </span>
              }
              trailing={
                <IconButton label="Edit" size="sm" onClick={() => onEdit(c)}>
                  <Pencil size={15} />
                </IconButton>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryDrawer({
  open,
  existing,
  onClose,
}: {
  open: boolean
  existing?: Category
  onClose: () => void
}) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [color, setColor] = useState("#6e7bf2")
  const [icon, setIcon] = useState("circle-dashed")
  const [type, setType] = useState<CatType>("both")

  // Sync local state when the target category changes.
  const key = existing?.id ?? "new"
  const [lastKey, setLastKey] = useState<string | null>(null)
  if (open && lastKey !== key) {
    setLastKey(key)
    setName(existing?.name ?? "")
    setColor(existing?.color ?? "#6e7bf2")
    setIcon(existing?.icon ?? "circle-dashed")
    setType((existing?.categoryType as CatType) ?? "both")
  }

  async function save() {
    if (!name.trim()) return toast("Name is required", "error")
    const categoryType = type === "both" ? undefined : type
    if (existing) {
      await updateCategory(existing.id, { name: name.trim(), color, icon, categoryType })
      toast("Category updated", "success")
    } else {
      await addCategory({ name: name.trim(), color, icon, categoryType })
      toast("Category added", "success")
    }
    setLastKey(null)
    onClose()
  }

  async function remove() {
    if (!existing) return
    await deleteCategory(existing.id)
    toast("Category deleted", "success")
    setLastKey(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setLastKey(null)
          onClose()
        }
      }}
      title={existing ? "Edit category" : "New category"}
      footer={
        <>
          {existing && (
            <Button variant="danger" onClick={remove}>
              <Trash2 size={14} /> Delete
            </Button>
          )}
          <Button onClick={save}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <IconBubble color={color}>
            <CategoryIcon name={icon} size={18} />
          </IconBubble>
          <Badge color={color}>{name || "Preview"}</Badge>
        </div>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Groceries" />
        </Field>
        <Field label="Color">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-xl border border-border bg-surface-2"
          />
        </Field>
        <Field label="Icon">
          <div className="grid max-h-44 grid-cols-6 gap-2 overflow-y-auto rounded-xl border border-border bg-surface-2 p-2">
            {ICON_NAMES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIcon(n)}
                aria-label={n}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg transition-colors",
                  icon === n ? "bg-brand text-brand-fg" : "text-muted hover:bg-surface-3 hover:text-fg",
                )}
              >
                <CategoryIcon name={n} size={18} />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Used for">
          <SegmentedControl
            className="w-full"
            value={type}
            onChange={setType}
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
              { value: "both", label: "Both" },
            ]}
          />
        </Field>
      </div>
    </Drawer>
  )
}
