import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { Package, FileText } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  expired: 'Expirado',
  terminated: 'Rescindido',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'border-emerald-500/30 text-emerald-500',
  draft: 'border-amber-500/30 text-amber-500',
  expired: 'border-rose-500/30 text-rose-500',
  terminated: 'border-muted-foreground/30 text-muted-foreground',
}

export function ClientContractsTab({ contracts }: { contracts: any[] }) {
  if (contracts.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhum contrato vinculado a este cliente.
      </p>
    )
  }
  return (
    <div className="space-y-3">
      {contracts.map((c) => (
        <Card key={c.id} className="border-border">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="font-medium text-foreground flex items-center gap-2 truncate">
                <FileText size={16} className="text-primary shrink-0" />
                <span className="truncate">{c.title}</span>
              </div>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
                {c.expand?.product_id?.name && (
                  <span className="inline-flex items-center gap-1">
                    <Package size={12} /> {c.expand.product_id.name}
                  </span>
                )}
                {c.start_date && `Início: ${formatDate(c.start_date)}`}
                {c.end_date && `Término: ${formatDate(c.end_date)}`}
              </div>
            </div>
            <div className="text-right space-y-1 shrink-0">
              <div className="font-semibold text-foreground">{formatCurrency(c.value || 0)}</div>
              <Badge variant="outline" className={STATUS_STYLES[c.status] || STATUS_STYLES.draft}>
                {STATUS_LABELS[c.status] || c.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
