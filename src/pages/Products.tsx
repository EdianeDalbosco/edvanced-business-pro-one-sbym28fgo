import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/format'
import { Plus, Search, Pencil, Trash2, Package, Wrench } from 'lucide-react'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all')
  const { toast } = useToast()

  const loadData = async () => setProducts(await getProducts())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('products', loadData)

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === 'all' || p.type === typeFilter
        return matchesSearch && matchesType
      }),
    [products, search, typeFilter],
  )

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (p: any) => {
    setEditing(p)
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get('name') as string,
      description: fd.get('description') as string,
      price: Number(fd.get('price')),
      type: fd.get('type') as string,
    }
    try {
      if (editing) {
        await updateProduct(editing.id, data)
        toast({ title: 'Item atualizado com sucesso!' })
      } else {
        await createProduct(data)
        toast({ title: 'Item criado com sucesso!' })
      }
      setDialogOpen(false)
      setEditing(null)
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este item do catálogo?')) {
      await deleteProduct(id)
      toast({ title: 'Item excluído' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Produtos &amp; Serviços
          </h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de ofertas.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          <Button
            onClick={openCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Item
          </Button>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Item' : 'Adicionar Item'}</DialogTitle>
          </DialogHeader>
          <form key={editing?.id ?? 'new'} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input name="name" defaultValue={editing?.name} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input name="description" defaultValue={editing?.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  name="price"
                  defaultValue={editing?.price}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  name="type"
                  className={selectClass}
                  defaultValue={editing?.type ?? 'product'}
                >
                  <option value="product">Produto</option>
                  <option value="service">Serviço</option>
                </select>
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'product', 'service'] as const).map((t) => (
            <Button
              key={t}
              variant={typeFilter === t ? 'default' : 'outline'}
              size="sm"
              className={typeFilter === t ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => setTypeFilter(t)}
            >
              {t === 'all' ? 'Todos' : t === 'product' ? 'Produtos' : 'Serviços'}
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-right text-muted-foreground">Preço</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {p.type === 'product' ? (
                        <Package size={16} className="text-primary" />
                      ) : (
                        <Wrench size={16} className="text-primary" />
                      )}
                      {p.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {p.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        p.type === 'product'
                          ? 'border-primary/30 text-primary'
                          : 'border-sky-500/30 text-sky-600'
                      }
                    >
                      {p.type === 'product' ? 'Produto' : 'Serviço'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCurrency(p.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        className="text-muted-foreground hover:text-rose-500"
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
    </div>
  )
}
