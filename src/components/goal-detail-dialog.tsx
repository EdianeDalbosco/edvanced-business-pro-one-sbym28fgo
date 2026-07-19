import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { getTasksByGoal } from '@/services/tasks'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/format'
import { Plus, Calendar, TrendingUp, ListChecks, Pencil, Trash2 } from 'lucide-react'
import {
  GOAL_STATUS_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_PRIORITY_LABELS,
  GOAL_PROGRESS_BAR_COLORS,
  getMonthLabel,
  getGoalProgress,
} from '@/lib/goal-utils'
import { STATUS_LABELS, TYPE_LABELS, STATUS_COLORS } from '@/lib/task-utils'
import { TaskForm } from '@/components/task-form'

interface Props {
  goal: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (goal: any) => void
  onDelete: (id: string) => void
}

export function GoalDetailDialog({ goal, open, onOpenChange, onEdit, onDelete }: Props) {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<any[]>([])
  const [taskFormOpen, setTaskFormOpen] = useState(false)

  useEffect(() => {
    if (goal?.id && open) {
      getTasksByGoal(goal.id)
        .then(setTasks)
        .catch(() => setTasks([]))
    } else {
      setTasks([])
    }
  }, [goal?.id, open])

  const reloadTasks = () => {
    if (goal?.id)
      getTasksByGoal(goal.id)
        .then(setTasks)
        .catch(() => {})
  }

  const progress = goal ? getGoalProgress(goal) : 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {goal && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{goal.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={GOAL_STATUS_COLORS[goal.status]}>
                    {GOAL_STATUS_LABELS[goal.status]}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {GOAL_PRIORITY_LABELS[goal.priority]} prioridade
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {getMonthLabel(goal.period_month)}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">{goal.indicator || 'Progresso'}</span>
                    <span className="font-semibold text-foreground">{progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${GOAL_PROGRESS_BAR_COLORS[goal.status] || 'bg-primary'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {goal.related_objective && (
                    <div>
                      <span className="text-muted-foreground">Objetivo: </span>
                      <span className="text-foreground">{goal.related_objective}</span>
                    </div>
                  )}
                  {goal.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{formatDate(goal.deadline)}</span>
                    </div>
                  )}
                  {goal.indicator && (
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-muted-foreground" />
                      <span className="text-foreground">{goal.indicator}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Inicial: </span>
                    <span className="text-foreground">{goal.initial_value ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alvo: </span>
                    <span className="text-foreground">{goal.target_value ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Atual: </span>
                    <span className="text-foreground">{goal.current_value ?? 0}</span>
                  </div>
                </div>

                {goal.expected_result && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Resultado Esperado</Label>
                    <p className="text-foreground text-sm mt-1">{goal.expected_result}</p>
                  </div>
                )}
                {goal.observations && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Observações</Label>
                    <p className="text-foreground text-sm mt-1">{goal.observations}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <ListChecks size={18} /> Ações Vinculadas
                    </h4>
                    <Button size="sm" variant="outline" onClick={() => setTaskFormOpen(true)}>
                      <Plus size={14} className="mr-1" /> Nova Ação
                    </Button>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                      Nenhuma ação vinculada.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-card"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {t.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={`text-xs ${STATUS_COLORS[t.status] || ''}`}
                              >
                                {STATUS_LABELS[t.status] || t.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {TYPE_LABELS[t.type] || t.type}
                              </span>
                              {t.due_date && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(t.due_date)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {t.progress_percent || 0}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
                    <Pencil size={14} className="mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-500 hover:text-rose-600"
                    onClick={() => onDelete(goal.id)}
                  >
                    <Trash2 size={14} className="mr-1" /> Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {goal && (
        <TaskForm
          open={taskFormOpen}
          onOpenChange={setTaskFormOpen}
          onSaved={reloadTasks}
          editingTask={null}
          contacts={[]}
          goals={[goal]}
          contracts={[]}
          presetGoalId={goal.id}
        />
      )}
    </>
  )
}
