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
import { Plus, Phone, Mail, Link as LinkIcon, FileText } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
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

      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">Contato</TableHead>
              <TableHead className="text-muted-foreground">Contratos</TableHead>
              <TableHead className="text-muted-foreground">Portal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
