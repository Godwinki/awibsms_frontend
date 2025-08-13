"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const defaultSettings = [
  { key: "entranceFee", label: "Entrance Fee", description: "Fee paid by every new member upon registration.", currency: "TSH" },
  { key: "tshirtFee", label: "T-Shirt Fee", description: "T-shirt cost for new members.", currency: "TSH" },
  { key: "idFee", label: "ID Fee", description: "ID card fee for new members.", currency: "TSH" },
  { key: "formFee", label: "Form Fee", description: "Registration form fee.", currency: "TSH" },
  { key: "passbookFee", label: "Passbook Fee", description: "Passbook fee for new members.", currency: "TSH" },
  { key: "sharePrice", label: "Share Price", description: "Price per share for members.", currency: "TSH" },
  { key: "minSharesRequired", label: "Minimum Shares Required", description: "Minimum number of shares a member must buy." },
  { key: "maxSharesAllowed", label: "Maximum Shares Allowed", description: "Maximum number of shares a member can hold." },
  { key: "minAge", label: "Minimum Age", description: "Minimum age required for membership." },
  { key: "documentRequirements", label: "Document Requirements", description: "Documents required for registration." }
]

export default function MemberSettingsPage() {
  const [settings, setSettings] = useState(() => defaultSettings.map(s => ({ ...s, value: "" })))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all(
      defaultSettings.map(async s => {
        const res = await fetch(`/api/settings/${s.key}?section=member`)
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

  return (
    <div className="w-full px-0 md:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="font-semibold">
              ← Back
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Member Management Settings</h2>
            <p className="text-muted-foreground text-lg mt-2">
              Current configuration for all member-related fees and requirements. All monetary values are in <span className="font-semibold">TSH</span>.
            </p>
          </div>
        </div>
        <Link href="/dashboard/settings/member/edit">
          <Button variant="outline" className="font-semibold border-primary text-primary hover:bg-primary/10">
            Edit Settings
          </Button>
        </Link>
      </div>
      <Card className="w-full shadow-lg border-primary/10">
        <CardHeader className="bg-card/60 border-b rounded-t-xl p-6">
          <CardTitle className="text-2xl">Accounts & Fees</CardTitle>
          <CardDescription className="text-base">Entrance, t-shirt, ID, form, passbook fees, and share requirements.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.map((s) => (
              <div key={s.key} className="space-y-1">
                <div className="font-semibold text-base">{s.label}</div>
                <div className="text-lg">
                  {loading ? <span className="text-muted-foreground">Loading...</span> :
                    s.key === "documentRequirements" ? (
                      Array.isArray(s.value) && s.value.length > 0 ? (
                        <span>{s.value.join(", ")}</span>
                      ) : <span className="text-muted-foreground">None</span>
                    ) : (
                      s.value !== "" ? (
                        <span>{s.value} {s.currency ? <span className="text-xs font-medium">{s.currency}</span> : null}</span>
                      ) : <span className="text-muted-foreground">Not set</span>
                    )
                  }
                </div>
                <div className="text-xs text-muted-foreground">{s.description}{s.currency ? ` (TSH)` : ""}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
