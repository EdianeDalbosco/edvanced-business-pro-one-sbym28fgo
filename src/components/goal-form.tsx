import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { createGoal, updateGoal } from '@/services/goals'
import { useToast } from '@/hooks/use-toast'
import { GOAL_STATUS_LABELS, MONTH_OPTIONS, calcGoalProgress } from '@/lib/goal-utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingGoal: any | null
}

const emptyForm = {
  title: '',
  related_objective: '',
  period_month: 'annual',
  deadline: '',
  expected_result: '',
  indicator: '',
  initial_value: '',
  target_value: '',
  current_value: '',
  progress_percent: '',
  priority: 'medium',
  status: 'nao_iniciada',
  observations: '',
}

function toDateInput(raw: string): string {
  if (!raw) return ''
  return raw.split(' ')[0].split('T')[0]
}

export function GoalForm({ open, onOpenChange, onSaved, editingGoal }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    if (editingGoal) {
      setForm({
        title: editingGoal.title || '',
        related_objective: editingGoal.related_objective || '',
        period_month: editingGoal.period_month || 'annual',
        deadline: toDateInput(editingGoal.deadline),
        expected_result: editingGoal.expected_result || '',
        indicator: editingGoal.indicator || '',
        initial_value: String(editingGoal.initial_value ?? ''),
        target_value: String(editingGoal.target_value ?? ''),
        current_value: String(editingGoal.current_value ?? ''),
        progress_percent: String(editingGoal.progress_percent ?? ''),
        priority: editingGoal.priority || 'medium',
        status: editingGoal.status || 'nao_iniciada',
        observations: editingGoal.observations || '',
      })
    } else {
      setForm({ ...emptyForm })
    }
  }, [editingGoal, open])

  const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }))

  const autoProgress = calcGoalProgress(
    Number(form.initial_value) || 0,
    Number(form.target_value) || 0,
    Number(form.current_value) || 0,
  )

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' })
      return
    }
    try {
      const initialNum = Number(form.initial_value) || 0
      const targetNum = Number(form.target_value) || 0
      const currentNum = Number(form.current_value) || 0
      const manualProgress = form.progress_percent !== '' ? Number(form.progress_percent) : null
      const progress = manualProgress !== null ? manualProgress : autoProgress
      const data = {
        title: form.title,
        related_objective: form.related_objective || null,
        period_month: form.period_month,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        expected_result: form.expected_result || null,
        indicator: form.indicator || null,
        initial_value: initialNum,
        target_value: targetNum,
        current_value: currentNum,
        progress_percent: progress,
        priority: form.priority,
        status: form.status,
        observations: form.observations || null,
      }
      if (editingGoal) {
        await updateGoal(editingGoal.id, data)
        toast({ title: 'Meta atualizada!' })
      } else {
        await createGoal(data)
        toast({ title: 'Meta criada!' })
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Objetivo Relacionado</Label>
            <Input
              value={form.related_objective}
              onChange={(e) => update('related_objective', e.target.value)}
              placeholder="Pilar estratégico vinculado"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={form.period_month} onValueChange={(v) => update('period_month', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => update('priority', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GOAL_STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Indicador</Label>
              <Input
                value={form.indicator}
                onChange={(e) => update('indicator', e.target.value)}
                placeholder="Ex: Total de Vendas"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor Inicial</Label>
              <Input
                type="number"
                value={form.initial_value}
                onChange={(e) => update('initial_value', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Alvo</Label>
              <Input
                type="number"
                value={form.target_value}
                onChange={(e) => update('target_value', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Atual</Label>
              <Input
                type="number"
                value={form.current_value}
                onChange={(e) => update('current_value', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Progresso (%) — Auto: {autoProgress}%</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.progress_percent}
              onChange={(e) => update('progress_percent', e.target.value)}
              placeholder={`Automático (${autoProgress}%)`}
            />
          </div>
          <div className="space-y-2">
            <Label>Resultado Esperado</Label>
            <Textarea
              rows={2}
              value={form.expected_result}
              onChange={(e) => update('expected_result', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              rows={2}
              value={form.observations}
              onChange={(e) => update('observations', e.target.value)}
            />
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
          >
            {editingGoal ? 'Atualizar' : 'Criar'} Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
