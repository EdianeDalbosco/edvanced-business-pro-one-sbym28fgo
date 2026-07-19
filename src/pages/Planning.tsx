import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, ListChecks } from 'lucide-react'
import { getPlanning } from '@/services/planning'
import { getGoals, deleteGoal } from '@/services/goals'
import { getTasks } from '@/services/tasks'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { StrategicContext } from '@/components/strategic-context'
import { GoalForm } from '@/components/goal-form'
import { GoalCard } from '@/components/goal-card'
import { GoalDetailDialog } from '@/components/goal-detail-dialog'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'
import { formatDate } from '@/lib/format'
import {
  GOAL_STATUS_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_PRIORITY_LABELS,
  MONTH_OPTIONS,
  getMonthLabel,
  getGoalProgress,
} from '@/lib/goal-utils'

type ViewTab = 'annual' | 'monthly' | 'objective' | 'status' | 'priority' | 'action_plan'
const STATUS_ORDER = [
  'nao_iniciada',
  'em_andamento',
  'em_risco',
  'concluida',
  'nao_alcancada',
  'cancelada',
]

export default function Planning() {
  const [planning, setPlanning] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [view, setView] = useState<ViewTab>('annual')
  const [monthFilter, setMonthFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any | null>(null)
  const [detailGoal, setDetailGoal] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    const [p, g, t] = await Promise.all([getPlanning(), getGoals(), getTasks()])
    setPlanning(p || { mission: '', vision: '', values: '', strategy: '', priorities: '' })
    setGoals(g)
    setTasks(t)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('goals', loadData)
  useRealtime('tasks', loadData)
  useRealtime('business_planning', loadData)

  const taskCountByGoal = useMemo(() => {
    const m: Record<string, number> = {}
    tasks.forEach((t) => {
      if (t.goal_id) m[t.goal_id] = (m[t.goal_id] || 0) + 1
    })
    return m
  }, [tasks])

  const objectiveGroups = useMemo(() => {
    const g: Record<string, any[]> = {}
    goals.forEach((goal) => {
      const k = goal.related_objective || 'Sem Objetivo'
      ;(g[k] ||= []).push(goal)
    })
    return g
  }, [goals])

  const handleNew = () => {
    setEditingGoal(null)
    setFormOpen(true)
  }
  const handleEdit = (g: any) => {
    setDetailOpen(false)
    setEditingGoal(g)
    setFormOpen(true)
  }
  const handleDelete = async (id: string) => {
    try {
      await deleteGoal(id)
      setDetailOpen(false)
      toast({ title: 'Meta excluída' })
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }
  const handleCardClick = (g: any) => {
    setDetailGoal(g)
    setDetailOpen(true)
  }

  const handleExportPDF = () => {
    const sections: any[] = []
    if (planning) {
      sections.push({
        type: 'summary',
        title: 'Canvas Estratégico',
        items: [
          { label: 'Missão', value: planning.mission || '' },
          { label: 'Visão', value: planning.vision || '' },
          { label: 'Valores', value: planning.values || '' },
          { label: 'Estratégia', value: planning.strategy || '' },
          { label: 'Prioridades', value: planning.priorities || '' },
        ],
      })
    }
    sections.push({
      type: 'table',
      title: 'Metas',
      headers: ['Título', 'Objetivo', 'Status', 'Prioridade', 'Progresso', 'Prazo'],
      rows: goals.map((g) => [
        g.title,
        g.related_objective || '',
        GOAL_STATUS_LABELS[g.status] || '',
        GOAL_PRIORITY_LABELS[g.priority] || '',
        `${getGoalProgress(g)}%`,
        g.deadline ? formatDate(g.deadline) : '',
      ]),
    })
    generatePDF(getBusinessName(), 'Planejamento & Metas', sections)
  }

  const handleExportExcel = () => {
    exportToExcel('planejamento-metas', [
      {
        name: 'Metas',
        headers: [
          'Título',
          'Objetivo',
          'Período',
          'Indicador',
          'Inicial',
          'Alvo',
          'Atual',
          'Progresso',
          'Prioridade',
          'Status',
          'Prazo',
        ],
        rows: goals.map((g) => [
          g.title,
          g.related_objective || '',
          getMonthLabel(g.period_month),
          g.indicator || '',
          g.initial_value || 0,
          g.target_value || 0,
          g.current_value || 0,
          getGoalProgress(g),
          GOAL_PRIORITY_LABELS[g.priority] || '',
          GOAL_STATUS_LABELS[g.status] || '',
          g.deadline ? formatDate(g.deadline) : '',
        ]),
      },
    ])
  }

  if (!planning) return null

  const filteredGoals =
    view === 'monthly' && monthFilter ? goals.filter((g) => g.period_month === monthFilter) : goals

  const sortedByPriority = [...goals].sort((a, b) => {
    const o: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return (o[a.priority] ?? 3) - (o[b.priority] ?? 3)
  })

  const renderGrid = (list: any[]) =>
    list.length === 0 ? (
      <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
        Nenhuma meta encontrada.
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onClick={() => handleCardClick(g)}
            linkedTasksCount={taskCountByGoal[g.id]}
          />
        ))}
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Planejamento & Metas
          </h1>
          <p className="text-muted-foreground">
            Alinhe sua visão estratégica com a execução diária.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            onClick={handleNew}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Meta
          </Button>
        </div>
      </div>

      <StrategicContext planning={planning} onSaved={loadData} />

      <Tabs value={view} onValueChange={(v) => setView(v as ViewTab)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="annual">Visão Anual</TabsTrigger>
          <TabsTrigger value="monthly">Mensal</TabsTrigger>
          <TabsTrigger value="objective">Por Objetivo</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="priority">Prioridades</TabsTrigger>
          <TabsTrigger value="action_plan">Plano de Ação</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === 'annual' && renderGrid(goals)}

      {view === 'monthly' && (
        <div className="space-y-4">
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderGrid(filteredGoals)}
        </div>
      )}

      {view === 'objective' && (
        <div className="space-y-6">
          {Object.entries(objectiveGroups).map(([obj, list]) => (
            <div key={obj} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">{obj}</h3>
              {renderGrid(list)}
            </div>
          ))}
        </div>
      )}

      {view === 'status' && (
        <div className="space-y-6">
          {STATUS_ORDER.map((s) => {
            const list = goals.filter((g) => g.status === s)
            if (list.length === 0) return null
            return (
              <div key={s} className="space-y-3">
                <Badge variant="outline" className={GOAL_STATUS_COLORS[s]}>
                  {GOAL_STATUS_LABELS[s]}
                </Badge>
                {renderGrid(list)}
              </div>
            )
          })}
        </div>
      )}

      {view === 'priority' && renderGrid(sortedByPriority)}

      {view === 'action_plan' && (
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
              Nenhuma meta encontrada.
            </div>
          ) : (
            goals.map((g) => (
              <Card
                key={g.id}
                className="border-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleCardClick(g)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{g.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={GOAL_STATUS_COLORS[g.status]}>
                        {GOAL_STATUS_LABELS[g.status]}
                      </Badge>
                      {g.related_objective && (
                        <span className="text-xs text-muted-foreground">{g.related_objective}</span>
                      )}
                      {g.deadline && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(g.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Progresso</div>
                      <div className="font-semibold text-foreground">{getGoalProgress(g)}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ListChecks size={12} /> Ações
                      </div>
                      <div className="font-semibold text-foreground">
                        {taskCountByGoal[g.id] || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <GoalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingGoal={editingGoal}
      />
      <GoalDetailDialog
        goal={detailGoal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
