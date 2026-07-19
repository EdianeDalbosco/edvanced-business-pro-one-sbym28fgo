import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getTransactions, createTransaction, deleteTransaction } from '@/services/finance'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/format'
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, FileText, Building2 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

const COLORS = ['#d4a017', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4']
const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

export default function Finance() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  const loadData = async () => setTransactions(await getTransactions())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('finance', loadData)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData)
      await createTransaction({
        ...data,
        amount: Number(data.amount),
        date: new Date(data.date as string).toISOString(),
        issue_date: data.issue_date ? new Date(data.issue_date as string).toISOString() : '',
      })
      setDialogOpen(false)
      toast({ title: 'Transação registrada com sucesso!' })
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir transação?')) {
      await deleteTransaction(id)
      toast({ title: 'Excluída' })
    }
  }

  const expenseData = useMemo(() => {
    const map: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((a, b) => a + b.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((a, b) => a + b.amount, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input name="description" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" step="0.01" name="amount" required />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" name="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select name="type" className={selectClass}>
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" className={selectClass}>
                    <option value="paid">Pago/Recebido</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input name="category" placeholder="ex: Software, Consultoria" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data emissão documento/NF</Label>
                  <Input
                    type="date"
                    name="issue_date"
                    className={cn(fieldErrors.issue_date && 'border-rose-500')}
                  />
                  {fieldErrors.issue_date && (
                    <p className="text-sm text-rose-500">{fieldErrors.issue_date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Número documento/NF</Label>
                  <Input
                    name="document_number"
                    placeholder="ex: NF-00123"
                    className={cn(fieldErrors.document_number && 'border-rose-500')}
                  />
                  {fieldErrors.document_number && (
                    <p className="text-sm text-rose-500">{fieldErrors.document_number}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Centro de Custo</Label>
                <Input
                  name="cost_center"
                  placeholder="ex: Administrativo, Operacional"
                  className={cn(fieldErrors.cost_center && 'border-rose-500')}
                />
                {fieldErrors.cost_center && (
                  <p className="text-sm text-rose-500">{fieldErrors.cost_center}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Receitas',
            value: formatCurrency(totalIncome),
            icon: ArrowUpCircle,
            bg: 'bg-emerald-500/10',
            color: 'text-emerald-400',
          },
          {
            label: 'Total Despesas',
            value: formatCurrency(totalExpense),
            icon: ArrowDownCircle,
            bg: 'bg-rose-500/10',
            color: 'text-rose-400',
          },
          {
            label: 'Saldo Geral',
            value: formatCurrency(totalIncome - totalExpense),
            icon: DollarIcon,
            bg: totalIncome - totalExpense >= 0 ? 'bg-primary/10' : 'bg-amber-500/10',
            color: totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-amber-400',
          },
        ].map((card) => (
          <Card key={card.label} className="border-border gold-accent-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
            <CardTitle className="text-lg text-foreground">Transações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/30">
                  <TableHead className="w-[100px] text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">Descrição</TableHead>
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground">Doc/NF</TableHead>
                  <TableHead className="text-muted-foreground">Centro de Custo</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        {formatDate(tx.date)}
                      </TableCell>
                      <TableCell className="text-foreground">{tx.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {tx.category}
                        </Badge>
                      </TableCell>
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
                        <Badge
                          variant={tx.status === 'paid' ? 'default' : 'secondary'}
                          className={
                            tx.status === 'paid' ? 'bg-primary text-primary-foreground' : ''
                          }
                        >
                          {tx.status === 'paid' ? 'Efetivado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tx.id)}
                          className="text-muted-foreground hover:text-rose-400"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
            <CardTitle className="text-lg text-foreground">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              {expenseData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Sem dados.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {expenseData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        background: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(214, 32%, 91%)',
                        borderRadius: '8px',
                        color: 'hsl(222, 47%, 11%)',
                      }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(215, 16%, 47%)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DollarIcon({ size }: { size: number }) {
  return <span style={{ fontSize: size * 0.7, fontWeight: 700 }}>R$</span>
}
