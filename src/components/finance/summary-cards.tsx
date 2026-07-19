import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, Wallet } from 'lucide-react'

interface SummaryCardsProps {
  monthlyIncome: number
  monthlyExpense: number
  totalBalance: number
  monthlyResult: number
  projectedBalance: number
}

export function SummaryCards({
  monthlyIncome,
  monthlyExpense,
  totalBalance,
  monthlyResult,
  projectedBalance,
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'Faturamento Mensal',
      value: formatCurrency(monthlyIncome),
      icon: ArrowUpCircle,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
    },
    {
      label: 'Despesas',
      value: formatCurrency(monthlyExpense),
      icon: ArrowDownCircle,
      bg: 'bg-rose-500/10',
      color: 'text-rose-400',
    },
    {
      label: 'Saldo',
      value: formatCurrency(totalBalance),
      icon: Wallet,
      bg: totalBalance >= 0 ? 'bg-primary/10' : 'bg-amber-500/10',
      color: totalBalance >= 0 ? 'text-primary' : 'text-amber-400',
    },
    {
      label: 'Resultado do Mês',
      value: formatCurrency(monthlyResult),
      icon: TrendingUp,
      bg: monthlyResult >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      color: monthlyResult >= 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      label: 'Saldo Previsto',
      value: formatCurrency(projectedBalance),
      icon: DollarSign,
      bg: projectedBalance >= 0 ? 'bg-primary/10' : 'bg-amber-500/10',
      color: projectedBalance >= 0 ? 'text-primary' : 'text-amber-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border gold-accent-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">{card.label}</p>
              <h3 className="text-lg font-bold text-foreground">{card.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
