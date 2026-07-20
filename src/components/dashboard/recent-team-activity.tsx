import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, CheckCircle2, Phone, Mail, Calendar, FileText } from 'lucide-react'
import { formatDate } from '@/lib/format'

const GOLD = '#D4AF37'

const interactionIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
}

const statusLabels: Record<string, string> = {
  nao_iniciado: 'Não Iniciado',
  em_andamento: 'Em Andamento',
  aguardando: 'Aguardando',
  concluido: 'Concluído',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
}

export function RecentTeamActivity({ activities }: { activities: any[] }) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Activity size={20} style={{ color: GOLD }} /> Atividade Recente da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade recente.
          </p>
        ) : (
          activities.map((a) => {
            const isTask = a.type === 'task'
            const Icon = isTask ? CheckCircle2 : interactionIcons[a.interaction_type] || FileText
            return (
              <div
                key={`${a.type}-${a.id}`}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div
                  className="mt-0.5 p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${GOLD}15` }}
                >
                  <Icon size={14} style={{ color: GOLD }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {isTask ? a.title : a.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.user_name} · {formatDate(a.created)}
                    {isTask && a.status ? ` · ${statusLabels[a.status] || a.status}` : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
