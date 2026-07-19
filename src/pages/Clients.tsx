import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getClients, createContact } from '@/services/contacts'
import { getContracts } from '@/services/contracts'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Plus, Phone, Mail, Link as LinkIcon, FileText, Eye } from 'lucide-react'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'
import { ClientDetailSheet } from '@/components/client-detail-sheet'
import { formatCurrency } from '@/lib/format'

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

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    const [c, ct] = await Promise.all([getClients(), getContracts()])
    setClients(c)
    setContracts(ct)
  }
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('contacts', loadData)
  useRealtime('contracts', loadData)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await createContact({ ...data, type: 'client', pipeline_stage: 'closed' })
      setDialogOpen(false)
      toast({ title: 'Cliente adicionado!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const copyPortalLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${token}`)
    toast({ title: 'Link copiado!' })
  }

  const handleExportPDF = () => {
    generatePDF(getBusinessName(), 'Clientes', [
      {
        type: 'table',
        title: 'Lista de Clientes',
        headers: ['Nome', 'Email', 'Telefone', 'Situação', 'Contratos', 'Valor Total'],
        rows: clients.map((c) => {
          const ct = clientContracts(c.id)
          const totalValue = ct.reduce((acc, c2) => acc + (Number(c2.value) || 0), 0)
          return [
            c.name,
            c.email || '',
            c.phone || '',
            STAGE_LABELS[c.pipeline_stage] || c.pipeline_stage || '',
            String(ct.length),
            formatCurrency(totalValue),
          ]
        }),
      },
    ])
  }

  const handleExportExcel = () => {
    exportToExcel('clientes', [
      {
        name: 'Clientes',
        headers: ['Nome', 'Email', 'Telefone', 'Situação', 'Qtd Contratos', 'Valor Total'],
        rows: clients.map((c) => {
          const ct = clientContracts(c.id)
          const totalValue = ct.reduce((acc, c2) => acc + (Number(c2.value) || 0), 0)
          return [
            c.name,
            c.email || '',
            c.phone || '',
            STAGE_LABELS[c.pipeline_stage] || c.pipeline_stage || '',
            ct.length,
            totalValue,
          ]
        }),
      },
    ])
  }

  const clientContracts = (clientId: string) => contracts.filter((c) => c.contact_id === clientId)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Carteira de clientes ativos e contratos vinculados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input name="name" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" name="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input name="phone" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">Situação</TableHead>
              <TableHead className="text-muted-foreground">Contato</TableHead>
              <TableHead className="text-muted-foreground">Contratos</TableHead>
              <TableHead className="text-muted-foreground">Portal</TableHead>
              <TableHead className="text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente ativo.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => {
                const ct = clientContracts(c.id)
                return (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {STAGE_LABELS[c.pipeline_stage] || c.pipeline_stage || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.email && (
                        <div className="text-sm text-foreground flex items-center gap-1">
                          <Mail size={12} /> {c.email}
                        </div>
                      )}
                      {c.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone size={12} /> {c.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {ct.length > 0 ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          <FileText size={12} className="mr-1" /> {ct.length}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.portal_token ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPortalLink(c.portal_token)}
                          className="h-8 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <LinkIcon size={14} className="mr-2" /> Copiar Link
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem portal</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => {
                          setSelectedClient(c)
                          setDetailOpen(true)
                        }}
                      >
                        <Eye size={14} className="mr-1" /> Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <ClientDetailSheet client={selectedClient} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}
