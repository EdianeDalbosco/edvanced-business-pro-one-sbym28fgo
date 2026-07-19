import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Repeat,
  Trash2,
  Calendar,
  User,
  Target,
  FileText,
  Video,
  MapPin,
  Users,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  STATUS_LABELS,
  TYPE_LABELS,
  TYPE_ICONS,
  PRIORITY_COLORS,
  isDelayed,
} from '@/lib/task-utils'

type FilterType = 'all' | 'today' | 'weekly' | 'delayed' | 'completed' | 'by_project' | 'by_client'

interface Props {
  tasks: any[]
  filter: FilterType
  onFilterChange: (f: FilterType) => void
  onEdit: (task: any) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  contacts: any[]
  contracts: any[]
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoje' },
  { value: 'weekly', label: 'Esta Semana' },
  { value: 'delayed', label: 'Atrasadas' },
  { value: 'completed', label: 'Concluídas' },
  { value: 'by_project', label: 'Por Projeto' },
  { value: 'by_client', label: 'Por Cliente' },
]

function TaskCard({ t, onEdit, onStatusChange, onDelete }: any) {
  const linked: { icon: typeof User; label: string }[] = []
  if (t.expand?.contact_id?.name) linked.push({ icon: User, label: t.expand.contact_id.name })
  if (t.expand?.goal_id?.title) linked.push({ icon: Target, label: t.expand.goal_id.title })
  if (t.expand?.contract_id?.title)
    linked.push({ icon: FileText, label: t.expand.contract_id.title })
  const isMeeting = t.type === 'meeting' || t.type === 'appointment'
  const delayed = isDelayed(t)

  return (
    <Card
      className="border-border hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onEdit(t)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn('w-2 h-2 rounded-full flex-shrink-0', TYPE_ICONS[t.type || 'task'])}
              />
              <span className="font-medium text-foreground text-sm truncate">{t.title}</span>
              {t.type && t.type !== 'task' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {TYPE_LABELS[t.type]}
                </span>
              )}
              {delayed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400">
                  Atrasada
                </span>
              )}
              {t.recurrence && t.recurrence !== 'none' && (
                <Repeat size={14} className="text-primary flex-shrink-0" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {t.due_date && (
                <span className={cn('flex items-center gap-1', delayed && 'text-rose-400')}>
                  <Calendar size={12} /> {formatDate(t.due_date)}
                </span>
              )}
              {isMeeting && t.time && (
                <span className="flex items-center gap-1">
                  <Video size={12} /> {t.time}
                </span>
              )}
              {isMeeting && t.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {t.location}
                </span>
              )}
              {isMeeting && t.participants && (
                <span className="flex items-center gap-1">
                  <Users size={12} /> {t.participants}
                </span>
              )}
              {t.business_area && (
                <span className="bg-muted px-2 py-0.5 rounded">{t.business_area}</span>
              )}
              {linked.map((l, i) => (
                <span key={i} className="flex items-center gap-1">
                  <l.icon size={12} /> {l.label}
                </span>
              ))}
            </div>
            {Number(t.progress_percent) > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <Progress value={Number(t.progress_percent)} className="h-1.5 max-w-[120px]" />
                <span className="text-[10px] text-muted-foreground">{t.progress_percent}%</span>
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <select
              className="text-xs border-border rounded p-1 bg-background text-muted-foreground"
              value={t.status}
              onChange={(e) => onStatusChange(t.id, e.target.value)}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <button
              onClick={() => onDelete(t.id)}
              className="text-muted-foreground hover:text-rose-400 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TaskListView({
  tasks,
  filter,
  onFilterChange,
  onEdit,
  onStatusChange,
  onDelete,
  contacts,
  contracts,
}: Props) {
  const renderGrouped = (groupField: 'contract_id' | 'contact_id', labels: any[]) => {
    const groups: Record<string, any[]> = {}
    tasks.forEach((t) => {
      const key = t[groupField] || '_none'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return Object.entries(groups).map(([key, items]) => {
      const label =
        key === '_none'
          ? 'Sem vínculo'
          : labels.find((l) => l.id === key)?.name ||
            labels.find((l) => l.id === key)?.title ||
            'Vinculado'
      return (
        <div key={key} className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">
            {label} ({items.length})
          </h3>
          {items.map((t) => (
            <TaskCard
              key={t.id}
              t={t}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'default' : 'outline'}
            size="sm"
            className={cn(filter === f.value && 'bg-primary text-primary-foreground')}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>
      {tasks.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          Nenhuma atividade encontrada.
        </div>
      ) : filter === 'by_project' ? (
        <div className="space-y-4">{renderGrouped('contract_id', contracts)}</div>
      ) : filter === 'by_client' ? (
        <div className="space-y-4">{renderGrouped('contact_id', contacts)}</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              t={t}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
