import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createContract, getContracts } from '@/services/contracts'
import { getContacts } from '@/services/contacts'
import { getProducts } from '@/services/products'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { Package, Wrench, AlertCircle } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, formatDate } from '@/lib/format'
import { generateMentoringTemplate } from '@/lib/mentoring-template'
import { cn } from '@/lib/utils'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'

function maskCpfCnpj(value: string) {
  const v = value.replace(/\D/g, '')
  if (v.length <= 11) {
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return v
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

const initialForm = {
  title: '',
  mentor_name: '',
  mentor_document: '',
  mentor_address: '',
  contact_id: '',
  product_id: '',
  mentee_name: '',
  mentee_document: '',
  mentee_address: '',
  sessions_count: '',
  frequency: '',
  schedule_details: '',
  session_location: '',
  package_value: '',
  payment_terms: '',
  city: '',
  district: '',
  start_date: '',
  end_date: '',
  objective: '',
  steps: '',
  deliverables: '',
  expected_result: '',
}

export default function Contracts() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [text, setText] = useState('')
  const [formData, setFormData] = useState({ ...initialForm })
  const [isManuallyEdited, setIsManuallyEdited] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const c = await getContacts()
      setContacts(c)
      const p = await getProducts()
      setProducts(p)
    }
    loadData()
  }, [])

  useRealtime('products', async () => {
    const p = await getProducts()
    setProducts(p)
  })

  useEffect(() => {
    if (!isManuallyEdited) {
      setText(generateMentoringTemplate(formData))
    }
  }, [formData, isManuallyEdited])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsManuallyEdited(false)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setIsManuallyEdited(true)
  }

  const handleClientSelect = (id: string) => {
    const client = contacts.find((c) => c.id === id)
    setFormData((prev) => ({
      ...prev,
      contact_id: id,
      mentee_name: client?.name || '',
    }))
    setIsManuallyEdited(false)
  }

  const handleProductSelect = (id: string) => {
    const product = products.find((p) => p.id === id)
    setFormData((prev) => ({
      ...prev,
      product_id: id,
      package_value: product ? String(product.price) : prev.package_value,
      title: product && !prev.title ? product.name : prev.title,
    }))
    setIsManuallyEdited(false)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato de Mentoria</title>
            <style>
              body { font-family: serif; line-height: 1.6; padding: 40px; color: black; white-space: pre-wrap; font-size: 14px; }
            </style>
          </head>
          <body>${text}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleSave = async () => {
    if (!formData.contact_id) {
      toast({ title: 'Erro', description: 'Selecione um cliente.', variant: 'destructive' })
      return
    }
    try {
      await createContract({
        title: formData.title || `Contrato de Mentoria - ${formData.mentee_name}`,
        status: 'draft',
        contact_id: formData.contact_id,
        product_id: formData.product_id || null,
        contract_body: text,
        value: formData.package_value ? Number(formData.package_value) : 0,
        mentor_name: formData.mentor_name,
        mentor_document: formData.mentor_document,
        mentor_address: formData.mentor_address,
        mentee_name: formData.mentee_name,
        mentee_document: formData.mentee_document,
        mentee_address: formData.mentee_address,
        sessions_count: formData.sessions_count ? Number(formData.sessions_count) : 0,
        frequency: formData.frequency,
        schedule_details: formData.schedule_details,
        session_location: formData.session_location,
        payment_terms: formData.payment_terms,
        city: formData.city,
        district: formData.district,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        objective: formData.objective,
        steps: formData.steps,
        deliverables: formData.deliverables,
        expected_result: formData.expected_result,
      })
      toast({ title: 'Sucesso', description: 'Contrato gerado com sucesso!' })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o contrato.',
        variant: 'destructive',
      })
    }
  }

  const handleExportPDF = async () => {
    const contracts = await getContracts()
    generatePDF(getBusinessName(), 'Contratos', [
      {
        type: 'table',
        title: 'Lista de Contratos',
        headers: ['Título', 'Cliente', 'Valor', 'Status', 'Início', 'Término'],
        rows: contracts.map((c: any) => [
          c.title,
          c.expand?.contact_id?.name || '',
          formatCurrency(c.value || 0),
          c.status || '',
          c.start_date ? formatDate(c.start_date) : '',
          c.end_date ? formatDate(c.end_date) : '',
        ]),
      },
    ])
  }

  const handleExportExcel = async () => {
    const contracts = await getContracts()
    exportToExcel('contratos', [
      {
        name: 'Contratos',
        headers: [
          'Título',
          'Cliente',
          'Produto',
          'Valor',
          'Status',
          'Nº Documento',
          'Data Início',
          'Data Término',
          'Mentor',
          'Mentorado',
        ],
        rows: contracts.map((c: any) => [
          c.title,
          c.expand?.contact_id?.name || '',
          c.expand?.product_id?.name || '',
          c.value || 0,
          c.status || '',
          c.document_number || '',
          c.start_date || '',
          c.end_date || '',
          c.mentor_name || '',
          c.mentee_name || '',
        ]),
      },
    ])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Contrato de Mentoria
          </h1>
          <p className="text-muted-foreground">
            Preencha os dados e gere o contrato para enviar ao cliente
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          <Button variant="outline" onClick={handlePrint} className="bg-background">
            <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        <div className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 bg-muted/30">
              <CardTitle className="text-base font-semibold">Dados do Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome / Empresa</Label>
                <Input
                  value={formData.mentor_name}
                  onChange={(e) => handleChange('mentor_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF / CNPJ</Label>
                <Input
                  value={formData.mentor_document}
                  onChange={(e) => handleChange('mentor_document', maskCpfCnpj(e.target.value))}
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={formData.mentor_address}
                  onChange={(e) => handleChange('mentor_address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 bg-muted/30">
              <CardTitle className="text-base font-semibold">Dados do Mentorado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Selecionar Cliente</Label>
                <Select value={formData.contact_id} onValueChange={handleClientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Mentorado</Label>
                <Input
                  value={formData.mentee_name}
                  onChange={(e) => handleChange('mentee_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF / CNPJ</Label>
                <Input
                  value={formData.mentee_document}
                  onChange={(e) => handleChange('mentee_document', maskCpfCnpj(e.target.value))}
                  maxLength={18}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={formData.mentee_address}
                  onChange={(e) => handleChange('mentee_address', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 bg-muted/30">
              <CardTitle className="text-base font-semibold">Produto ou Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {products.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum produto ou serviço cadastrado.
                  </p>
                  <Link to="/products">
                    <Button variant="outline" size="sm">
                      Ir para Produtos &amp; Serviços
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Selecionar Produto ou Serviço</Label>
                  <Select value={formData.product_id} onValueChange={handleProductSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto ou serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            {p.type === 'product' ? (
                              <Package size={14} className="text-primary" />
                            ) : (
                              <Wrench size={14} className="text-sky-500" />
                            )}
                            {p.name}
                            <span className="text-xs text-muted-foreground">
                              ({p.type === 'product' ? 'Produto' : 'Serviço'}) —{' '}
                              {formatCurrency(p.price)}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="py-4 bg-muted/30">
              <CardTitle className="text-base font-semibold">Detalhes do Processo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Título do Contrato</Label>
                <Input
                  placeholder="Ex: Mentoria Empresarial 2026"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nº Sessões</Label>
                  <Input
                    type="number"
                    value={formData.sessions_count}
                    onChange={(e) => handleChange('sessions_count', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Input
                    placeholder="semanal"
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Datas e Horários</Label>
                <Input
                  placeholder="Ex: Quartas, 14h"
                  value={formData.schedule_details}
                  onChange={(e) => handleChange('schedule_details', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Local das Sessões</Label>
                <Input
                  value={formData.session_location}
                  onChange={(e) => handleChange('session_location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor do Pacote (R$)</Label>
                <Input
                  type="number"
                  value={formData.package_value}
                  onChange={(e) => handleChange('package_value', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Input
                  placeholder="Ex: 3x de R$ 1.000,00"
                  value={formData.payment_terms}
                  onChange={(e) => handleChange('payment_terms', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comarca</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  />
                </div>
              </div>

              <Card className="border-border shadow-sm">
                <CardHeader className="py-4 bg-muted/30">
                  <CardTitle className="text-base font-semibold">Gestão de Projeto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Objetivo</Label>
                    <Input
                      value={formData.objective}
                      onChange={(e) => handleChange('objective', e.target.value)}
                      placeholder="Objetivo principal do projeto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Etapas</Label>
                    <Textarea
                      rows={3}
                      value={formData.steps}
                      onChange={(e) => handleChange('steps', e.target.value)}
                      placeholder="Descreva as fases do projeto..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entregáveis</Label>
                    <Textarea
                      rows={3}
                      value={formData.deliverables}
                      onChange={(e) => handleChange('deliverables', e.target.value)}
                      placeholder="Liste os entregáveis do projeto..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resultado Esperado</Label>
                    <Textarea
                      rows={2}
                      value={formData.expected_result}
                      onChange={(e) => handleChange('expected_result', e.target.value)}
                      placeholder="Qual o resultado esperado?"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full mt-4 bg-[#11244e] text-white hover:bg-[#11244e]/90 shadow-md"
                onClick={handleSave}
              >
                Salvar Contrato
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
            <span className="font-semibold text-foreground">Pré-visualização do Contrato</span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Você pode editar diretamente o texto abaixo
            </span>
          </div>
          <Textarea
            className={cn(
              'flex-1 resize-none border-0 focus-visible:ring-0 rounded-none p-6 text-sm font-serif leading-relaxed h-full overflow-y-auto bg-card',
            )}
            value={text}
            onChange={handleTextChange}
          />
        </div>
      </div>
    </div>
  )
}
