import { AlertTriangle, CalendarClock } from 'lucide-react'
import type { FinanceRecord } from '@/lib/finance-utils'
import { isOverdue, isToday } from '@/lib/finance-utils'

interface OverdueAlertProps {
  records: FinanceRecord[]
}

export function OverdueAlert({ records }: OverdueAlertProps) {
  const overdue = records.filter((r) => r.status === 'pending' && isOverdue(r.date))
  const dueToday = records.filter((r) => r.status === 'pending' && isToday(r.date))

  if (overdue.length === 0 && dueToday.length === 0) return null

  return (
    <div className="space-y-2">
      {overdue.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-300">
              {overdue.length} {overdue.length === 1 ? 'item vencido' : 'itens vencidos'}
            </p>
            <p className="text-xs text-rose-400/80">
              Você possui contas a pagar/receber que já passaram do vencimento.
            </p>
          </div>
        </div>
      )}
      {dueToday.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 animate-fade-in">
          <CalendarClock className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {dueToday.length} {dueToday.length === 1 ? 'item vence hoje' : 'itens vencem hoje'}
            </p>
            <p className="text-xs text-amber-400/80">
              Atenção aos compromissos financeiros com vencimento no dia de hoje.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
