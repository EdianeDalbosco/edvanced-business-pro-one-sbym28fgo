import { useEffect, useState, useMemo } from 'react'
import { DollarSign, TrendingDown, Scale, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { getTransactions } from '@/services/finance'
import { getGoals } from '@/services/goals'
import { getTasks } from '@/services/tasks'
import { getContacts } from '@/services/contacts'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  getCurrentMonthPaidIncome,
  getCurrentMonthPaidExpense,
  getPendingIncome,
  getPendingExpense,
  getPreviousMonthPaidIncome,
  getPreviousMonthPaidExpense,
  getActiveGoals,
  getPriorityTasks,
  getActiveOpportunities,
  calcTrend,
  calcProgress,
} from '@/lib/dashboard-utils'
import { StatCard } from '@/components/dashboard/stat-card'
import { PeriodChart } from '@/components/dashboard/period-chart'
import { PipelineMonitor } from '@/components/dashboard/pipeline-monitor'
import { GoalsTracker } from '@/components/dashboard/goals-tracker'
import { PriorityTasks } from '@/components/dashboard/priority-tasks'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'
import { useAuth } from '@/hooks/use-auth'
import { getTeamProductivity, getRecentTeamActivity } from '@/services/team-activity'
import { TeamProductivity } from '@/components/dashboard/team-productivity'
import { RecentTeamActivity } from '@/components/dashboard/recent-team-activity'

export default function Dashboard() {
  const { user } = useAuth()
  const [finance, setFinance] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [productivity, setProductivity] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [f, g, t, c] = await Promise.all([
        getTransactions(),
        getGoals(),
        getTasks(),
        getContacts(),
      ])
      setFinance(f)
      setGoals(g)
      setTasks(t)
      setContacts(c)
    } catch (e) {
      console.error(e)
    }
  }

  const loadTeamData = async () => {
    if (user?.role !== 'manager') return
    try {
      const [prod, act] = await Promise.all([getTeamProductivity(), getRecentTeamActivity()])
      setProductivity(prod)
      setActivity(act)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
    loadTeamData()
  }, [user?.role])
  useRealtime('finance', loadData)
  useRealtime('goals', loadData)
  useRealtime('tasks', () => {
    loadData()
    loadTeamData()
  })
  useRealtime('contacts', loadData)
  useRealtime('team_events', loadTeamData)

  const metrics = useMemo(() => {
    const paidIncome = getCurrentMonthPaidIncome(finance)
    const paidExpense = getCurrentMonthPaidExpense(finance)
    const prevIncome = getPreviousMonthPaidIncome(finance)
    const prevExpense = getPreviousMonthPaidExpense(finance)
    return {
      paidIncome,
      paidExpense,
      balance: paidIncome - paidExpense,
      pendingIncome: getPendingIncome(finance),
      pendingExpense: getPendingExpense(finance),
      prevIncome,
      prevExpense,
      incomeTrend: calcTrend(paidIncome, prevIncome),
      expenseTrend: calcTrend(paidExpense, prevExpense),
    }
  }, [finance])

  const myGoals = useMemo(() => goals.filter((g) => g.user_id === user?.id), [goals, user?.id])
  const myTasks = useMemo(() => tasks.filter((t) => t.user_id === user?.id), [tasks, user?.id])
  const activeGoals = useMemo(() => getActiveGoals(myGoals), [myGoals])
  const priorityTasks = useMemo(() => getPriorityTasks(myTasks), [myTasks])
  const opportunities = useMemo(() => getActiveOpportunities(contacts), [contacts])

  const handleExportPDF = () => {
    generatePDF(getBusinessName(), 'Painel de Controle', [
      {
        type: 'summary',
        title: 'Indicadores Financeiros',
        items: [
          { label: 'Faturamento do Mês', value: formatCurrency(metrics.paidIncome) },
          { label: 'Despesas', value: formatCurrency(metrics.paidExpense) },
          { label: 'Saldo', value: formatCurrency(metrics.balance) },
          { label: 'Contas a Receber', value: formatCurrency(metrics.pendingIncome) },
          { label: 'Contas a Pagar', value: formatCurrency(metrics.pendingExpense) },
        ],
      },
      {
        type: 'summary',
        title: 'Vendas em Andamento',
        items: [
          { label: 'Oportunidades Ativas', value: String(opportunities.length) },
          {
            label: 'Valor Total',
            value: formatCurrency(opportunities.reduce((s, o) => s + (Number(o.value) || 0), 0)),
          },
        ],
      },
      {
        type: 'table',
        title: 'Metas Principais',
        headers: ['Meta', 'Progresso', 'Atual', 'Alvo'],
        rows: activeGoals
          .slice(0, 5)
          .map((g) => [
            g.title,
            `${calcProgress(g.current_value || 0, g.target_value || 0)}%`,
            g.current_value || 0,
            g.target_value || 0,
          ]),
      },
    ])
  }

  const handleExportExcel = () => {
    exportToExcel('dashboard', [
      {
        name: 'Resumo Financeiro',
        headers: ['Indicador', 'Valor'],
        rows: [
          ['Faturamento do Mês', metrics.paidIncome],
          ['Despesas', metrics.paidExpense],
          ['Saldo', metrics.balance],
          ['Contas a Receber', metrics.pendingIncome],
          ['Contas a Pagar', metrics.pendingExpense],
        ],
      },
      {
        name: 'Oportunidades',
        headers: ['Nome', 'Etapa', 'Valor'],
        rows: opportunities.map((o) => [o.name, o.pipeline_stage || '', Number(o.value) || 0]),
      },
    ])
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Painel de Controle</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio em tempo real.</p>
        </div>
        <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Faturamento do Mês"
          value={formatCurrency(metrics.paidIncome)}
          icon={DollarSign}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
          subtitle={`Tendência: ${metrics.incomeTrend >= 0 ? '+' : ''}${metrics.incomeTrend}%`}
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(metrics.paidExpense)}
          icon={TrendingDown}
          color="text-rose-400"
          bg="bg-rose-500/10"
          subtitle={`Tendência: ${metrics.expenseTrend >= 0 ? '+' : ''}${metrics.expenseTrend}%`}
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(metrics.balance)}
          icon={Scale}
          color={metrics.balance >= 0 ? 'text-primary' : 'text-amber-400'}
          bg={metrics.balance >= 0 ? 'bg-primary/10' : 'bg-amber-500/10'}
        />
        <StatCard
          title="Contas a Receber"
          value={formatCurrency(metrics.pendingIncome)}
          icon={ArrowUpCircle}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          title="Contas a Pagar"
          value={formatCurrency(metrics.pendingExpense)}
          icon={ArrowDownCircle}
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <PeriodChart metrics={metrics} />
        <PipelineMonitor opportunities={opportunities} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GoalsTracker goals={activeGoals} />
        <PriorityTasks tasks={priorityTasks} />
      </div>

      {user?.role === 'manager' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TeamProductivity members={productivity} goals={goals} />
          <RecentTeamActivity activities={activity} />
        </div>
      )}
    </div>
  )
}
