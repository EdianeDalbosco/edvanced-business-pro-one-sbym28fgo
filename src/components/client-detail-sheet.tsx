import { useEffect, useState, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, User } from 'lucide-react'
import { getContracts } from '@/services/contracts'
import { getFinanceByContact } from '@/services/finance'
import { getTasksByContact } from '@/services/tasks'
import { getInteractions } from '@/services/client-interactions'
import { useRealtime } from '@/hooks/use-realtime'
import { ClientContractsTab } from '@/components/client-contracts-tab'
import { ClientPaymentsTab } from '@/components/client-payments-tab'
import { ClientInteractionsTab } from '@/components/client-interactions-tab'
import { ClientTasksTab } from '@/components/client-tasks-tab'

const STAGE_LABELS: Record<string, string> = {
  prospeccao: 'Prospecção',
  abordagem: 'Abordagem',
  agendamento: 'Agendamento',
  reuniao_conexao_sondagem: 'Reunião de Conexão + Sondagem',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  fechamento: 'Fechamento',
  no_show: 'No-Show',
  closed: 'Fechado',
}

interface ClientDetailSheetProps {
  client: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailSheet({ client, open, onOpenChange }: ClientDetailSheetProps) {
  const [contracts, setContracts] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [interactions, setInteractions] = useState<any[]>([])

  const clientId = client?.id || ''

  const loadData = useCallback(async () => {
    if (!clientId) return
    const [allContracts, fin, tks, inter] = await Promise.all([
      getContracts(),
      getFinanceByContact(clientId),
      getTasksByContact(clientId),
      getInteractions(clientId),
    ])
    setContracts(allContracts.filter((c: any) => c.contact_id === clientId))
    setPayments(fin)
    setTasks(tks)
    setInteractions(inter)
  }, [clientId])

  useEffect(() => {
    if (open && clientId) loadData()
  }, [open, clientId, loadData])

  useRealtime('contracts', () => {
    if (open) loadData()
  })
  useRealtime('finance', () => {
    if (open) loadData()
  })
  useRealtime('tasks', () => {
    if (open) loadData()
  })
  useRealtime('client_interactions', () => {
    if (open) loadData()
  })

  if (!client) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle className="text-xl font-bold text-foreground">{client.name}</SheetTitle>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="border-primary/30 text-primary">
              <User size={12} className="mr-1" />{' '}
              {client.type === 'client' ? 'Cliente' : 'Prospect'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {STAGE_LABELS[client.pipeline_stage] || client.pipeline_stage || '—'}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 mt-3 text-sm">
            {client.email && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone size={14} /> {client.phone}
              </span>
            )}
          </div>
        </SheetHeader>
        <div className="p-6">
          <Tabs defaultValue="contracts" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-4">
              <TabsTrigger value="contracts" className="text-xs">
                Contratos
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs">
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                Histórico
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs">
                Ações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="contracts">
              <ClientContractsTab contracts={contracts} />
            </TabsContent>
            <TabsContent value="payments">
              <ClientPaymentsTab payments={payments} />
            </TabsContent>
            <TabsContent value="history">
              <ClientInteractionsTab interactions={interactions} contactId={clientId} />
            </TabsContent>
            <TabsContent value="tasks">
              <ClientTasksTab tasks={tasks} contactId={clientId} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
