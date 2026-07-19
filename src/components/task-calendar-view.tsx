import { useState } from 'react'
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TYPE_ICONS, TYPE_LABELS } from '@/lib/task-utils'

interface Props {
  tasks: any[]
  onEdit: (task: any) => void
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function getTasksForDate(tasks: any[], date: Date): any[] {
  const dateStr = date.toDateString()
  return tasks.filter((t) => {
    if (!t.due_date && !t.start_date) return false
    const ref = t.due_date || t.start_date
    const due = new Date(ref)
    if (due.toDateString() === dateStr) return true
    if (t.recurrence === 'daily' && due <= date) return true
    if (t.recurrence === 'weekly' && due <= date) {
      const diff = Math.floor((date.getTime() - due.getTime()) / 86400000)
      return diff % 7 === 0
    }
    return false
  })
}

export function TaskCalendarView({ tasks, onEdit }: Props) {
  const [current, setCurrent] = useState(new Date())
  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: { date: Date; isCurrent: boolean }[] = []
  for (let i = startWeekday - 1; i >= 0; i--)
    cells.push({ date: new Date(year, month, -i), isCurrent: false })
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ date: new Date(year, month, d), isCurrent: true })
  while (cells.length % 7 !== 0)
    cells.push({
      date: new Date(year, month + 1, cells.length - daysInMonth - startWeekday + 1),
      isCurrent: false,
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrent(new Date())}>
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const dayTasks = getTasksForDate(tasks, cell.date)
          const isToday = cell.date.toDateString() === today.toDateString()
          return (
            <div
              key={i}
              className={cn(
                'min-h-[100px] border rounded-lg p-1.5 overflow-hidden',
                cell.isCurrent
                  ? 'bg-card border-border'
                  : 'bg-muted/20 border-border/50 opacity-50',
                isToday && 'ring-2 ring-primary/50',
              )}
            >
              <div
                className={cn(
                  'text-xs mb-1',
                  isToday ? 'font-bold text-primary' : 'text-muted-foreground',
                )}
              >
                {cell.date.getDate()}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onEdit(t)}
                    className={cn(
                      'w-full text-left text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1',
                      'bg-muted/50 border-border/50 hover:bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        TYPE_ICONS[t.type || 'task'],
                      )}
                    />
                    {t.recurrence && t.recurrence !== 'none' && (
                      <Repeat size={8} className="flex-shrink-0" />
                    )}
                    <span className="truncate">{t.title}</span>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{dayTasks.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
