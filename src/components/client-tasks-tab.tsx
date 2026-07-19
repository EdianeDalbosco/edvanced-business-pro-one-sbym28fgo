import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createTask } from '@/services/tasks'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/format'
import { Plus, AlertCircle, Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  high: { label: 'Alta', color: 'text-rose-400', dot: 'bg-rose-500' },
  medium: { label: 'Média', color: 'text-amber-400', dot: 'bg-amber-500' },
  low: { label: 'Baixa', color: 'text-slate-400', dot: 'bg-slate-400' },
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return d < today
}

export function ClientTasksTab({ tasks, contactId }: { tasks: any[]; contactId: string }) {
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await createTask({
        title: data.title,
        contact_id: contactId,
        priority: data.priority,
        due_date: data.due_date ? new Date(data.due_date as string).toISOString() : null,
        status: 'nao_iniciado',
      })
      setShowForm(false)
      toast({ title: 'Tarefa criada!' })
    } catch {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Nova Tarefa
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 p-4 rounded-lg border border-border bg-muted/30"
        >
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input name="title" required placeholder="Descrição da tarefa..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Data Limite</Label>
              <Input type="date" name="due_date" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Prioridade</Label>
              <select name="priority" className={selectClass}>
                <option value="low">Baixa</option>
                <option value="medium" selected>
                  Média
                </option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <Button type="submit" size="sm" className="w-full">
            Criar Tarefa
          </Button>
        </form>
      )}
      {tasks.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          Nenhuma ação pendente para este cliente.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => {
            const prio = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.low
            const overdue = t.due_date && isOverdue(t.due_date)
            return (
              <Card key={t.id} className="border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', prio.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{t.title}</div>
                    {t.due_date && (
                      <div
                        className={cn(
                          'text-xs flex items-center gap-1 mt-0.5',
                          overdue ? 'text-rose-400' : 'text-muted-foreground',
                        )}
                      >
                        {overdue ? <AlertCircle size={10} /> : <Clock size={10} />}
                        {overdue ? 'Atrasada: ' : 'Vence: '}
                        {formatDate(t.due_date)}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={cn('text-xs', prio.color)}>
                    {prio.label}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
