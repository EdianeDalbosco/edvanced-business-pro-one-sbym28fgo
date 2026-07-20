import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target } from 'lucide-react'

const GOLD = '#D4AF37'

export function TeamProductivity({ members, goals }: { members: any[]; goals: any[] }) {
  const goalStatsByUser = useMemo(() => {
    const map = new Map<string, { count: number; avgProgress: number }>()
    goals.forEach((g) => {
      const uid = g.user_id
      if (!map.has(uid)) map.set(uid, { count: 0, avgProgress: 0 })
      const stats = map.get(uid)!
      stats.count++
      stats.avgProgress += Number(g.progress_percent) || 0
    })
    map.forEach((stats) => {
      if (stats.count > 0) stats.avgProgress = Math.round(stats.avgProgress / stats.count)
    })
    return map
  }, [goals])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users size={20} style={{ color: GOLD }} /> Produtividade da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro na equipe.</p>
        ) : (
          members.map((m) => {
            const goalStats = goalStatsByUser.get(m.id)
            return (
              <div key={m.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground truncate mr-2">{m.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {m.completedTasks}/{m.totalTasks} tarefas · {m.completionRate}%
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${m.completionRate}%`, backgroundColor: GOLD }}
                  />
                </div>
                {goalStats && goalStats.count > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Target size={10} /> {goalStats.count}{' '}
                        {goalStats.count === 1 ? 'meta' : 'metas'}
                      </span>
                      <span className="text-primary font-medium">{goalStats.avgProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${goalStats.avgProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
