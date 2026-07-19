export const GOAL_STATUS_LABELS: Record<string, string> = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  em_risco: 'Em Risco',
  concluida: 'Concluída',
  nao_alcancada: 'Não Alcançada',
  cancelada: 'Cancelada',
}

export const GOAL_STATUS_COLORS: Record<string, string> = {
  nao_iniciada: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  em_andamento: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  em_risco: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  concluida: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  nao_alcancada: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30',
  cancelada: 'bg-zinc-600/10 text-zinc-600 border-zinc-600/30',
}

export const GOAL_PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export const GOAL_PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}

export const GOAL_PROGRESS_BAR_COLORS: Record<string, string> = {
  nao_iniciada: 'bg-slate-400',
  em_andamento: 'bg-amber-500',
  em_risco: 'bg-rose-500',
  concluida: 'bg-emerald-500',
  nao_alcancada: 'bg-zinc-500',
  cancelada: 'bg-zinc-600',
}

export const MONTH_OPTIONS = [
  { value: 'annual', label: 'Anual' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

export function getMonthLabel(value: string): string {
  return MONTH_OPTIONS.find((m) => m.value === value)?.label || value || '—'
}

export function isGoalDelayed(goal: any): boolean {
  if (!goal.deadline) return false
  if (['concluida', 'cancelada', 'nao_alcancada'].includes(goal.status)) return false
  const due = new Date(goal.deadline)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return due < today
}

export function calcGoalProgress(initial: number, target: number, current: number): number {
  if (!target) return 0
  const start = initial || 0
  const range = target - start
  if (range <= 0) return 0
  const progress = ((current - start) / range) * 100
  return Math.min(Math.max(Math.round(progress), 0), 100)
}

export function getGoalProgress(goal: any): number {
  if (goal.progress_percent != null && goal.progress_percent !== '') {
    return Math.min(Math.max(Number(goal.progress_percent), 0), 100)
  }
  return calcGoalProgress(goal.initial_value || 0, goal.target_value || 0, goal.current_value || 0)
}
