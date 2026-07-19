import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/format'
import { isOverdue, isToday } from '@/lib/finance-utils'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

export function ClientPaymentsTab({ payments }: { payments: any[] }) {
  if (payments.length === 0) {
    return (
      <p className="text-center py-8 text-muted-foreground">
        Nenhum pagamento registrado para este cliente.
      </p>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-muted/30">
          <TableHead className="text-muted-foreground">Data</TableHead>
          <TableHead className="text-muted-foreground">Descrição</TableHead>
          <TableHead className="text-muted-foreground">Status</TableHead>
          <TableHead className="text-muted-foreground">Alerta</TableHead>
          <TableHead className="text-right text-muted-foreground">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((tx) => {
          const overdue = tx.status === 'pending' && isOverdue(tx.date)
          const today = tx.status === 'pending' && isToday(tx.date)
          return (
            <TableRow key={tx.id} className="border-border">
              <TableCell className="font-medium text-foreground">{formatDate(tx.date)}</TableCell>
              <TableCell className="text-foreground">{tx.description}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    tx.status === 'paid'
                      ? 'border-emerald-500/30 text-emerald-500'
                      : 'border-amber-500/30 text-amber-500',
                  )}
                >
                  {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                </Badge>
              </TableCell>
              <TableCell>
                {overdue && (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-400">
                    <AlertTriangle size={12} /> Vencido
                  </span>
                )}
                {today && !overdue && <span className="text-xs text-amber-400">Vence hoje</span>}
                {!overdue && !today && <span className="text-muted-foreground/40">—</span>}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-medium',
                  tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400',
                )}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
