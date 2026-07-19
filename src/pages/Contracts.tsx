import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getContracts, deleteContract, getContractFileUrl } from '@/services/contracts'
import { getContacts } from '@/services/contacts'
import { getProducts } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/format'
import { ContractFormDialog } from '@/components/contract-form'
import { Plus, Trash2, FileText, Eye, Download, ShieldCheck } from 'lucide-react'

const statusMap: Record<string, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  active: { label: 'Vigente', className: 'bg-emerald-500 text-white' },
  expired: { label: 'Expirado', className: 'bg-rose-500/20 text-rose-400' },
  terminated: { label: 'Rescindido', className: 'bg-rose-500/20 text-rose-400' },
}

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewing, setViewing] = useState<any | null>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const [c, ct, p] = await Promise.all([getContracts(), getContacts(), getProducts()])
    setContracts(c)
    setContacts(ct)
    setProducts(p)
  }
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('contracts', loadData)

  const contactName = (id: string) => contacts.find((c) => c.id === id)?.name || '—'

  const handleDelete = async (id: string) => {
    if (confirm('Excluir contrato?')) {
      await deleteContract(id)
      toast({ title: 'Excluído' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contratos</h1>
          <p className="text-muted-foreground">Gere contratos profissionais com cláusulas LGPD.</p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Contrato
        </Button>
      </div>

      <ContractFormDialog
        contacts={contacts}
        products={products}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={loadData}
      />

      <Card className="border-border gold-accent-border">
        <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <FileText className="text-primary" size={20} /> Contratos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/30">
                <TableHead className="text-muted-foreground">Título</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Valor</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">LGPD</TableHead>
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum contrato cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c) => (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{c.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {contactName(c.contact_id)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {c.value ? formatCurrency(c.value) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusMap[c.status]?.className || 'bg-muted text-muted-foreground'
                        }
                      >
                        {statusMap[c.status]?.label || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.is_lgpd_compliant && (
                        <ShieldCheck size={18} className="text-emerald-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(c.created)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.contract_body && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewing(c)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <Eye size={16} />
                          </Button>
                        )}
                        {c.file && (
                          <a
                            href={getContractFileUrl(c) || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Download size={16} />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
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
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>
          <Textarea
            readOnly
            value={viewing?.contract_body || ''}
            className="h-96 text-xs font-mono"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
