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
import { Plus, Phone, Mail, Link as LinkIcon, FileText, Eye, Edit, Trash } from 'lucide-react'
import { ExportButtons } from '@/components/export-buttons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateContact, deleteContact } from '@/services/contacts'
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
  const [editOpen, setEditOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<any>(null)
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

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await updateContact(editingClient.id, data)
      setEditOpen(false)
      toast({ title: 'Cliente atualizado!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteContact(deletingClient.id)
      setDeleteConfirmOpen(false)
      toast({ title: 'Cliente excluído!' })
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
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
        headers: ['Nome', 'Status', 'Email', 'Telefone', 'Situação', 'Contratos', 'Valor Total'],
        rows: clients.map((c) => {
          const ct = clientContracts(c.id)
          const totalValue = ct.reduce((acc, c2) => acc + (Number(c2.value) || 0), 0)
          return [
            c.name,
            c.status === 'inativo' ? 'Inativo' : 'Ativo',
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
        headers: [
          'Nome',
          'Status',
          'Email',
          'Telefone',
          'Situação',
          'Qtd Contratos',
          'Valor Total',
        ],
        rows: clients.map((c) => {
          const ct = clientContracts(c.id)
          const totalValue = ct.reduce((acc, c2) => acc + (Number(c2.value) || 0), 0)
          return [
            c.name,
            c.status === 'inativo' ? 'Inativo' : 'Ativo',
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
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="ativo">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
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
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Funil</TableHead>
              <TableHead className="text-muted-foreground">Contato</TableHead>
              <TableHead className="text-muted-foreground">Contratos</TableHead>
              <TableHead className="text-muted-foreground">Portal</TableHead>
              <TableHead className="text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                      {c.status === 'inativo' ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inativo
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-primary/30 text-primary hover:bg-primary/10"
                          title="Detalhes"
                          onClick={() => {
                            setSelectedClient(c)
                            setDetailOpen(true)
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                          title="Editar"
                          onClick={() => {
                            setEditingClient(c)
                            setEditOpen(true)
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-500/30 text-red-500 hover:bg-red-500/10"
                          title="Excluir"
                          onClick={() => {
                            setDeletingClient(c)
                            setDeleteConfirmOpen(true)
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <ClientDetailSheet client={selectedClient} open={detailOpen} onOpenChange={setDetailOpen} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input name="name" defaultValue={editingClient.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" name="email" defaultValue={editingClient.email} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input name="phone" defaultValue={editingClient.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editingClient.status || 'ativo'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar Alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{deletingClient?.name}</strong>? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
