import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { getTransactions } from '@/services/finance'
import { getGoals } from '@/services/goals'
import { getTasks } from '@/services/tasks'
import { getContacts } from '@/services/contacts'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency } from '@/lib/format'
import { TrendingUp, Target, CheckSquare, Users } from 'lucide-react'

const COLORS = ['#d4a017', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6']
const TASK_COLORS = { todo: '#64748b', doing: '#f59e0b', done: '#10b981' }

export default function Results() {
  const [finance, setFinance] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])

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

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('finance', loadData)
  useRealtime('goals', loadData)
  useRealtime('tasks', loadData)
  useRealtime('contacts', loadData)

  const totalIncome = finance.filter((t) => t.type === 'income').reduce((a, b) => a + b.amount, 0)
  const totalExpense = finance.filter((t) => t.type === 'expense').reduce((a, b) => a + b.amount, 0)
  const completedGoals = goals.filter((g) => g.status === 'completed').length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const clientCount = contacts.filter((c) => c.type === 'client').length

  const monthlyData = useMemo(() => {
    const map: Record<string, any> = {}
    finance.forEach((f) => {
      const d = new Date(f.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { month: key, Receitas: 0, Despesas: 0 }
      if (f.type === 'income') map[key].Receitas += f.amount
      else map[key].Despesas += f.amount
    })
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
  }, [finance])

  const taskData = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, doing: 0, done: 0 }
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: name === 'todo' ? 'A Fazer' : name === 'doing' ? 'Fazendo' : 'Concluído',
      value,
      color: TASK_COLORS[name as keyof typeof TASK_COLORS],
    }))
  }, [tasks])

  const stats = [
    {
      label: 'Receita Total',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Despesa Total',
      value: formatCurrency(totalExpense),
      icon: TrendingUp,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Metas Concluídas',
      value: completedGoals,
      icon: Target,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Tarefas Concluídas',
      value: doneTasks,
      icon: CheckSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Clientes Ativos',
      value: clientCount,
      icon: Users,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resultados</h1>
        <p className="text-muted-foreground">Acompanhe a performance geral do seu negócio.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border gold-accent-border">
            <CardContent className="p-5">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} ${stat.color} mb-3`}>
                <stat.icon size={18} />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-xl font-bold text-foreground">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-border">
          <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
            <CardTitle className="text-lg text-foreground">Receitas vs Despesas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  Receitas: { color: 'hsl(141, 70%, 45%)' },
                  Despesas: { color: 'hsl(0, 72%, 60%)' },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94a3b8' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94a3b8' }}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="Receitas" fill="var(--color-Receitas)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesas" fill="var(--color-Despesas)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
            <CardTitle className="text-lg text-foreground">Distribuição de Tarefas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
