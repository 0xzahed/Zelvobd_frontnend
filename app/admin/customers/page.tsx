"use client"

import { useState } from "react"
import { Users } from "lucide-react"
import {
  AdminEmptyState,
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSearchInput,
  AdminToolbar,
} from "@/components/admin/admin-ui"

type Customer = {
  id: string
  name: string
  address: string
  mobile: string
  totalOrders: number
}

export default function CustomersPage() {
  const [customers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")

  const filtered = customers.filter((c) =>
    [c.name, c.address, c.mobile].join(" ").toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <AdminPage>
      <AdminPageHeader
        title="Customers"
        description="View and manage customer records"
        count={`${customers.length} total`}
        actions={
          <AdminToolbar className="md:w-72">
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search name, phone, address..."
            />
          </AdminToolbar>
        }
      />

      <AdminPanel>
        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={Users}
            title="No customers yet"
            description="Customer data will appear here once the API is connected."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Mobile</th>
                  <th className="px-5 py-3 font-medium">Address</th>
                  <th className="px-5 py-3 font-medium text-right">Orders</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30 last:border-b-0"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{c.name}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.mobile}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{c.address}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-foreground">
                      {c.totalOrders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminPage>
  )
}
