import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/format'
import { createInteraction } from '@/services/client-interactions'
import { useToast } from '@/hooks/use-toast'
import { Phone, Mail, Users, StickyNote, Plus, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  call: { label: 'Ligação', icon: Phone, color: 'text-blue-400' },
  email: { label: 'E-mail', icon: Mail, color: 'text-purple-400' },
  meeting: { label: 'Reunião', icon: Users, color: 'text-emerald-400' },
  note: { label: 'Nota', icon: StickyNote, color: 'text-amber-400' },
}

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

export function ClientInteractionsTab({
  interactions,
  contactId,
}: {
  interactions: any[]
  contactId: string
}) {
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget))
      await createInteraction({
        contact_id: contactId,
        date: new Date(data.date as string).toISOString(),
        type: data.type,
        description: data.description,
      })
      setShowForm(false)
      toast({ title: 'Interação registrada!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" /> Nova Interação
        </Button>
      </div>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 p-4 rounded-lg border border-border bg-muted/30"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <select name="type" className={selectClass} required>
                <option value="call">Ligação</option>
                <option value="email">E-mail</option>
                <option value="meeting">Reunião</option>
                <option value="note">Nota</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descrição</Label>
            <Textarea name="description" required rows={2} placeholder="Descreva a interação..." />
          </div>
          <Button type="submit" size="sm" className="w-full">
            Salvar Interação
          </Button>
        </form>
      )}
      {interactions.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhuma interação registrada.</p>
      ) : (
        <div className="space-y-3">
          {interactions.map((inter) => {
            const cfg = TYPE_CONFIG[inter.type] || TYPE_CONFIG.note
            return (
              <div
                key={inter.id}
                className="flex gap-3 p-3 rounded-lg border border-border bg-card"
              >
                <div className={cn('mt-0.5', cfg.color)}>
                  <cfg.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} /> {formatDate(inter.date)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{inter.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
