import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  bg: string
  subtitle?: string
}

export function StatCard({ title, value, icon: Icon, color, bg, subtitle }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-border gold-accent-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
