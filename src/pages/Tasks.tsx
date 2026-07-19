import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getTasks, createTask, updateTask, deleteTask } from '@/services/tasks'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Plus, Check, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/format'

const COLUMNS = [
  { id: 'todo', label: 'A Fazer', icon: Clock, color: 'text-slate-400' },
  { id: 'doing', label: 'Fazendo', icon: AlertCircle, color: 'text-amber-400' },
  { id: 'done', label: 'Concluído', icon: Check, color: 'text-emerald-400' },
]

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => setTasks(await getTasks())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('tasks', loadData)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await createTask({
        ...data,
        due_date: data.due_date ? new Date(data.due_date as string).toISOString() : null,
      })
      setDialogOpen(false)
      toast({ title: 'Tarefa criada!' })
    } catch {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tarefas</h1>
          <p className="text-muted-foreground">Organize seu dia e aumente sua produtividade.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Limite</Label>
                  <Input type="date" name="due_date" />
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <select name="priority" className={selectClass}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <input type="hidden" name="status" value="todo" />
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar Tarefa
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 pb-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="bg-muted/30 p-4 rounded-xl flex flex-col h-[calc(100vh-200px)]"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <col.icon size={18} className={col.color} /> {col.label}
              <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {tasks
                .filter((t) => t.status === col.id)
                .map((t) => (
                  <Card
                    key={t.id}
                    className="bg-card border-border shadow-sm hover:shadow transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-foreground text-sm">{t.title}</div>
                        {t.priority === 'high' && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"
                            title="Alta Prioridade"
                          />
                        )}
                        {t.priority === 'medium' && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"
                            title="Média Prioridade"
                          />
                        )}
                      </div>
                      {t.due_date && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Vence em: {formatDate(t.due_date)}
                        </div>
                      )}
                      <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          className="text-xs border-border rounded p-1 bg-background text-muted-foreground"
                          value={t.status}
                          onChange={(e) => updateTask(t.id, { status: e.target.value })}
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="text-muted-foreground hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
