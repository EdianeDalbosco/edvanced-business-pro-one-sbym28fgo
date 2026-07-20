import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, CheckCheck, Trash2, CheckCircle2, Target } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

const GOLD = '#D4AF37'

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } =
    useNotifications()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-primary">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-fade-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: GOLD }} />
            <span className="font-semibold text-foreground">Notificações</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">({unreadCount} novas)</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={14} className="mr-1" /> Marcar todas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-500"
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell size={32} className="text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/30',
                    !n.read && 'bg-primary/5',
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div
                    className="mt-0.5 p-1.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${GOLD}15` }}
                  >
                    {n.type === 'task_completed' ? (
                      <CheckCircle2 size={14} style={{ color: GOLD }} />
                    ) : (
                      <Target size={14} style={{ color: GOLD }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDate(n.created)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
