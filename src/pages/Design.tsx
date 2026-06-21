import { useState } from "react"
import { Plus, Trash2, Search, Pencil, Heart } from "lucide-react"
import {
  Button,
  IconButton,
  Card,
  CardHeader,
  CardTitle,
  Accordion,
  CollapsibleCard,
  Badge,
  Chip,
  ChipGroup,
  SegmentedControl,
  Input,
  Field,
  NumberInput,
  Textarea,
  DatePicker,
  Switch,
  SwitchRow,
  Tabs,
  Tooltip,
  Popover,
  Modal,
  Drawer,
  Select,
  ListItem,
  IconBubble,
  EmptyState,
  CurrencyAmount,
  SwipeList,
  SwipeRow,
  Skeleton,
  ListSkeleton,
  useToast,
} from "@/components/ui"
import { todayISO } from "@/lib/dates"
import {
  TYPE_META,
  TYPE_OPTIONS,
  IMPORTANCE_OPTIONS,
  RECURRING_INTERVALS,
  type TransactionType,
} from "@/types"

// Dev-only showcase: every UI primitive, color token, font and type usage.
export default function Design() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Design system</h1>
        <p className="text-sm text-muted">
          Live preview of components, tokens, fonts and type usages.
        </p>
      </header>

      <Colors />
      <Typography />
      <Buttons />
      <Badges />
      <ChipsAndSegments />
      <Inputs />
      <SwitchesTabs />
      <Overlays />
      <ListsAndAmounts />
      <SwipeDemo />
      <AccordionDemo />
      <Skeletons />
      <TypeReference />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      {children}
    </section>
  )
}

// Static class strings so Tailwind's scanner emits them (no dynamic bg-${t}).
const TOKEN_SWATCHES: { name: string; cls: string }[] = [
  { name: "bg-deep", cls: "bg-bg-deep" },
  { name: "bg", cls: "bg-bg" },
  { name: "surface (glass)", cls: "bg-surface" },
  { name: "surface-2", cls: "bg-surface-2" },
  { name: "surface-3", cls: "bg-surface-3" },
  { name: "border", cls: "bg-border" },
  { name: "muted", cls: "bg-muted" },
  { name: "fg", cls: "bg-fg" },
  { name: "brand", cls: "bg-brand" },
]

function Colors() {
  return (
    <Section title="Colors — theme tokens">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TOKEN_SWATCHES.map((t) => (
          <div
            key={t.name}
            className="overflow-hidden rounded-xl border border-border bg-bg-deep"
          >
            <div className={`h-14 ${t.cls}`} />
            <div className="px-2 py-1.5 text-xs text-muted">{t.name}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        {TYPE_OPTIONS.map((o) => (
          <Swatch key={o.value} hex={TYPE_META[o.value].hex} label={o.label} />
        ))}
        {IMPORTANCE_OPTIONS.map((o) => (
          <Swatch key={o.value} hex={o.color} label={o.label} />
        ))}
      </div>
    </Section>
  )
}

function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-8 w-8 rounded-lg border border-border"
        style={{ backgroundColor: hex }}
      />
      <div className="text-xs">
        <div className="text-fg">{label}</div>
        <div className="font-mono text-muted">{hex}</div>
      </div>
    </div>
  )
}

function Typography() {
  return (
    <Section title="Typography">
      <Card className="space-y-2">
        <p className="text-2xl font-bold">Inter — Display 2xl bold</p>
        <p className="text-xl font-semibold">Inter — Heading xl semibold</p>
        <p className="text-base">Inter — Body base regular</p>
        <p className="text-sm text-muted">Inter — Small muted</p>
        <p className="font-mono text-sm">JetBrains Mono — 1,234.56 USD</p>
      </Card>
    </Section>
  )
}

function Buttons() {
  const { toast } = useToast()
  return (
    <Section title="Buttons">
      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">
          <Plus size={14} /> Small
        </Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <IconButton label="Add">
          <Plus size={18} />
        </IconButton>
        <IconButton label="Edit" variant="surface">
          <Pencil size={18} />
        </IconButton>
        <IconButton label="Delete" variant="danger">
          <Trash2 size={18} />
        </IconButton>
        <Button variant="secondary" onClick={() => toast("Saved!", "success")}>
          Trigger toast
        </Button>
        <Button variant="secondary" onClick={() => toast("Something failed", "error")}>
          Error toast
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast("Transaction deleted", "info", {
              action: { label: "Undo", onClick: () => toast("Restored", "success") },
            })
          }
        >
          Undo toast
        </Button>
      </div>
    </Section>
  )
}

