export function isCurrentMonth(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
}

export function isPreviousMonth(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
}

export function getCurrentMonthPaidIncome(finance: any[]): number {
  return finance
    .filter((f) => f.type === 'income' && f.status === 'paid' && isCurrentMonth(f.date))
    .reduce((sum, f) => sum + (f.amount || 0), 0)
}

export function getCurrentMonthPaidExpense(finance: any[]): number {
  return finance
    .filter((f) => f.type === 'expense' && f.status === 'paid' && isCurrentMonth(f.date))
    .reduce((sum, f) => sum + (f.amount || 0), 0)
}

export function getPendingIncome(finance: any[]): number {
  return finance
    .filter((f) => f.type === 'income' && f.status === 'pending')
    .reduce((sum, f) => sum + (f.amount || 0), 0)
}

export function getPendingExpense(finance: any[]): number {
  return finance
    .filter((f) => f.type === 'expense' && f.status === 'pending')
    .reduce((sum, f) => sum + (f.amount || 0), 0)
}

export function getPreviousMonthPaidIncome(finance: any[]): number {
  return finance
    .filter((f) => f.type === 'income' && f.status === 'paid' && isPreviousMonth(f.date))
    .reduce((sum, f) => sum + (f.amount || 0), 0)
}

export function getPreviousMonthPaidExpense(finance: any[]): number {
  return finance
    .filter((f) => f.type === 'expense' && f.status === 'paid' && isPreviousMonth(f.date))
    .reduce((sum, f) => sum + (f.amount || 0), 0)
}

export function getActiveGoals(goals: any[]): any[] {
  return goals.filter(
    (g) => g.status === 'em_andamento' || g.status === 'nao_iniciada' || g.status === 'em_risco',
  )
}

export function getPriorityTasks(tasks: any[]): any[] {
  return tasks
    .filter((t) => t.priority === 'high' && t.status !== 'concluido')
    .sort((a, b) => {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity
      const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity
      return dateA - dateB
    })
    .slice(0, 5)
}

const ACTIVE_STAGES = [
  'prospeccao',
  'abordagem',
  'agendamento',
  'reuniao_conexao_sondagem',
  'proposta',
  'negociacao',
]

export function getActiveOpportunities(contacts: any[]): any[] {
  return contacts.filter((c) => c.type === 'prospect' && ACTIVE_STAGES.includes(c.pipeline_stage))
}

export function calcProgress(current: number, target: number): number {
  if (!target) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

export function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
