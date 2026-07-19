import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { getContracts, createContract } from '@/services/contracts'
import { getContacts } from '@/services/contacts'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Plus, Download, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/format'
import pb from '@/lib/pocketbase/client'

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    setContracts(await getContracts())
    setContacts(await getContacts())
  }
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('contracts', async () => setContracts(await getContracts()))

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    try {
      const form = e.currentTarget
      const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
      const formData = new FormData(form)
      if (!fileInput.files?.[0]) formData.delete('file')

      await createContract(formData)
      setDialogOpen(false)
      toast({ title: 'Contrato salvo com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setUploading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500">Ativo</Badge>
      case 'expired':
        return (
          <Badge variant="secondary" className="text-amber-600 bg-amber-100">
            Expirado
          </Badge>
        )
      case 'terminated':
        return <Badge variant="destructive">Rescindido</Badge>
      default:
        return <Badge variant="outline">Rascunho</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contratos</h1>
          <p className="text-slate-500">Gestão e armazenamento de documentos jurídicos.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Anexar Contrato</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Título / Objeto</Label>
                <Input name="title" required />
              </div>
              <div className="space-y-2">
                <Label>Cliente / Contato</Label>
                <select
                  name="contact_id"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (Opcional)</Label>
                  <Input type="number" step="0.01" name="value" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    name="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativo</option>
                    <option value="expired">Expirado</option>
                    <option value="terminated">Rescindido</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Arquivo (PDF)</Label>
                <Input type="file" name="file" accept=".pdf" />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Enviando...' : 'Salvar Contrato'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Arquivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  Nenhum contrato arquivado.
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" /> {c.title}
                  </TableCell>
                  <TableCell>{c.expand?.contact_id?.name || '-'}</TableCell>
                  <TableCell>{formatDate(c.created)}</TableCell>
                  <TableCell>{c.value ? formatCurrency(c.value) : '-'}</TableCell>
                  <TableCell>{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="text-right">
                    {c.file ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <a href={pb.files.getUrl(c, c.file)} target="_blank" download>
                          <Download size={16} className="mr-2" /> Baixar
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">Sem anexo</span>
                    )}
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
