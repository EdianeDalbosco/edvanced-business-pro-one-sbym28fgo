import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { createTeamGoal } from '@/services/team-goals'
import { useToast } from '@/hooks/use-toast'
import { Target } from 'lucide-react'
import type { TeamMember } from '@/services/team'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  member: TeamMember | null
}

const emptyForm = {
  title: '',
  target_value: '',
  deadline: '',
  priority: 'medium',
  indicator: '',
}

export function TeamGoalForm({ open, onOpenChange, onSaved, member }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    if (open) setForm({ ...emptyForm })
  }, [open])

  const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    if (!member) return
    if (!form.title.trim() || !form.target_value || !form.deadline) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }
    try {
      await createTeamGoal({
        user_id: member.id,
        title: form.title,
        target_value: Number(form.target_value) || 0,
        deadline: new Date(form.deadline).toISOString(),
        priority: form.priority,
        indicator: form.indicator || undefined,
      })
      toast({ title: 'Meta criada com sucesso!' })
      onOpenChange(false)
      onSaved()
    } catch {
      toast({ title: 'Erro ao criar meta', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="text-primary" size={18} />
            Nova Meta — {member?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ex: Aumentar vendas"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Alvo *</Label>
              <Input
                type="number"
                value={form.target_value}
                onChange={(e) => update('target_value', e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo *</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <Label>Indicador</Label>
              <Input
                value={form.indicator}
                onChange={(e) => update('indicator', e.target.value)}
                placeholder="Ex: Reais"
              />
            </div>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
          >
            Criar Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
