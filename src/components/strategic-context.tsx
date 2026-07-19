import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { savePlanning } from '@/services/planning'
import { useToast } from '@/hooks/use-toast'

const FIELDS = [
  { label: 'Missão', name: 'mission', rows: 2 },
  { label: 'Visão', name: 'vision', rows: 2 },
  { label: 'Valores', name: 'values', rows: 2 },
  { label: 'Estratégia', name: 'strategy', rows: 3 },
  { label: 'Prioridades', name: 'priorities', rows: 3 },
]

interface Props {
  planning: any
  onSaved: () => void
}

export function StrategicContext({ planning, onSaved }: Props) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData(e.currentTarget)
      await savePlanning(planning?.id, Object.fromEntries(formData))
      toast({ title: 'Planejamento salvo!' })
      onSaved()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  return (
    <Card className="border-border gold-accent-border">
      <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
        <CardTitle className="text-lg text-foreground">Canvas Estratégico</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label>{field.label}</Label>
              <Textarea
                name={field.name}
                defaultValue={planning[field.name] || ''}
                rows={field.rows}
                className="resize-none"
              />
            </div>
          ))}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Planejamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
