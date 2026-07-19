import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Repeat, Link2, Video, MapPin, Bell, FileText } from 'lucide-react'
import { createTask, updateTask } from '@/services/tasks'
import { useToast } from '@/hooks/use-toast'
import { REMINDER_OPTIONS } from '@/lib/task-utils'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingTask: any | null
  contacts: any[]
  goals: any[]
  contracts: any[]
  presetGoalId?: string
}

const emptyForm = {
  title: '',
  type: 'task',
  due_date: '',
  start_date: '',
  time: '',
  priority: 'medium',
  status: 'nao_iniciado',
  business_area: '',
  recurrence: 'none',
  progress_percent: '0',
  next_action: '',
  observations: '',
  links: '',
  participants: '',
  location: '',
  reminder: '',
  meeting_result: '',
  contact_id: '',
  goal_id: '',
  contract_id: '',
}

function toDateInput(raw: string): string {
  if (!raw) return ''
  return raw.split(' ')[0].split('T')[0]
}

export function TaskForm({
  open,
  onOpenChange,
  onSaved,
  editingTask,
  contacts,
  goals,
  contracts,
  presetGoalId,
}: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({ ...emptyForm })
  const isMeeting = form.type === 'meeting' || form.type === 'appointment'

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        type: editingTask.type || 'task',
        due_date: toDateInput(editingTask.due_date),
        start_date: toDateInput(editingTask.start_date),
        time: editingTask.time || '',
        priority: editingTask.priority || 'medium',
        status: editingTask.status || 'nao_iniciado',
        business_area: editingTask.business_area || '',
        recurrence: editingTask.recurrence || 'none',
        progress_percent: String(editingTask.progress_percent ?? 0),
        next_action: editingTask.next_action || '',
        observations: editingTask.observations || '',
        links: editingTask.links || '',
        participants: editingTask.participants || '',
        location: editingTask.location || '',
        reminder: editingTask.reminder || '',
        meeting_result: editingTask.meeting_result || '',
        contact_id: editingTask.contact_id || '',
        goal_id: editingTask.goal_id || '',
        contract_id: editingTask.contract_id || '',
      })
    } else {
      setForm({ ...emptyForm, goal_id: presetGoalId || '' })
    }
  }, [editingTask, open, presetGoalId])

  const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' })
      return
    }
    try {
      const data = {
        ...form,
        progress_percent: Number(form.progress_percent) || 0,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        contact_id: form.contact_id || null,
        goal_id: form.goal_id || null,
        contract_id: form.contract_id || null,
      }
      if (editingTask) {
        await updateTask(editingTask.id, data)
        toast({ title: 'Atividade atualizada!' })
      } else {
        await createTask(data)
        toast({ title: 'Atividade criada!' })
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
          <DialogTitle>{editingTask ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título da Atividade *</Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
              >
                <option value="task">Tarefa</option>
                <option value="meeting">Reunião</option>
                <option value="appointment">Compromisso</option>
                <option value="project">Projeto</option>
                <option value="delivery">Entrega</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <select
                className={selectClass}
                value={form.priority}
                onChange={(e) => update('priority', e.target.value)}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className={selectClass}
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
              >
                <option value="nao_iniciado">Não Iniciado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="aguardando">Aguardando</option>
                <option value="concluido">Concluído</option>
                <option value="atrasado">Atrasado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => update('due_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Progresso (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.progress_percent}
                onChange={(e) => update('progress_percent', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Área de Negócio</Label>
              <Input
                value={form.business_area}
                onChange={(e) => update('business_area', e.target.value)}
                placeholder="Ex: Financeiro"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Repeat size={14} /> Recorrência
              </Label>
              <select
                className={selectClass}
                value={form.recurrence}
                onChange={(e) => update('recurrence', e.target.value)}
              >
                <option value="none">Não repete</option>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          </div>
          {isMeeting && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Video size={14} /> Horário
                  </Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => update('time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <MapPin size={14} /> Local ou Link
                  </Label>
                  <Input
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Endereço ou URL"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Participantes</Label>
                  <Input
                    value={form.participants}
                    onChange={(e) => update('participants', e.target.value)}
                    placeholder="Nomes dos participantes"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Bell size={14} /> Lembrete
                  </Label>
                  <select
                    className={selectClass}
                    value={form.reminder}
                    onChange={(e) => update('reminder', e.target.value)}
                  >
                    {REMINDER_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Resultado da Reunião</Label>
                <Textarea
                  rows={3}
                  value={form.meeting_result}
                  onChange={(e) => update('meeting_result', e.target.value)}
                  placeholder="Ata, decisões e encaminhamentos..."
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Próxima Ação</Label>
            <Input
              value={form.next_action}
              onChange={(e) => update('next_action', e.target.value)}
              placeholder="O que fazer depois?"
            />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={form.observations}
              onChange={(e) => update('observations', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Link2 size={14} /> Links / Anexos (URL)
            </Label>
            <Input
              value={form.links}
              onChange={(e) => update('links', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <FileText size={14} /> Vincular a
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                className={selectClass}
                value={form.contact_id}
                onChange={(e) => update('contact_id', e.target.value)}
              >
                <option value="">Cliente (opcional)</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={form.goal_id}
                onChange={(e) => update('goal_id', e.target.value)}
              >
                <option value="">Meta (opcional)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={form.contract_id}
                onChange={(e) => update('contract_id', e.target.value)}
              >
                <option value="">Projeto (opcional)</option>
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
          >
            {editingTask ? 'Atualizar' : 'Criar'} Atividade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
