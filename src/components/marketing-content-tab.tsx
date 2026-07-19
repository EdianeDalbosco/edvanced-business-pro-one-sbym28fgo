import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getCampaigns } from '@/services/campaigns'
import {
  getMarketingContent,
  deleteMarketingContent,
  getMediaFileUrl,
} from '@/services/marketing-content'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format'
import { MarketingContentDialog } from '@/components/marketing-content-dialog'
import { Plus, Trash2, Pencil, FileText, Film, ImageIcon } from 'lucide-react'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground max-w-xs'

const statusMap: Record<string, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  planned: { label: 'Planejado', className: 'bg-amber-500/20 text-amber-400' },
  published: { label: 'Publicado', className: 'bg-emerald-500/20 text-emerald-400' },
  archived: { label: 'Arquivado', className: 'bg-slate-500/20 text-slate-400' },
}

export function MarketingContentTab() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  ;(window as any).__pb = (window as any).__pb || {}
  if (user) (window as any).__pb.authStore = { record: user }

  const loadData = async () => {
    const [cmps, items] = await Promise.all([
      getCampaigns(),
      getMarketingContent(selectedCampaign || undefined),
    ])
    setCampaigns(cmps)
    setContent(items)
  }
  useEffect(() => {
    loadData()
  }, [selectedCampaign])
  useRealtime('marketing_content', loadData)
  useRealtime('campaigns', loadData)

  const handleDelete = async (id: string) => {
    if (confirm('Excluir conteúdo?')) {
      await deleteMarketingContent(id)
      toast({ title: 'Excluído' })
    }
  }

  const handleEdit = (item: any) => {
    setEditing(item)
    setDialogOpen(true)
  }

  const handleNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['mp4', 'mov', 'avi'].includes(ext || ''))
      return <Film size={14} className="text-sky-400" />
    if (['png', 'jpeg', 'jpg'].includes(ext || ''))
      return <ImageIcon size={14} className="text-emerald-400" />
    return <FileText size={14} className="text-rose-400" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas as campanhas</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button
          onClick={handleNew}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Conteúdo
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['draft', 'planned', 'published', 'archived'].map((s) => (
          <Card key={s} className="border-border">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {content.filter((c) => c.status === s).length}
              </div>
              <div className="text-sm text-muted-foreground">{statusMap[s]?.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Título</TableHead>
              <TableHead className="text-muted-foreground">Plataforma</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Agendado</TableHead>
              <TableHead className="text-muted-foreground">Mídia</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum conteúdo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              content.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {item.title}
                    <div className="text-xs text-muted-foreground font-normal line-clamp-1 max-w-xs">
                      {item.body || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.platform || '—'}</TableCell>
                  <TableCell>
                    <Badge className={statusMap[item.status]?.className || 'bg-muted'}>
                      {statusMap[item.status]?.label || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.scheduled_date ? formatDate(item.scheduled_date) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(item.media || []).slice(0, 3).map((m: string, i: number) => {
                        const url = getMediaFileUrl(item, m)
                        const ext = m.split('.').pop()?.toLowerCase()
                        if (['png', 'jpeg', 'jpg'].includes(ext || ''))
                          return (
                            <img
                              key={i}
                              src={url}
                              alt=""
                              className="w-8 h-8 rounded object-cover"
                            />
                          )
                        return (
                          <div
                            key={i}
                            className="w-8 h-8 rounded bg-muted flex items-center justify-center"
                          >
                            {getFileIcon(m)}
                          </div>
                        )
                      })}
                      {(item.media || []).length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{item.media.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-muted-foreground hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <MarketingContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaigns={campaigns}
        editing={editing}
        defaultCampaignId={selectedCampaign}
      />
    </div>
  )
}
