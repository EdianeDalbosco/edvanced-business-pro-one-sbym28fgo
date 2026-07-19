import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createContract } from '@/services/contracts'
import { generateContractTemplate } from '@/lib/contract-template'
import { useToast } from '@/hooks/use-toast'
import { FileText, Sparkles } from 'lucide-react'

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground'

interface Props {
  contacts: any[]
  products: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const emptyForm = {
  contact_id: '',
  product_id: '',
  title: '',
  value: '',
  start_date: '',
  end_date: '',
  document_number: '',
  address: '',
  status: 'draft',
}

export function ContractFormDialog({ contacts, products, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast()
  const [generatedText, setGeneratedText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }))

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setForm((prev) => ({
      ...prev,
      product_id: productId,
      title: product ? product.name : prev.title,
      value: product ? String(product.price) : prev.value,
    }))
  }

  const handleGenerate = () => {
    const contact = contacts.find((c) => c.id === form.contact_id)
    const product = products.find((p) => p.id === form.product_id)
    const text = generateContractTemplate({
      clientName: contact?.name || '',
      documentNumber: form.document_number,
      address: form.address,
      contractTitle: form.title,
      serviceDetails: product?.description || form.title,
      value: Number(form.value) || 0,
      startDate: form.start_date,
      endDate: form.end_date,
    })
    setGeneratedText(text)
    toast({ title: 'Documento gerado com cláusula LGPD!' })
  }

  const handleSubmit = async () => {
    if (!form.contact_id || !form.title) {
      toast({ title: 'Preencha cliente e título', variant: 'destructive' })
      return
    }
    try {
      await createContract(
        {
          ...form,
          value: Number(form.value) || 0,
          contract_body: generatedText,
          is_lgpd_compliant: true,
        },
        file,
      )
      toast({ title: 'Contrato criado com sucesso!' })
      setForm({ ...emptyForm })
      setGeneratedText('')
      setFile(null)
      onOpenChange(false)
      onSaved()
    } catch {
      toast({ title: 'Erro ao criar contrato', variant: 'destructive' })
    }
  }

  const clients = contacts.filter((c) => c.type === 'client')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="text-primary" size={20} /> Gerar Contrato
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <select
                className={selectClass}
                value={form.contact_id}
                onChange={(e) => update('contact_id', e.target.value)}
              >
                <option value="">Selecione...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Produto/Serviço</Label>
              <select
                className={selectClass}
                value={form.product_id}
                onChange={(e) => handleProductChange(e.target.value)}
              >
                <option value="">Selecione...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título do Contrato</Label>
              <Input value={form.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => update('value', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>CPF/CNPJ do Cliente</Label>
            <Input
              value={form.document_number}
              onChange={(e) => update('document_number', e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço Completo</Label>
            <Input
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Rua, número, bairro, cidade, CEP"
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className={selectClass}
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
            >
              <option value="draft">Rascunho</option>
              <option value="active">Vigente</option>
              <option value="expired">Expirado</option>
              <option value="terminated">Rescindido</option>
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleGenerate}
          >
            <Sparkles size={16} className="mr-2" /> Gerar Documento com Cláusula LGPD
          </Button>
          {generatedText && (
            <div className="space-y-2">
              <Label>Contrato Gerado (inclui cláusula LGPD)</Label>
              <Textarea readOnly value={generatedText} className="h-48 text-xs font-mono" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Anexar PDF (opcional)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            type="button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
          >
            Salvar Contrato
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
