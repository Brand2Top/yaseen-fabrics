'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Package, Users, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// KPI Card Component
function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  index,
}: {
  title: string
  value: string
  trend: string
  icon: React.ComponentType<{ size: number; className?: string }>
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-white border-zinc-200 hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-zinc-600">{title}</CardTitle>
          <Icon size={20} className="text-rose-900" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-900 mb-2">{value}</div>
          <p className="text-sm font-medium text-green-700">{trend}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Sample data
const kpiData = [
  {
    title: 'Total Revenue',
    value: 'Rs 2,450,000',
    trend: '+12.5% from last month',
    icon: TrendingUp,
  },
  {
    title: 'Active Orders',
    value: '127',
    trend: '+8.2% from last month',
    icon: Package,
  },
  {
    title: 'Total Products',
    value: '342',
    trend: '+5.1% from last month',
    icon: Package,
  },
  {
    title: 'New Customers',
    value: '89',
    trend: '+15.3% from last month',
    icon: Users,
  },
]

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Muhammad Ali',
    date: '2024-05-01',
    status: 'Processing',
    amount: 'Rs 12,500',
  },
  {
    id: 'ORD-002',
    customer: 'Hassan Khan',
    date: '2024-04-30',
    status: 'Shipped',
    amount: 'Rs 8,900',
  },
  {
    id: 'ORD-003',
    customer: 'Fatima Ahmed',
    date: '2024-04-29',
    status: 'Pending',
    amount: 'Rs 15,200',
  },
  {
    id: 'ORD-004',
    customer: 'Bilal Hassan',
    date: '2024-04-28',
    status: 'Processing',
    amount: 'Rs 6,800',
  },
  {
    id: 'ORD-005',
    customer: 'Sara Malik',
    date: '2024-04-27',
    status: 'Delivered',
    amount: 'Rs 11,300',
  },
]

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-green-100 text-green-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-2">Welcome back, Admin. Here&apos;s your business overview.</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            icon={kpi.icon}
            index={index}
          />
        ))}
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-white border-zinc-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" className="text-rose-900 hover:bg-rose-50">
              View All Orders
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-zinc-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 border-zinc-200 hover:bg-zinc-50">
                    <TableHead className="text-zinc-600 font-semibold">Order ID</TableHead>
                    <TableHead className="text-zinc-600 font-semibold">Customer</TableHead>
                    <TableHead className="text-zinc-600 font-semibold">Date</TableHead>
                    <TableHead className="text-zinc-600 font-semibold">Status</TableHead>
                    <TableHead className="text-right text-zinc-600 font-semibold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order, index) => (
                    <TableRow
                      key={order.id}
                      className="border-zinc-200 hover:bg-zinc-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium text-zinc-900">{order.id}</TableCell>
                      <TableCell className="text-zinc-700">{order.customer}</TableCell>
                      <TableCell className="text-zinc-600 text-sm">{order.date}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            statusColors[order.status as keyof typeof statusColors]
                          } border-0`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-zinc-900">
                        {order.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
