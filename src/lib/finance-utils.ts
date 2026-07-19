import { isCurrentMonth } from '@/lib/dashboard-utils'

export interface FinanceRecord {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  status: 'paid' | 'pending'
  cost_center: string
  document_number: string
  issue_date: string
  expense_classification: 'fixed' | 'variable' | ''
}

export type TxTabKey = 'income' | 'expense' | 'payable' | 'receivable'

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return d < today && !isToday(dateStr)
}

export function getMonthlyIncome(records: FinanceRecord[]): number {
  return records
    .filter((r) => r.type === 'income' && r.status === 'paid' && isCurrentMonth(r.date))
    .reduce((sum, r) => sum + r.amount, 0)
}

export function getMonthlyExpense(records: FinanceRecord[]): number {
  return records
    .filter((r) => r.type === 'expense' && r.status === 'paid' && isCurrentMonth(r.date))
    .reduce((sum, r) => sum + r.amount, 0)
}

export function getTotalBalance(records: FinanceRecord[]): number {
  const income = records
    .filter((r) => r.type === 'income' && r.status === 'paid')
    .reduce((s, r) => s + r.amount, 0)
  const expense = records
    .filter((r) => r.type === 'expense' && r.status === 'paid')
    .reduce((s, r) => s + r.amount, 0)
  return income - expense
}

export function getProjectedBalance(records: FinanceRecord[]): number {
  const balance = getTotalBalance(records)
  const pendingIncome = records
    .filter((r) => r.type === 'income' && r.status === 'pending')
    .reduce((s, r) => s + r.amount, 0)
  const pendingExpense = records
    .filter((r) => r.type === 'expense' && r.status === 'pending')
    .reduce((s, r) => s + r.amount, 0)
  return balance + pendingIncome - pendingExpense
}

export function filterByTab(records: FinanceRecord[], tab: TxTabKey): FinanceRecord[] {
  switch (tab) {
    case 'income':
      return records.filter((r) => r.type === 'income' && r.status === 'paid')
    case 'expense':
      return records.filter((r) => r.type === 'expense' && r.status === 'paid')
    case 'payable':
      return records.filter((r) => r.type === 'expense' && r.status === 'pending')
    case 'receivable':
      return records.filter((r) => r.type === 'income' && r.status === 'pending')
  }
}

export interface CashFlowPoint {
  date: string
  label: string
  income: number
  expense: number
  net: number
}

export function buildCashFlow(records: FinanceRecord[]): CashFlowPoint[] {
  const paidRecords = records.filter((r) => r.status === 'paid')
  const map: Record<string, { income: number; expense: number }> = {}

  paidRecords.forEach((r) => {
    const dStr = r.date ? new Date(r.date).toISOString().slice(0, 10) : ''
    if (!dStr) return
    if (!map[dStr]) map[dStr] = { income: 0, expense: 0 }
    if (r.type === 'income') map[dStr].income += r.amount
    else map[dStr].expense += r.amount
  })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({
      date,
      label: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    }))
}

export function getOverdueCount(records: FinanceRecord[]): number {
  return records.filter((r) => r.status === 'pending' && (isOverdue(r.date) || isToday(r.date)))
    .length
}
