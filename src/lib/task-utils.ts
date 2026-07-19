export const STATUS_LABELS: Record<string, string> = {
  nao_iniciado: 'Não Iniciado',
  em_andamento: 'Em Andamento',
  aguardando: 'Aguardando',
  concluido: 'Concluído',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
}

export const STATUS_COLORS: Record<string, string> = {
  nao_iniciado: 'bg-slate-500/10 text-slate-400',
  em_andamento: 'bg-amber-500/10 text-amber-400',
  aguardando: 'bg-cyan-500/10 text-cyan-400',
  concluido: 'bg-emerald-500/10 text-emerald-400',
  atrasado: 'bg-rose-500/10 text-rose-400',
  cancelado: 'bg-zinc-500/10 text-zinc-500',
}

export const TYPE_LABELS: Record<string, string> = {
  task: 'Tarefa',
  meeting: 'Reunião',
  appointment: 'Compromisso',
  project: 'Projeto',
  delivery: 'Entrega',
}

export const TYPE_ICONS: Record<string, string> = {
  task: 'bg-blue-500',
  meeting: 'bg-violet-500',
  appointment: 'bg-cyan-500',
  project: 'bg-amber-500',
  delivery: 'bg-emerald-500',
}

export const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-rose-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
}

export const RECURRENCE_LABELS: Record<string, string> = {
  none: 'Não repete',
  daily: 'Diária',
  weekly: 'Semanal',
}

export const REMINDER_OPTIONS = [
  { value: '', label: 'Nenhum' },
  { value: '15min', label: '15 min antes' },
  { value: '1h', label: '1 hora antes' },
  { value: '1d', label: '1 dia antes' },
  { value: '1sem', label: '1 semana antes' },
]

export function isDelayed(task: any): boolean {
  if (!task.due_date) return false
  if (task.status === 'concluido' || task.status === 'cancelado') return false
  const due = new Date(task.due_date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return due < today
}

export function isThisWeek(dateStr: string): boolean {
  if (!dateStr) return false
  const due = new Date(dateStr)
  const today = new Date()
  const todayStart = new Date(today.toDateString())
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)
  return due >= todayStart && due <= weekEnd
}
