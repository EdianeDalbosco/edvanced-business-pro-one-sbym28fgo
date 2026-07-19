import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/format'

export function PriorityTasks({ tasks }: { tasks: any[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <AlertCircle className="text-rose-400" size={20} /> Tarefas Prioritárias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma pendência.</p>
        ) : (
          tasks.map((task) => {
            const isOverdue =
              task.due_date && new Date(task.due_date) < new Date(new Date().toDateString())
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    isOverdue ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  {task.due_date && (
                    <p
                      className={`text-xs mt-0.5 flex items-center gap-1 ${
                        isOverdue ? 'text-rose-400' : 'text-muted-foreground'
                      }`}
                    >
                      <Clock size={10} />
                      {isOverdue ? 'Atrasada: ' : 'Vence: '}
                      {formatDate(task.due_date)}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === 'em_andamento'
                      ? 'bg-amber-500/10 text-amber-400'
                      : task.status === 'aguardando'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {task.status === 'em_andamento'
                    ? 'Em Andamento'
                    : task.status === 'aguardando'
                      ? 'Aguardando'
                      : 'Não Iniciado'}
                </span>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
