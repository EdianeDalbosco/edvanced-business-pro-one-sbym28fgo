import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getContacts, createContact, updateContact } from '@/services/contacts'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Plus, Phone, Mail, Link as LinkIcon, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const STAGES = [
  { id: 'new', label: 'Novo Contato', color: 'bg-slate-100 border-slate-200 text-slate-700' },
  {
    id: 'negotiation',
    label: 'Em Negociação',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  { id: 'proposal', label: 'Proposta Enviada', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'closed', label: 'Fechado', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
]

export default function CRM() {
  const [contacts, setContacts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => setContacts(await getContacts())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('contacts', loadData)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData)
      await createContact(data)
      setDialogOpen(false)
      toast({ title: 'Contato adicionado com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const copyPortalLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/portal/${token}`)
    toast({ title: 'Link copiado para a área de transferência!' })
  }

  const prospects = contacts.filter((c) => c.type === 'prospect')
  const clients = contacts.filter((c) => c.type === 'client')

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">CRM</h1>
          <p className="text-slate-500">Prospecções, negociações e carteira de clientes.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Contato</DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <select
                    name="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="client">Cliente Ativo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fase (se Prospect)</Label>
                  <select
                    name="pipeline_stage"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Salvar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2 bg-slate-200">
          <TabsTrigger value="pipeline">Pipeline (Prospecções)</TabsTrigger>
          <TabsTrigger value="clients">Clientes Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
            {STAGES.map((stage) => (
              <div
                key={stage.id}
                className={`flex-none w-80 rounded-xl border ${stage.color} p-4 snap-start flex flex-col h-[calc(100vh-280px)]`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h3>
                  <Badge variant="outline" className="bg-white/50">
                    {prospects.filter((p) => p.pipeline_stage === stage.id).length}
                  </Badge>
                </div>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {prospects
                    .filter((p) => p.pipeline_stage === stage.id)
                    .map((p) => (
                      <Card
                        key={p.id}
                        className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 bg-white border-slate-200"
                      >
                        <CardContent className="p-4">
                          <div className="font-medium text-slate-800 flex items-center gap-2 mb-2">
                            <Building size={16} className="text-slate-400" />
                            {p.name}
                          </div>
                          {p.email && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Mail size={12} /> {p.email}
                            </div>
                          )}
                          {p.phone && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <Phone size={12} /> {p.phone}
                            </div>
                          )}
                          <select
                            className="mt-3 text-xs w-full border-slate-200 rounded p-1 bg-slate-50 text-slate-600"
                            value={p.pipeline_stage}
                            onChange={(e) =>
                              updateContact(p.id, { pipeline_stage: e.target.value })
                            }
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Mover para {s.label}
                              </option>
                            ))}
                          </select>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nome do Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Portal do Cliente</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Nenhum cliente ativo.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium text-slate-800">{c.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">{c.email}</div>
                        <div className="text-xs text-slate-500">{c.phone}</div>
                      </TableCell>
                      <TableCell>
                        {c.portal_token ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPortalLink(c.portal_token)}
                            className="h-8"
                          >
                            <LinkIcon size={14} className="mr-2" /> Copiar Link Público
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Sem portal</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
