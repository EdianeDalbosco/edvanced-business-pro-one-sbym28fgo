import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export interface Notification {
  id: string
  type: 'task_completed' | 'goal_reached'
  title: string
  message: string
  created: string
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const isManager = user?.role === 'manager'

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('ebp_notifications')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const taskStatusRef = useRef<Map<string, string>>(new Map())
  const goalProgressRef = useRef<Map<string, number>>(new Map())
  const prevUserIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    try {
      localStorage.setItem('ebp_notifications', JSON.stringify(notifications.slice(0, 50)))
    } catch {
      /* intentionally ignored */
    }
  }, [notifications])

  useEffect(() => {
    if (prevUserIdRef.current !== user?.id) {
      setNotifications([])
      taskStatusRef.current.clear()
      goalProgressRef.current.clear()
      prevUserIdRef.current = user?.id
    }
  }, [user?.id])

  useEffect(() => {
    if (!isManager) return
    pb.collection('tasks')
      .getFullList()
      .then((records) => {
        records.forEach((r) => taskStatusRef.current.set(r.id, r.status))
      })
      .catch(() => {})
    pb.collection('goals')
      .getFullList()
      .then((records) => {
        records.forEach((r) => goalProgressRef.current.set(r.id, Number(r.progress_percent) || 0))
      })
      .catch(() => {})
  }, [isManager])

  const addNotification = (notif: Notification) =>
    setNotifications((prev) => [notif, ...prev].slice(0, 50))

  useRealtime(
    'tasks',
    (e) => {
      if (!isManager) return
      if (e.action !== 'update' && e.action !== 'create') return
      const taskId = e.record.id
      const newStatus = e.record.status
      const oldStatus = taskStatusRef.current.get(taskId)
      if (newStatus === 'concluido' && oldStatus !== 'concluido') {
        addNotification({
          id: `task-${taskId}-${Date.now()}`,
          type: 'task_completed',
          title: 'Tarefa Concluída',
          message: `"${e.record.title}" foi marcada como concluída.`,
          created: new Date().toISOString(),
          read: false,
        })
      }
      taskStatusRef.current.set(taskId, newStatus)
    },
    isManager,
  )

  useRealtime(
    'goals',
    (e) => {
      if (!isManager) return
      if (e.action !== 'update' && e.action !== 'create') return
      const goalId = e.record.id
      const newProgress = Number(e.record.progress_percent) || 0
      const oldProgress = goalProgressRef.current.get(goalId) ?? 0
      if (newProgress >= 100 && oldProgress < 100) {
        addNotification({
          id: `goal-${goalId}-${Date.now()}`,
          type: 'goal_reached',
          title: 'Meta Atingida! 🎉',
          message: `"${e.record.title}" atingiu 100% de progresso!`,
          created: new Date().toISOString(),
          read: false,
        })
      }
      goalProgressRef.current.set(goalId, newProgress)
    },
    isManager,
  )

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const markAllAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const clearNotifications = () => setNotifications([])
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
