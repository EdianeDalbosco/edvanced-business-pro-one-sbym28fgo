import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Target, CheckSquare, Users } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { getTransactions } from '@/services/finance'
import { getGoals } from '@/services/goals'
import { getTasks } from '@/services/tasks'
import { getContacts } from '@/services/contacts'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, isToday, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Dashboard() {
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

  const currentMonthSaldo = useMemo(() => {
    const today = new Date()
    return finance
      .filter((f) => {
        const d = new Date(f.date)
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
      })
      .reduce((acc, curr) => (curr.type === 'income' ? acc + curr.amount : acc - curr.amount), 0)
  }, [finance])

  const activeGoals = goals.filter((g) => g.status === 'in_progress').length
  const tasksToday = tasks.filter((t) => t.status !== 'done' && isToday(t.due_date)).length
  const newLeads = contacts.filter((c) => {
    if (c.type !== 'prospect') return false
    const diffDays = (new Date().getTime() - new Date(c.created).getTime()) / (1000 * 3600 * 24)
    return diffDays <= 7
  }).length

  const chartData = useMemo(() => {
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMonthSaldo)}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas para Hoje</CardTitle>
            <CheckSquare className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksToday}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads (7d)</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newLeads}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visão Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  Receitas: { color: 'hsl(141, 84%, 39%)' },
                  Despesas: { color: 'hsl(346, 87%, 60%)' },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-Receitas)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-Receitas)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-Despesas)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-Despesas)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b' }}
                      tickFormatter={(val) => `R$ ${val / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="Receitas"
                      stroke="var(--color-Receitas)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRec)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Despesas"
                      stroke="var(--color-Despesas)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Metas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals
              .filter((g) => g.status === 'in_progress')
              .slice(0, 3)
              .map((goal) => {
                const progress = goal.target_value
                  ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
                  : 0
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate mr-2">{goal.title}</span>
                      <span className="text-slate-500">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            {goals.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma meta ativa.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
