import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { Calendar, AlertTriangle, ListChecks } from 'lucide-react'
import {
  GOAL_STATUS_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_PRIORITY_COLORS,
  GOAL_PROGRESS_BAR_COLORS,
  getMonthLabel,
  isGoalDelayed,
  getGoalProgress,
} from '@/lib/goal-utils'

interface Props {
  goal: any
  onClick: () => void
  linkedTasksCount?: number
}

export function GoalCard({ goal, onClick, linkedTasksCount }: Props) {
  const progress = getGoalProgress(goal)
  const delayed = isGoalDelayed(goal)
  const barColor = GOAL_PROGRESS_BAR_COLORS[goal.status] || 'bg-primary'

  return (
    <Card
      className="border-border cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-foreground truncate flex-1">{goal.title}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {delayed && <AlertTriangle className="text-rose-500" size={16} />}
            <span
              className={`w-2 h-2 rounded-full ${GOAL_PRIORITY_COLORS[goal.priority] || 'bg-slate-400'}`}
            />
          </div>
        </div>
        {goal.related_objective && (
          <p className="text-xs text-muted-foreground truncate">{goal.related_objective}</p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={GOAL_STATUS_COLORS[goal.status] || ''}>
            {GOAL_STATUS_LABELS[goal.status] || goal.status}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {getMonthLabel(goal.period_month)}
          </Badge>
          {linkedTasksCount != null && linkedTasksCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground">
              <ListChecks size={10} className="mr-1" /> {linkedTasksCount}
            </Badge>
          )}
        </div>
        <div>
          <div className="flex justify-between mb-1 text-xs">
            <span className="text-muted-foreground">{goal.indicator || 'Progresso'}</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {goal.initial_value ?? 0} → {goal.target_value ?? 0}
          </span>
          {goal.deadline && (
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(goal.deadline)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
