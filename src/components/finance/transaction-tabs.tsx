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
import { Trash2, FileText, Building2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { FinanceRecord, TxTabKey } from '@/lib/finance-utils'
import { isOverdue, isToday } from '@/lib/finance-utils'

interface TransactionTabsProps {
  tab: TxTabKey
  records: FinanceRecord[]
  onDelete: (id: string) => void
}

const TAB_LABELS: Record<TxTabKey, string> = {
  income: 'Entradas',
  expense: 'Saídas',
  payable: 'Contas a Pagar',
  receivable: 'Contas a Receber',
}

export function TransactionTabs({ tab, records, onDelete }: TransactionTabsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/30">
            <TableHead className="text-muted-foreground">Data</TableHead>
            <TableHead className="text-muted-foreground">Descrição</TableHead>
            <TableHead className="text-muted-foreground">Categoria</TableHead>
            {(tab === 'expense' || tab === 'payable') && (
              <TableHead className="text-muted-foreground">Classificação</TableHead>
            )}
            <TableHead className="text-muted-foreground">Doc/NF</TableHead>
            <TableHead className="text-muted-foreground">Centro de Custo</TableHead>
            <TableHead className="text-muted-foreground">Alerta</TableHead>
            <TableHead className="text-right text-muted-foreground">Valor</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Nenhum registro em {TAB_LABELS[tab]}.
              </TableCell>
            </TableRow>
          ) : (
            records.map((tx) => {
              const overdue = tx.status === 'pending' && isOverdue(tx.date)
              const today = tx.status === 'pending' && isToday(tx.date)
              return (
                <TableRow key={tx.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="text-foreground">{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      {tx.category || '—'}
                    </Badge>
                  </TableCell>
                  {(tab === 'expense' || tab === 'payable') && (
                    <TableCell>
                      {tx.expense_classification ? (
                        <Badge
                          variant="secondary"
                          className={cn(
                            tx.expense_classification === 'fixed'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                          )}
                        >
                          {tx.expense_classification === 'fixed' ? 'Fixa' : 'Variável'}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.document_number ? (
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {tx.document_number}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.cost_center ? (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {tx.cost_center}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {overdue && (
                      <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">
                        Vencido
                      </Badge>
                    )}
                    {today && !overdue && (
                      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">
                        Vence Hoje
                      </Badge>
                    )}
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(tx.id)}
                      className="text-muted-foreground hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