function Badges() {
  return (
    <Section title="Badges">
      <div className="flex flex-wrap gap-2">
        <Badge>Neutral</Badge>
        <Badge tone="brand">Brand</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
        <Badge tone="info">Info</Badge>
        <Badge color="#a78bfa">Custom</Badge>
      </div>
    </Section>
  )
}

function ChipsAndSegments() {
  const [single, setSingle] = useState<TransactionType[]>(["expense"])
  const [multi, setMulti] = useState<string[]>(["need"])
  const [seg, setSeg] = useState("week")
  return (
    <Section title="Chips & segmented control">
      <div className="space-y-3">
        <ChipGroup
          options={TYPE_OPTIONS}
          value={single}
          onChange={setSingle}
        />
        <ChipGroup
          multi
          options={IMPORTANCE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
            color: o.color,
          }))}
          value={multi}
          onChange={setMulti}
        />
        <div className="flex flex-wrap gap-2">
          <Chip active>Active</Chip>
          <Chip>Inactive</Chip>
        </div>
        <SegmentedControl
          value={seg}
          onChange={setSeg}
          options={[
            { value: "today", label: "Today" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ]}
        />
      </div>
    </Section>
  )
}

function Inputs() {
  const [num, setNum] = useState<number | "">(42)
  const [date, setDate] = useState(todayISO())
  const [sel, setSel] = useState("USD")
  return (
    <Section title="Inputs">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Text input" hint="With a helper hint">
          <Input placeholder="Coffee" />
        </Field>
        <Field label="With leading icon">
          <Input leading={<Search size={16} />} placeholder="Search…" />
        </Field>
        <Field label="Number input">
          <NumberInput value={num} onValueChange={setNum} />
        </Field>
        <Field label="Date">
          <DatePicker value={date} onValueChange={setDate} />
        </Field>
        <Field label="Select">
          <Select
            value={sel}
            onValueChange={setSel}
            options={[
              { value: "USD", label: "US Dollar" },
              { value: "EUR", label: "Euro" },
              { value: "TRY", label: "Turkish Lira" },
            ]}
          />
        </Field>
        <Field label="Error state" error="This field is required">
          <Input className="border-red-500/60" placeholder="…" />
        </Field>
        <Field label="Textarea" className="sm:col-span-2">
          <Textarea rows={3} placeholder="Notes…" />
        </Field>
      </div>
    </Section>
  )
}

function SwitchesTabs() {
  const [on, setOn] = useState(true)
  const [tab, setTab] = useState("overview")
  return (
    <Section title="Switch & tabs">
      <Card className="space-y-4">
        <SwitchRow
          label="Convert on list"
          description="Show amounts in display currency"
          checked={on}
          onCheckedChange={setOn}
        />
        <div className="flex items-center gap-2">
          <Switch checked={on} onCheckedChange={setOn} />
          <span className="text-sm text-muted">{on ? "On" : "Off"}</span>
        </div>
        <Tabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: "overview", label: "Overview" },
            { value: "activity", label: "Activity" },
            { value: "settings", label: "Settings" },
          ]}
        />
        <p className="text-sm text-muted">Active tab: {tab}</p>
      </Card>
    </Section>
  )
}

function Overlays() {
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  return (
    <Section title="Overlays — modal, drawer, popover, tooltip">
      <p className="text-xs text-muted">
        On phones, Modal and Drawer both become bottom sheets (grab handle, swipe down or
        tap outside to dismiss). On desktop, Modal is centered and Drawer slides from the right.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setModal(true)}>
          Open modal
        </Button>
        <Button variant="secondary" onClick={() => setDrawer(true)}>
          Open drawer
        </Button>
        <Popover trigger={<Button variant="secondary">Open popover</Button>}>
          <div className="space-y-1">
            <button className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-3">
              Edit
            </button>
            <button className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-red-400 hover:bg-surface-3">
              Delete
            </button>
          </div>
        </Popover>
        <Tooltip content="Helpful hint">
          <Button variant="secondary">
            <Heart size={16} /> Hover me
          </Button>
        </Tooltip>
      </div>

      <Modal
        open={modal}
        onOpenChange={setModal}
        title="Example modal"
        description="A centered dialog with backdrop."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModal(false)}>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-muted">Modal body content goes here.</p>
      </Modal>

      <Drawer
        open={drawer}
        onOpenChange={setDrawer}
        title="Example drawer"
        footer={<Button onClick={() => setDrawer(false)}>Done</Button>}
      >
        <p className="text-sm text-muted">Slide-in panel for forms and filters.</p>
      </Drawer>
    </Section>
  )
}

