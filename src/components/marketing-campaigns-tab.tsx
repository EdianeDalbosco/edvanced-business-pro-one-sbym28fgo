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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getCampaigns, createCampaign, deleteCampaign } from '@/services/campaigns'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/format'
import { Plus, Trash2, Megaphone, TrendingUp, CircleDollarSign } from 'lucide-react'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

const statusMap: Record<string, { label: string; className: string }> = {
  planning: { label: 'Planejamento', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Ativa', className: 'bg-emerald-500 text-white' },
  completed: { label: 'Concluída', className: 'bg-sky-500/20 text-sky-400' },
  paused: { label: 'Pausada', className: 'bg-amber-500/20 text-amber-400' },
}

export function MarketingCampaignsTab() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => setCampaigns(await getCampaigns())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('campaigns', loadData)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await createCampaign({ ...data, budget: Number(data.budget) || 0 })
      setDialogOpen(false)
      toast({ title: 'Campanha criada!' })
    } catch {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir campanha?')) {
      await deleteCampaign(id)
      toast({ title: 'Excluída' })
    }
  }

  const active = campaigns.filter((c) => c.status === 'active').length
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input name="description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Input name="channel" />
                </div>
                <div className="space-y-2">
                  <Label>Orçamento (R$)</Label>
                  <Input type="number" step="0.01" name="budget" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input type="date" name="start_date" />
                </div>
                <div className="space-y-2">
                  <Label>Término</Label>
                  <Input type="date" name="end_date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select name="status" className={selectClass} defaultValue="planning">
                  <option value="planning">Planejamento</option>
                  <option value="active">Ativa</option>
                  <option value="completed">Concluída</option>
                  <option value="paused">Pausada</option>
                </select>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Megaphone className="text-primary" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{campaigns.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{active}</div>
              <div className="text-sm text-muted-foreground">Ativas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <CircleDollarSign className="text-sky-500" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(totalBudget)}
              </div>
              <div className="text-sm text-muted-foreground">Investimento</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Campanha</TableHead>
              <TableHead className="text-muted-foreground">Canal</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Orçamento</TableHead>
              <TableHead className="text-muted-foreground">Período</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma campanha cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {c.name}
                    <div className="text-xs text-muted-foreground font-normal">{c.description}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.channel || '—'}</TableCell>
                  <TableCell>
                    <Badge
                      className={statusMap[c.status]?.className || 'bg-muted text-muted-foreground'}
                    >
                      {statusMap[c.status]?.label || c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    {c.budget ? formatCurrency(c.budget) : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.start_date ? formatDate(c.start_date) : '—'} →{' '}
                    {c.end_date ? formatDate(c.end_date) : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id)}
                      className="text-muted-foreground hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
