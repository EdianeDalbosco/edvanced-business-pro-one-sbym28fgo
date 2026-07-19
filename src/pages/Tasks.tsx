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
  { id: 'todo', label: 'A Fazer', icon: Clock, color: 'text-slate-500' },
  { id: 'doing', label: 'Fazendo', icon: AlertCircle, color: 'text-amber-500' },
  { id: 'done', label: 'Concluído', icon: Check, color: 'text-emerald-500' },
]

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
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData)
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tarefas</h1>
          <p className="text-slate-500">Organize seu dia e aumente sua produtividade.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
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
                  <select
                    name="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <input type="hidden" name="status" value="todo" />
              <Button type="submit" className="w-full">
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
            className="bg-slate-100 p-4 rounded-xl flex flex-col h-[calc(100vh-200px)]"
          >
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <col.icon size={18} className={col.color} /> {col.label}
              <span className="ml-auto text-xs bg-slate-200 px-2 py-0.5 rounded-full">
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {tasks
                .filter((t) => t.status === col.id)
                .map((t) => (
                  <Card
                    key={t.id}
                    className="bg-white border-slate-200 shadow-sm hover:shadow transition-shadow group"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-slate-800 text-sm">{t.title}</div>
                        {t.priority === 'high' && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"
                            title="Alta Prioridade"
                          ></span>
                        )}
                        {t.priority === 'medium' && (
                          <span
                            className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"
                            title="Média Prioridade"
                          ></span>
                        )}
                      </div>
                      {t.due_date && (
                        <div className="text-xs text-slate-500 mt-2">
                          Vence em: {formatDate(t.due_date)}
                        </div>
                      )}

                      <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          className="text-xs border-slate-200 rounded p-1 bg-slate-50 text-slate-600"
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
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
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
