"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SettingsService } from "@/lib/services/settings.service"

const defaultSystemSettings = [
  { key: "orgName", label: "Organization Name", description: "The name of your organization." },
  { key: "timezone", label: "System Timezone", description: "Default system timezone." },
  { key: "language", label: "Default Language", description: "Language used for the system UI." },
  { key: "dateFormat", label: "Date Format", description: "Format for displaying dates." },
  { key: "currency", label: "Currency", description: "Default currency code (e.g., TSH)." },
  { key: "supportEmail", label: "Support Email", description: "Contact email for system support." },
  { key: "maintenanceMode", label: "Maintenance Mode", description: "Enable or disable maintenance mode." },
  { key: "sessionTimeout", label: "Session Timeout (min)", description: "User session timeout in minutes." },
  { key: "welcomeMessage", label: "Welcome Message", description: "Custom welcome message for users." }
]

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState(() => defaultSystemSettings.map(s => ({ ...s, value: "" })))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all(
      defaultSystemSettings.map(async s => {
        const res = await fetch(`/api/settings/${s.key}?section=system`)
        if (res.ok) {
          const data = await res.json()
          return { ...s, value: data.setting?.value?.value ?? data.setting?.value ?? "" }
        }
        return { ...s, value: "" }
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
            <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
            <p className="text-muted-foreground text-lg mt-2">
              Configure organization-wide system preferences.
            </p>
          </div>
        </div>
      </div>
      <Card className="w-full shadow-lg border-primary/10">
        <CardHeader className="bg-card/60 border-b rounded-t-xl p-6">
          <CardTitle className="text-2xl">System Configuration</CardTitle>
          <CardDescription className="text-base">General system preferences and information.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.map((s) => (
              <div key={s.key} className="space-y-1">
                <div className="font-semibold text-base">{s.label}</div>
                <div className="text-lg">
                  {loading ? <span className="text-muted-foreground">Loading...</span> :
                    s.value !== "" ? (
                      <span>{String(s.value)}</span>
                    ) : <span className="text-muted-foreground">Not set</span>
                  }
                </div>
                <div className="text-muted-foreground text-sm">{s.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
