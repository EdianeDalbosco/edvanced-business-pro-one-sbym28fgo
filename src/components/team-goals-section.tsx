import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GOAL_STATUS_LABELS, GOAL_STATUS_COLORS } from '@/lib/goal-utils'
import type { TeamMember } from '@/services/team'

interface TeamGoalsSectionProps {
  members: TeamMember[]
  goals: any[]
}

export function TeamGoalsSection({ members, goals }: TeamGoalsSectionProps) {
  const memberMap = new Map(members.map((m) => [m.id, m]))
  const goalsByMember = new Map<string, any[]>()

  for (const goal of goals) {
    if (!memberMap.has(goal.user_id)) continue
    const list = goalsByMember.get(goal.user_id) ?? []
    list.push(goal)
    goalsByMember.set(goal.user_id, list)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Metas da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goalsByMember.size === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma meta encontrada.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from(goalsByMember.entries()).map(([userId, memberGoals]) => {
              const member = memberMap.get(userId)
              return (
                <div key={userId} className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium text-sm">{member?.name || member?.email}</h4>
                  {memberGoals.map((goal) => (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm truncate">{goal.title}</span>
                        <Badge
                          variant="secondary"
                          className={GOAL_STATUS_COLORS?.[goal.status] ?? ''}
                        >
                          {GOAL_STATUS_LABELS?.[goal.status] ?? goal.status}
                        </Badge>
                      </div>
                      {typeof goal.progress_percent === 'number' && goal.progress_percent > 0 && (
                        <Progress value={goal.progress_percent} className="h-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
