import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { getGoalProgress } from '@/lib/goal-utils'

export function GoalsTracker({ goals }: { goals: any[] }) {
  return (
    <Card className="lg:col-span-2 border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Target className="text-primary" size={20} /> Metas Principais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma pendência.</p>
        ) : (
          goals.slice(0, 5).map((goal) => {
            const progress = getGoalProgress(goal)
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium truncate mr-2 text-foreground">{goal.title}</span>
                  <span className="text-primary font-semibold">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Atual: {goal.current_value || 0}</span>
                  <span>Meta: {goal.target_value || 0}</span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
