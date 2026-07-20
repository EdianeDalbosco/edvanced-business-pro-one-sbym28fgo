import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/format'
import type { TeamEvent } from '@/services/team'

interface TeamActivityLogProps {
  events: TeamEvent[]
}

const ACTION_LABELS: Record<string, string> = {
  member_added: 'Membro adicionado',
  member_removed: 'Membro removido',
  role_changed: 'Função alterada',
}

export function TeamActivityLog({ events }: TeamActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {ACTION_LABELS[event.action] ?? event.action}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{event.details}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.created)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
