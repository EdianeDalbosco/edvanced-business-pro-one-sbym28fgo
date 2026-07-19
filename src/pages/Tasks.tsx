import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, List, CalendarDays } from 'lucide-react'
import { getTasks, updateTask, deleteTask } from '@/services/tasks'
import { getContacts } from '@/services/contacts'
import { getGoals } from '@/services/goals'
import { getContracts } from '@/services/contracts'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { TaskForm } from '@/components/task-form'
import { TaskListView } from '@/components/task-list-view'
import { TaskCalendarView } from '@/components/task-calendar-view'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'
import { formatDate, isToday } from '@/lib/format'
import {
  STATUS_LABELS,
  TYPE_LABELS,
  PRIORITY_LABELS,
  RECURRENCE_LABELS,
  isDelayed,
  isThisWeek,
} from '@/lib/task-utils'

type FilterType = 'all' | 'today' | 'weekly' | 'delayed' | 'completed' | 'by_project' | 'by_client'

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [filter, setFilter] = useState<FilterType>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const [t, c, g, ct] = await Promise.all([getTasks(), getContacts(), getGoals(), getContracts()])
    setTasks(t)
    setContacts(c)
    setGoals(g)
    setContracts(ct)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('tasks', loadData)
  useRealtime('goals', loadData)
  useRealtime('contracts', loadData)

  const handleEdit = (task: any) => {
    setEditingTask(task)
    setFormOpen(true)
  }
  const handleNew = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTask(id, { status })
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }
  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id)
      toast({ title: 'Atividade excluída' })
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'today':
        return tasks.filter((t) => t.due_date && isToday(t.due_date))
      case 'weekly':
        return tasks.filter((t) => isThisWeek(t.due_date))
      case 'delayed':
        return tasks.filter((t) => isDelayed(t))
      case 'completed':
        return tasks.filter((t) => t.status === 'concluido')
      default:
        return tasks
    }
  }, [tasks, filter])

  const handleExportPDF = () => {
    generatePDF(getBusinessName(), 'Central de Execução', [
      {
        type: 'table',
        title: 'Atividades',
        headers: ['Título', 'Tipo', 'Status', 'Prioridade', 'Prazo', 'Progresso', 'Vínculos'],
        rows: filteredTasks.map((t) => [
          t.title,
          TYPE_LABELS[t.type || 'task'] || '',
          STATUS_LABELS[t.status] || '',
          PRIORITY_LABELS[t.priority] || '',
          t.due_date ? formatDate(t.due_date) : '',
          `${t.progress_percent || 0}%`,
          [t.expand?.contact_id?.name, t.expand?.goal_id?.title, t.expand?.contract_id?.title]
            .filter(Boolean)
            .join(', '),
        ]),
      },
    ])
  }

  const handleExportExcel = () => {
    exportToExcel('central-execucao', [
      {
        name: 'Atividades',
        headers: [
          'Título',
          'Tipo',
          'Status',
          'Prioridade',
          'Início',
          'Prazo',
          'Progresso',
          'Área',
          'Recorrência',
          'Cliente',
          'Meta',
          'Projeto',
        ],
        rows: filteredTasks.map((t) => [
          t.title,
          t.type || 'task',
          t.status || '',
          t.priority || '',
          t.start_date ? formatDate(t.start_date) : '',
          t.due_date ? formatDate(t.due_date) : '',
          t.progress_percent || 0,
          t.business_area || '',
          RECURRENCE_LABELS[t.recurrence || 'none'] || '',
          t.expand?.contact_id?.name || '',
          t.expand?.goal_id?.title || '',
          t.expand?.contract_id?.title || '',
        ]),
      },
    ])
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Central de Execução</h1>
          <p className="text-muted-foreground">
            Gerencie tarefas, reuniões, compromissos e projetos em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            onClick={handleNew}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Atividade
          </Button>
        </div>
      </div>
      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">
            <List size={16} className="mr-1" /> Lista
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays size={16} className="mr-1" /> Calendário
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {view === 'list' ? (
        <TaskListView
          tasks={filteredTasks}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          contacts={contacts}
          contracts={contracts}
        />
      ) : (
        <TaskCalendarView tasks={tasks} onEdit={handleEdit} />
      )}
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingTask={editingTask}
        contacts={contacts}
        goals={goals}
        contracts={contracts}
      />
    </div>
  )
}
