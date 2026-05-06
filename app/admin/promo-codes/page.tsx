'use client'

import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function PromoCodesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Promo Codes</h1>
        <p className="text-zinc-600 mt-2">Create and manage promotional campaigns and discount codes.</p>
      </div>

      <Card className="bg-white border-zinc-200">
        <CardHeader>
          <CardTitle>Promo Codes Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600">Promo codes management interface coming soon...</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
