import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getPlanning, savePlanning } from '@/services/planning'
import { getGoals, createGoal, updateGoal } from '@/services/goals'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Target, Plus, CheckCircle2, Circle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/format'

export default function Planning() {
  const [planning, setPlanning] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [savingPlan, setSavingPlan] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    const [p, g] = await Promise.all([getPlanning(), getGoals()])
    setPlanning(p || { mission: '', vision: '', values: '', strategy: '' })
    setGoals(g)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('goals', async () => {
    setGoals(await getGoals())
  })

  const handleSavePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingPlan(true)
    try {
      const formData = new FormData(e.currentTarget)
      await savePlanning(planning?.id, Object.fromEntries(formData))
      toast({ title: 'Planejamento salvo com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSavingPlan(false)
  }

  const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData)
      await createGoal({
        title: data.title,
        description: data.description,
        target_value: Number(data.target_value),
        current_value: Number(data.current_value) || 0,
        deadline: new Date(data.deadline as string).toISOString(),
        status: data.status,
      })
      setGoalDialogOpen(false)
      toast({ title: 'Meta criada com sucesso!' })
    } catch {
      toast({ title: 'Erro ao criar meta', variant: 'destructive' })
    }
  }

  const toggleGoalStatus = async (goal: any) => {
    const nextStatus = goal.status === 'completed' ? 'in_progress' : 'completed'
    await updateGoal(goal.id, { status: nextStatus })
  }

  if (!planning) return null

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Planejamento & Metas
          </h1>
          <p className="text-muted-foreground">
            Defina o rumo do seu negócio e acompanhe seus objetivos.
          </p>
        </div>
        <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea name="description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Alvo</Label>
                  <Input type="number" name="target_value" required />
                </div>
                <div className="space-y-2">
                  <Label>Valor Atual</Label>
                  <Input type="number" name="current_value" defaultValue={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input type="date" name="deadline" required />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select name="status" className={selectClass} defaultValue="in_progress">
                    <option value="in_progress">Em Andamento</option>
                    <option value="pending">Pendente</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar Meta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-border gold-accent-border h-fit">
          <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
            <CardTitle className="text-lg text-foreground">Canvas Estratégico</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePlan} className="space-y-5">
              {[
                { label: 'Missão', name: 'mission', rows: 3 },
                { label: 'Visão', name: 'vision', rows: 3 },
                { label: 'Valores', name: 'values', rows: 3 },
                { label: 'Estratégia Principal', name: 'strategy', rows: 4 },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  <Textarea
                    name={field.name}
                    defaultValue={planning[field.name]}
                    rows={field.rows}
                    className="resize-none"
                  />
                </div>
              ))}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={savingPlan}
              >
                {savingPlan ? 'Salvando...' : 'Salvar Planejamento'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Target className="text-primary" size={24} /> Suas Metas
          </h2>
          {goals.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
              Nenhuma meta cadastrada.
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal) => {
                const progress = goal.target_value
                  ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
                  : 0
                const isCompleted = goal.status === 'completed'
                return (
                  <Card
                    key={goal.id}
                    className={
                      isCompleted ? 'bg-muted/30 opacity-75 border-border' : 'border-border'
                    }
                  >
                    <CardContent className="p-5 flex items-start gap-4">
                      <button
                        onClick={() => toggleGoalStatus(goal)}
                        className="mt-1 text-slate-400 hover:text-primary transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="text-emerald-400" size={24} />
                        ) : (
                          <Circle size={24} />
                        )}
                      </button>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3
                              className={`font-semibold text-lg ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                            >
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <Clock size={14} className="mr-1 text-primary" />{' '}
                            {formatDate(goal.deadline)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium text-primary">{progress}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="text-xs text-muted-foreground">Atual / Alvo</div>
                            <div className="font-semibold text-foreground">
                              {goal.current_value} / {goal.target_value}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
