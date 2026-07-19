import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/format'

export function PipelineMonitor({ opportunities }: { opportunities: any[] }) {
  const totalValue = opportunities.reduce((sum, o) => sum + (Number(o.value) || 0), 0)
  const avgTicket = opportunities.length > 0 ? totalValue / opportunities.length : 0

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Vendas em Andamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Oportunidades Ativas</p>
            <h3 className="text-2xl font-bold text-foreground">{opportunities.length}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor Total Pipeline</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</h3>
          </div>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Ticket médio: {formatCurrency(avgTicket)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
