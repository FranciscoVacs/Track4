'use client'

import { useState } from 'react'
import { TopNav } from '@/components/top-nav'
import { HeroKpis } from '@/components/hero-kpis'
import { InspectionPanel } from '@/components/inspection-panel'
import { CategoriesRail } from '@/components/categories-rail'
import { RosterGrid } from '@/components/roster-grid'
import { ReviewDrawer } from '@/components/review-drawer'
import { StatusStrip } from '@/components/status-strip'
import type { RosterItem } from '@/lib/types'

export default function Page() {
  const [selected, setSelected] = useState<RosterItem | null>(null)

  return (
    <main className="min-h-screen flex flex-col bg-[var(--lv-light-bg)]">
      <TopNav />
      <HeroKpis />

      <section className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InspectionPanel />
          </div>
          <div className="lg:col-span-1">
            <CategoriesRail />
          </div>
        </div>
      </section>

      <RosterGrid onSelect={setSelected} />

      <ReviewDrawer item={selected} onClose={() => setSelected(null)} />

      <StatusStrip />
    </main>
  )
}
