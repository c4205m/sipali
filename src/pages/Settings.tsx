import { useState } from "react"
import { Tabs } from "@/components/ui"
import { CurrencySettings } from "@/components/settings/CurrencySettings"
import { CategorySettings } from "@/components/settings/CategorySettings"
import { AccountSettings } from "@/components/settings/AccountSettings"
import { DataSettings } from "@/components/settings/DataSettings"

const TABS = [
  { value: "currency", label: "Currency" },
  { value: "categories", label: "Categories" },
  { value: "accounts", label: "Accounts" },
  { value: "data", label: "Data" },
]

export default function Settings() {
  const [tab, setTab] = useState("currency")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <Tabs items={TABS} value={tab} onValueChange={setTab} />
      <div className="pt-1">
        {tab === "currency" && <CurrencySettings />}
        {tab === "categories" && <CategorySettings />}
        {tab === "accounts" && <AccountSettings />}
        {tab === "data" && <DataSettings />}
      </div>
    </div>
  )
}