function ListsAndAmounts() {
  return (
    <Section title="List items & amounts">
      <Card className="divide-y divide-border">
        <ListItem
          leading={<IconBubble color="#f87171">G</IconBubble>}
          title="Groceries"
          subtitle="Cash · Jun 20"
          trailing={<CurrencyAmount amount={42.5} currency="USD" type="expense" />}
        />
        <ListItem
          leading={<IconBubble color="#4ade80">S</IconBubble>}
          title="Salary"
          subtitle="Bank · Jun 1"
          trailing={<CurrencyAmount amount={3200} currency="USD" type="income" />}
        />
        <ListItem
          leading={<IconBubble color="#60a5fa">T</IconBubble>}
          title="Cash → Bank"
          subtitle="Transfer · Jun 5"
          trailing={<CurrencyAmount amount={500} currency="USD" type="transfer" />}
        />
      </Card>
      <EmptyState
        title="No transactions yet"
        description="Add your first transaction to get started."
        action={<Button size="sm">Add transaction</Button>}
      />
    </Section>
  )
}

function SwipeDemo() {
  const { toast } = useToast()
  const action = (label: string, bg: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="flex h-full w-[76px] flex-col items-center justify-center gap-1 text-xs font-medium text-white"
      style={{ background: bg }}
    >
      {label}
    </button>
  )
  return (
    <Section title="Swipe row — single-open, leading/trailing actions">
      <p className="text-xs text-muted">
        Swipe right for leading actions, left for trailing. Opening one closes the others.
        Tap a closed row for its action; tap an open row to close.
      </p>
      <SwipeList className="overflow-hidden rounded-xl border border-border">
        {["Groceries", "Salary", "Coffee"].map((name) => (
          <SwipeRow
            key={name}
            className="border-b border-border last:border-b-0"
            onTap={() => toast(`Tapped ${name}`, "info")}
            leading={action("Split", "#0ea5e9", () => toast("Split", "info"))}
            trailing={
              <>
                {action("Edit", "#6e7bf2", () => toast("Edit", "info"))}
                {action("Del", "#ef4444", () => toast("Removed", "info"))}
              </>
            }
          >
            <ListItem title={name} subtitle="Swipe me" />
          </SwipeRow>
        ))}
      </SwipeList>
    </Section>
  )
}

function AccordionDemo() {
  return (
    <Section title="Accordion — single-open collapsible cards">
      <p className="text-xs text-muted">
        Only one card open at a time. Optional action slot sits beside the toggle.
      </p>
      <Accordion defaultOpenId="acc-1">
        <CollapsibleCard id="acc-1" title="First section">
          <p className="text-sm text-muted">Body of the first section.</p>
        </CollapsibleCard>
        <CollapsibleCard
          id="acc-2"
          title="With action"
          action={<Button size="sm">Action</Button>}
        >
          <p className="text-sm text-muted">Body of the second section.</p>
        </CollapsibleCard>
      </Accordion>
    </Section>
  )
}

function Skeletons() {
  return (
    <Section title="Loading skeletons">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chart placeholder</CardTitle>
          </CardHeader>
          <Skeleton className="h-40 w-full rounded-xl" />
        </Card>
        <Card className="p-2">
          <ListSkeleton rows={4} />
        </Card>
      </div>
    </Section>
  )
}

function TypeReference() {
  return (
    <Section title="Type reference">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Transaction types</CardTitle>
          </CardHeader>
          <div className="space-y-1.5">
            {TYPE_OPTIONS.map((o) => (
              <div key={o.value} className="flex items-center justify-between text-sm">
                <span className={TYPE_META[o.value].textClass}>
                  {TYPE_META[o.value].sign} {o.label}
                </span>
                <span className="font-mono text-xs text-muted">{o.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Importance</CardTitle>
          </CardHeader>
          <div className="space-y-1.5">
            {IMPORTANCE_OPTIONS.map((o) => (
              <div key={o.value} className="flex items-center justify-between text-sm">
                <Badge color={o.color}>{o.label}</Badge>
                <span className="font-mono text-xs text-muted">{o.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recurring intervals</CardTitle>
          </CardHeader>
          <div className="space-y-1.5">
            {RECURRING_INTERVALS.map((o) => (
              <div key={o.value} className="flex items-center justify-between text-sm">
                <span className="text-fg">{o.label}</span>
                <span className="font-mono text-xs text-muted">{o.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  )
}
