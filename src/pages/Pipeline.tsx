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
import { Badge } from '@/components/ui/badge'
import { getProspects, createContact, updateContact, convertToClient } from '@/services/contacts'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Plus, Phone, Mail, Building, UserCheck } from 'lucide-react'

const STAGES = [
  { id: 'new', label: 'Novo Contato', color: 'bg-muted/30 border-border text-muted-foreground' },
  {
    id: 'negotiation',
    label: 'Em Negociação',
    color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  },
  {
    id: 'proposal',
    label: 'Proposta Enviada',
    color: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  },
  {
    id: 'closed',
    label: 'Fechado',
    color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
]

export default function Pipeline() {
  const [prospects, setProspects] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => setProspects(await getProspects())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('contacts', loadData)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await createContact({ ...data, type: 'prospect' })
      setDialogOpen(false)
      toast({ title: 'Prospect adicionado!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleConvert = async (id: string) => {
    await convertToClient(id)
    toast({ title: 'Convertido para cliente!' })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline (CRM)</h1>
          <p className="text-muted-foreground">Gerencie suas prospecções e negociações.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Novo Prospect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Prospect</DialogTitle>
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
              <input type="hidden" name="pipeline_stage" value="new" />
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

      <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            className={`flex-none w-80 rounded-xl border ${stage.color} p-4 snap-start flex flex-col h-[calc(100vh-280px)]`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h3>
              <Badge variant="outline" className="bg-white/5">
                {prospects.filter((p) => p.pipeline_stage === stage.id).length}
              </Badge>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {prospects
                .filter((p) => p.pipeline_stage === stage.id)
                .map((p) => (
                  <Card
                    key={p.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 bg-card border-border"
                  >
                    <CardContent className="p-4">
                      <div className="font-medium text-foreground flex items-center gap-2 mb-2">
                        <Building size={16} className="text-primary" />
                        {p.name}
                      </div>
                      {p.email && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Mail size={12} /> {p.email}
                        </div>
                      )}
                      {p.phone && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Phone size={12} /> {p.phone}
                        </div>
                      )}
                      <select
                        className="mt-3 text-xs w-full border-border rounded p-1 bg-background text-muted-foreground"
                        value={p.pipeline_stage}
                        onChange={(e) => updateContact(p.id, { pipeline_stage: e.target.value })}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Mover para {s.label}
                          </option>
                        ))}
                      </select>
                      {p.pipeline_stage === 'closed' && (
                        <Button
                          size="sm"
                          className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleConvert(p.id)}
                        >
                          <UserCheck size={14} className="mr-1" /> Converter para Cliente
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
