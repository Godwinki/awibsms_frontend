"use client"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const defaultSettings = [
  { key: "entranceFee", label: "Entrance Fee", description: "Fee paid by every new member upon registration.", type: "number", currency: "TSH" },
  { key: "tshirtFee", label: "T-Shirt Fee", description: "T-shirt cost for new members.", type: "number", currency: "TSH" },
  { key: "idFee", label: "ID Fee", description: "ID card fee for new members.", type: "number", currency: "TSH" },
  { key: "formFee", label: "Form Fee", description: "Registration form fee.", type: "number", currency: "TSH" },
  { key: "passbookFee", label: "Passbook Fee", description: "Passbook fee for new members.", type: "number", currency: "TSH" },
  { key: "sharePrice", label: "Share Price", description: "Price per share for members.", type: "number", currency: "TSH" },
  { key: "minSharesRequired", label: "Minimum Shares Required", description: "Minimum number of shares a member must buy.", type: "number" },
  { key: "maxSharesAllowed", label: "Maximum Shares Allowed", description: "Maximum number of shares a member can hold.", type: "number" },
  { key: "minAge", label: "Minimum Age", description: "Minimum age required for membership.", type: "number" },
  { key: "documentRequirements", label: "Document Requirements", description: "Documents required for registration.", type: "documents" }
]

export default function MemberSettingsEditPage() {
  const [settings, setSettings] = useState(() => defaultSettings.map(s => ({ ...s, value: s.key === "documentRequirements" ? [] : "" })))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    Promise.all(
      defaultSettings.map(async s => {
        const res = await fetch(`/api/settings/${s.key}`)
        if (res.ok) {
          const data = await res.json()
          if (s.key === "documentRequirements") {
            return { ...s, value: data.setting?.value?.documents ?? [] }
          }
          return { ...s, value: data.setting?.value?.amount ?? data.setting?.value?.count ?? "" }
        }
        return { ...s, value: s.key === "documentRequirements" ? [] : "" }
      })
    ).then(setSettings).finally(() => setLoading(false))
  }, [])

  const handleChange = (idx: number, val: string | string[]) => {
    setSettings(prev => prev.map((s, i) => i === idx ? { ...s, value: val } : s))
  }

  const handleDocumentCheckbox = (idx: number, doc: string, checked: boolean) => {
    setSettings(prev => prev.map((s, i) => {
      if (i !== idx) return s
      let docs = Array.isArray(s.value) ? [...s.value] : []
      if (checked) {
        if (!docs.includes(doc)) docs.push(doc)
      } else {
        docs = docs.filter(d => d !== doc)
      }
      return { ...s, value: docs }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(settings.map(async (s) => {
        let value
        if (s.key === "minSharesRequired") value = { count: Number(s.value) }
        else if (s.key === "documentRequirements") value = { documents: s.value }
        else value = { amount: Number(s.value), currency: s.currency || "TSH" }
        const res = await fetch(`/api/settings/${s.key}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value, description: s.description })
        })
        if (!res.ok) throw new Error(`Failed to save ${s.label}`)
      }))
      toast({ title: "Settings saved!", description: "Member settings updated successfully.", variant: "default" })
      router.push("/dashboard/settings/member")
    } catch (e: any) {
      toast({ title: "Error saving settings", description: e.message, variant: "destructive" })
    }
    setSaving(false)
  }

  return (
    <div className="w-full px-0 md:px-8 py-8">
      <div className="mb-8 flex items-center gap-4">
        <div>
          <a href="/dashboard/settings/member">
            <button type="button" className="inline-flex items-center px-3 py-1 border rounded text-sm font-semibold border-primary text-primary hover:bg-primary/10">
              ← Back
            </button>
          </a>
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Member Management Settings</h2>
          <p className="text-muted-foreground text-lg mt-2">
            Update all member-related fees and requirements. All monetary values are in <span className="font-semibold">TSH</span>.
          </p>
        </div>
      </div>
      <Card className="w-full shadow-lg border-primary/10">
        <CardHeader className="bg-card/60 border-b rounded-t-xl p-6">
          <CardTitle className="text-2xl">Accounts & Fees</CardTitle>
          <CardDescription className="text-base">Entrance, t-shirt, ID, form, passbook fees, and share requirements.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={e => { e.preventDefault(); handleSave() }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.map((s, idx) => (
                <div key={s.key} className="space-y-1">
                  <Label htmlFor={s.key} className="font-semibold text-base">{s.label}</Label>
                  {s.type === "documents" ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(s.value) && s.value.includes("Letter")}
                          onChange={e => handleDocumentCheckbox(idx, "Letter", e.target.checked)}
                        />
                        <span>Letter</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Array.isArray(s.value) && s.value.includes("ID Copy")}
                          onChange={e => handleDocumentCheckbox(idx, "ID Copy", e.target.checked)}
                        />
                        <span>ID Copy</span>
                      </label>
                    </div>
                  ) : (
                    <Input
                      id={s.key}
                      type="number"
                      value={s.value}
                      min={0}
                      step={1}
                      onChange={e => handleChange(idx, e.target.value)}
                      placeholder={s.description}
                      required
                      className="text-lg"
                    />
                  )}
                  <div className="text-xs text-muted-foreground">{s.description}{s.currency ? ` (TSH)` : ""}</div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 left-0 w-full bg-card/90 border-t mt-8 pt-4 pb-2 flex justify-end z-10">
              <Button type="submit" className="px-8 py-2 text-base font-semibold" disabled={saving || loading}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
