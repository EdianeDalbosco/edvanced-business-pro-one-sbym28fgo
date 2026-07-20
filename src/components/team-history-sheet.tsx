import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { UserPlus, UserMinus, ShieldCheck, Download, FileDown, FileSpreadsheet } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { exportTeamEventsCSV, exportTeamEventsPDF } from '@/lib/team-export'

const GOLD = '#D4AF37'

const actionConfig: Record<string, { label: string; icon: any; color: string }> = {
  member_added: { label: 'Membro Adicionado', icon: UserPlus, color: '#22c55e' },
  member_removed: { label: 'Membro Removido', icon: UserMinus, color: '#ef4444' },
  role_changed: { label: 'Função Alterada', icon: ShieldCheck, color: GOLD },
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  events: any[]
}

export function TeamHistorySheet({ open, onOpenChange, events }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Histórico de Gestão</SheetTitle>
          <SheetDescription>Registro de todas as alterações de membros da equipe.</SheetDescription>
          <div className="flex justify-end mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Download size={14} className="mr-1" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportTeamEventsCSV(events)}>
                  <FileSpreadsheet size={14} className="mr-2" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportTeamEventsPDF(events)}>
                  <FileDown size={14} className="mr-2" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-1 pr-4">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum evento registrado.
              </p>
            ) : (
              events.map((event, idx) => {
                const config = actionConfig[event.action] || actionConfig.role_changed
                const Icon = config.icon
                const targetName = event.expand?.target_user_id?.name || 'Usuário removido'
                const managerName = event.expand?.manager_id?.name || 'Desconhecido'
                return (
                  <div key={event.id} className="relative flex gap-4 pb-6">
                    {idx < events.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                    )}
                    <div
                      className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <Icon size={16} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{targetName}</span> · por {managerName}
                      </p>
                      {event.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">{event.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDate(event.created)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
