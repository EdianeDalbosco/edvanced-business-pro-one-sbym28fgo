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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { getTransactions, createTransaction, deleteTransaction } from '@/services/finance'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/format'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import {
  type FinanceRecord,
  type TxTabKey,
  getMonthlyIncome,
  getMonthlyExpense,
  getTotalBalance,
  getProjectedBalance,
  filterByTab,
  buildCashFlow,
} from '@/lib/finance-utils'
import { SummaryCards } from '@/components/finance/summary-cards'
import { OverdueAlert } from '@/components/finance/overdue-alert'
import { TransactionTabs } from '@/components/finance/transaction-tabs'
import { CashFlowChart } from '@/components/finance/cash-flow-chart'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

export default function Finance() {
  const [transactions, setTransactions] = useState<FinanceRecord[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TxTabKey>('income')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  const loadData = async () => setTransactions((await getTransactions()) as FinanceRecord[])
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

  const monthlyIncome = useMemo(() => getMonthlyIncome(transactions), [transactions])
  const monthlyExpense = useMemo(() => getMonthlyExpense(transactions), [transactions])
  const totalBalance = useMemo(() => getTotalBalance(transactions), [transactions])
  const monthlyResult = monthlyIncome - monthlyExpense
  const projectedBalance = useMemo(() => getProjectedBalance(transactions), [transactions])
  const cashFlowData = useMemo(() => buildCashFlow(transactions), [transactions])

  const tabRecords = useMemo(() => filterByTab(transactions, activeTab), [transactions, activeTab])

  const pendingRecords = useMemo(
    () => transactions.filter((t) => t.status === 'pending'),
    [transactions],
  )

  const handleExportPDF = () => {
    const tabLabel =
      activeTab === 'income'
        ? 'Entradas'
        : activeTab === 'expense'
          ? 'Saídas'
          : activeTab === 'payable'
            ? 'Contas a Pagar'
            : 'Contas a Receber'
    generatePDF(getBusinessName(), `Financeiro - ${tabLabel}`, [
      {
        type: 'summary',
        title: 'Resumo Financeiro',
        items: [
          { label: 'Faturamento Mensal', value: formatCurrency(monthlyIncome) },
          { label: 'Despesas', value: formatCurrency(monthlyExpense) },
          { label: 'Saldo Total', value: formatCurrency(totalBalance) },
          { label: 'Resultado do Mês', value: formatCurrency(monthlyResult) },
          { label: 'Saldo Previsto', value: formatCurrency(projectedBalance) },
        ],
      },
      {
        type: 'table',
        title: tabLabel,
        headers: ['Data', 'Descrição', 'Categoria', 'Classificação', 'Valor', 'Status'],
        rows: tabRecords.map((t) => [
          formatDate(t.date),
          t.description,
          t.category || '',
          t.expense_classification === 'fixed'
            ? 'Fixa'
            : t.expense_classification === 'variable'
              ? 'Variável'
              : '',
          t.amount,
          t.status === 'paid' ? 'Pago' : 'Pendente',
        ]),
      },
    ])
  }

  const handleExportExcel = () => {
    exportToExcel(`financeiro-${activeTab}`, [
      {
        name: 'Transações',
        headers: [
          'Data',
          'Descrição',
          'Valor',
          'Tipo',
          'Categoria',
          'Status',
          'Classificação',
          'Centro de Custo',
          'Documento',
        ],
        rows: tabRecords.map((t) => [
          formatDate(t.date),
          t.description,
          t.amount,
          t.type === 'income' ? 'Receita' : 'Despesa',
          t.category || '',
          t.status === 'paid' ? 'Pago' : 'Pendente',
          t.expense_classification === 'fixed'
            ? 'Fixa'
            : t.expense_classification === 'variable'
              ? 'Variável'
              : '',
          t.cost_center || '',
          t.document_number || '',
        ]),
      },
    ])
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie receitas, despesas, contas a pagar e receber.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input name="category" placeholder="ex: Software, Consultoria" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Classificação da Despesa</Label>
                    <select name="expense_classification" className={selectClass}>
                      <option value="">Não se aplica</option>
                      <option value="fixed">Fixa</option>
                      <option value="variable">Variável</option>
                    </select>
                  </div>
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
      </div>

      <OverdueAlert records={pendingRecords} />

      <SummaryCards
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        totalBalance={totalBalance}
        monthlyResult={monthlyResult}
        projectedBalance={projectedBalance}
      />

      <CashFlowChart data={cashFlowData} />

      <Card className="border-border">
        <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
          <CardTitle className="text-lg text-foreground">Transações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TxTabKey)}
            className="w-full"
          >
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
                <TabsTrigger value="income">Entradas</TabsTrigger>
                <TabsTrigger value="expense">Saídas</TabsTrigger>
                <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
                <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="mt-0">
              <TransactionTabs tab={activeTab} records={tabRecords} onDelete={handleDelete} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
