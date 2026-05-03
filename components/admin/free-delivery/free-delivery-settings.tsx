"use client"

import { useState } from "react"
import { Truck, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { FreeDeliveryAdminResponse, useUpdateFreeDeliveryCampaign } from "@/src/hooks/api/useFreeDelivery"

interface Props {
  adminData: FreeDeliveryAdminResponse
}

export function FreeDeliverySettings({ adminData }: Props) {
  const updateCampaignMutation = useUpdateFreeDeliveryCampaign()
  const [isActive, setIsActive] = useState(adminData.isActive)

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked)
    await updateCampaignMutation.mutateAsync({ isActive: checked })
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Global Settings</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {isActive ? "Active" : "Disabled"}
          </span>
          <Switch checked={isActive} onCheckedChange={handleToggle} disabled={updateCampaignMutation.isPending} />
        </div>
      </div>
    </div>
  )
}
