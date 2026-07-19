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
import { Plus, Phone, UserCheck, GripVertical } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

const STAGES = [
  { id: 'prospeccao', label: 'Prospecção', color: 'border-t-blue-600' },
  { id: 'abordagem', label: 'Abordagem', color: 'border-t-blue-600' },
  { id: 'agendamento', label: 'Agendamento', color: 'border-t-blue-600' },
  {
    id: 'reuniao_conexao_sondagem',
    label: 'Reunião de Conexão + Sondagem',
    color: 'border-t-blue-600',
  },
  { id: 'proposta', label: 'Proposta', color: 'border-t-blue-600' },
  { id: 'negociacao', label: 'Negociação', color: 'border-t-blue-600' },
  { id: 'fechamento', label: 'Fechamento', color: 'border-t-emerald-500' },
  { id: 'no_show', label: 'No-Show', color: 'border-t-red-500' },
]

export default function Pipeline() {
  const [prospects, setProspects] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
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
      if (data.value) data.value = Number(data.value)
      await createContact({ ...data, type: 'prospect' })
      setDialogOpen(false)
      toast({ title: 'Oportunidade adicionada!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleConvert = async (id: string) => {
    await convertToClient(id)
    toast({ title: 'Convertido para cliente!' })
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverStage !== stageId) setDragOverStage(stageId)
  }

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || draggedId
    setDraggedId(null)
    setDragOverStage(null)
    if (!id) return
    const contact = prospects.find((p) => p.id === id)
    if (!contact || contact.pipeline_stage === stageId) return
    try {
      await updateContact(id, { pipeline_stage: stageId })
      toast({ title: `Movido para ${STAGES.find((s) => s.id === stageId)?.label}` })
    } catch {
      toast({ title: 'Erro ao mover', variant: 'destructive' })
    }
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStage(null)
  }

  return (
    <div className="space-y-8 animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline de Vendas</h1>
          <p className="text-muted-foreground">
            Arraste e solte oportunidades entre as etapas do funil.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Oportunidade</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome / Empresa</Label>
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
                <Label>Valor (R$)</Label>
                <Input type="number" name="value" step="0.01" min="0" />
              </div>
              <input type="hidden" name="pipeline_stage" value="prospeccao" />
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

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x flex-1 items-stretch">
        {STAGES.map((stage) => {
          const stageProspects = prospects.filter((p) => p.pipeline_stage === stage.id)
          const totalValue = stageProspects.reduce((acc, p) => acc + (Number(p.value) || 0), 0)
          const totalDays = stageProspects.reduce((acc, p) => {
            const days = Math.floor(
              (new Date().getTime() - new Date(p.created).getTime()) / (1000 * 3600 * 24),
            )
            return acc + days
          }, 0)
          const avgDays = stageProspects.length ? Math.round(totalDays / stageProspects.length) : 0
          const isDragOver = dragOverStage === stage.id
          const isNoShow = stage.id === 'no_show'

          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
              className={cn(
                'flex-none w-[300px] rounded-lg border bg-muted/20 border-t-[3px] p-3 snap-start flex flex-col transition-all duration-200',
                stage.color,
                isDragOver && 'ring-2 ring-primary/60 bg-primary/5 scale-[1.02]',
                isNoShow && 'bg-red-500/5',
              )}
            >
              <div className="flex flex-col gap-2 mb-4 shrink-0">
                <div className="flex justify-between items-center">
                  <h3
                    className={cn(
                      'font-semibold text-sm truncate pr-2',
                      isNoShow && 'text-red-600',
                    )}
                  >
                    {stage.label}
                  </h3>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {stageProspects.length}
                  </Badge>
                </div>
                <div className="text-xs font-medium text-muted-foreground flex justify-between items-center">
                  <span>{formatCurrency(totalValue)}</span>
                  <span className="text-[10px] text-muted-foreground/60 border rounded px-1.5 py-0.5">
                    Média: {avgDays} dias
                  </span>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {stageProspects.map((p) => (
                  <Card
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:-translate-y-0.5 bg-card border-border',
                      draggedId === p.id && 'opacity-40',
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-1.5 mb-1">
                        <GripVertical
                          size={12}
                          className="text-muted-foreground/40 mt-0.5 shrink-0"
                        />
                        <div className="font-medium text-sm text-foreground truncate flex-1">
                          {p.name}
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-foreground mb-3 pl-[18px]">
                        {formatCurrency(Number(p.value) || 0)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pl-[18px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone size={10} />
                          <span className="truncate">{p.phone || 'Sem telefone'}</span>
                        </div>
                      </div>

                      <select
                        className="mt-3 text-[11px] w-full border-border rounded p-1.5 bg-muted text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                        value={p.pipeline_stage}
                        onChange={(e) => updateContact(p.id, { pipeline_stage: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            Mover para {s.label}
                          </option>
                        ))}
                      </select>

                      {p.pipeline_stage === 'fechamento' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2 w-full text-xs h-7 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConvert(p.id)
                          }}
                        >
                          <UserCheck size={12} className="mr-1.5" /> Converter p/ Cliente
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {stageProspects.length === 0 && (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-muted-foreground/20 rounded-lg text-xs text-muted-foreground/50">
                    Solte aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
