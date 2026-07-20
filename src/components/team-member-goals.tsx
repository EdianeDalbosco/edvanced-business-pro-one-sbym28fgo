import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Target } from 'lucide-react'
import { getGoalProgress, GOAL_STATUS_LABELS, GOAL_PROGRESS_BAR_COLORS } from '@/lib/goal-utils'
import { getMemberAvatarUrl, type TeamMember } from '@/services/team'

interface Props {
  members: TeamMember[]
  goals: any[]
  onAddGoal: (member: TeamMember) => void
}

export function TeamMemberGoals({ members, goals, onAddGoal }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="text-primary" size={24} />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Metas da Equipe</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const memberGoals = goals.filter((g) => g.user_id === m.id)
          return (
            <Card key={m.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {m.avatar ? <AvatarImage src={getMemberAvatarUrl(m)} alt={m.name} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {m.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground text-sm">
                      {m.name || 'Sem nome'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => onAddGoal(m)}
                  >
                    <Plus size={14} className="mr-1" /> Meta
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {memberGoals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    Nenhuma meta definida.
                  </p>
                ) : (
                  memberGoals.map((g) => {
                    const progress = getGoalProgress(g)
                    const barColor = GOAL_PROGRESS_BAR_COLORS[g.status] || 'bg-primary'
                    return (
                      <div key={g.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-foreground truncate flex-1 mr-2">
                            {g.title}
                          </span>
                          <span className="text-primary font-semibold">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{GOAL_STATUS_LABELS[g.status] || g.status}</span>
                          {g.target_value ? <span>Alvo: {g.target_value}</span> : null}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
