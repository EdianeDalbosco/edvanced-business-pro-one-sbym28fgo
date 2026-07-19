import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createMarketingContent, updateMarketingContent } from '@/services/marketing-content'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Upload, X, FileText, Film, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'
const ALLOWED = ['.pdf', '.png', '.jpeg', '.jpg', '.mp4', '.mov', '.avi']

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  campaigns: any[]
  editing?: any | null
  defaultCampaignId?: string
}

export function MarketingContentDialog({
  open,
  onOpenChange,
  campaigns,
  editing,
  defaultCampaignId,
}: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFiles = (list: File[]) => {
    return list.filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return ALLOWED.includes(ext)
    })
  }

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    const valid = validateFiles(Array.from(newFiles))
    setFiles((prev) => [...prev, ...valid])
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const userId = (window as any).__pb?.authStore?.record?.id
    if (!editing) form.append('user_id', userId || '')
    files.forEach((f) => form.append('media', f))
    try {
      if (editing) {
        await updateMarketingContent(editing.id, form)
        toast({ title: 'Conteúdo atualizado!' })
      } else {
        await createMarketingContent(form)
        toast({ title: 'Conteúdo criado!' })
      }
      setFiles([])
      onOpenChange(false)
    } catch (err) {
      toast({ title: getErrorMessage(err), variant: 'destructive' })
    }
  }

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return <Film size={20} />
    if (['png', 'jpeg', 'jpg'].includes(ext || '')) return <ImageIcon size={20} />
    return <FileText size={20} />
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setFiles([])
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Conteúdo' : 'Novo Conteúdo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input name="title" defaultValue={editing?.title || ''} required />
          </div>
          <div className="space-y-2">
            <Label>Legenda / Corpo</Label>
            <Textarea name="body" rows={3} defaultValue={editing?.body || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Input
                name="platform"
                placeholder="Ex: Instagram"
                defaultValue={editing?.platform || ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Agendada</Label>
              <Input
                type="date"
                name="scheduled_date"
                defaultValue={editing?.scheduled_date || ''}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campanha</Label>
              <select
                name="campaign_id"
                className={selectClass}
                defaultValue={editing?.campaign_id || defaultCampaignId || ''}
                required
              >
                <option value="">Selecione...</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                className={selectClass}
                defaultValue={editing?.status || 'draft'}
              >
                <option value="draft">Rascunho</option>
                <option value="planned">Planejado</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mídia (PDF, PNG, JPEG, MP4, MOV, AVI)</Label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                handleFiles(e.dataTransfer.files)
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              )}
            >
              <Upload className="mx-auto mb-2 text-muted-foreground" size={24} />
              <p className="text-sm text-muted-foreground">
                Arraste arquivos ou clique para selecionar
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                accept={ALLOWED.join(',')}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-1.5"
                  >
                    {getFileIcon(f.name)}
                    <span className="flex-1 truncate text-foreground">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <X size={14} className="text-muted-foreground hover:text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
  )
}
