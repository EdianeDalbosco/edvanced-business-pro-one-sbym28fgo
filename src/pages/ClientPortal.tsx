import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Building2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

export default function ClientPortal() {
  const { token } = useParams()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    pb.send(`/backend/v1/portal/${token}`)
      .then(setData)
      .catch(() => setError(true))
  }, [token])

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-xl shadow-sm border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Inválido</h1>
          <p className="text-muted-foreground">
            O portal que você tentou acessar não existe ou expirou.
          </p>
        </div>
      </div>
    )

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Carregando portal seguro...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/30 text-primary-foreground">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            Área do Cliente
          </h1>
          <p className="text-lg text-muted-foreground">
            Bem-vindo(a) ao seu portal exclusivo,{' '}
            <span className="font-semibold text-primary">{data.contact.name}</span>
          </p>
        </div>

        <Card className="shadow-lg border-border gold-accent-border overflow-hidden">
          <CardHeader className="bg-card border-b border-border pb-6">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="text-primary" /> Seus Contratos e Documentos
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse e baixe os documentos vigentes do nosso acordo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.contracts.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground bg-muted/20">
                Nenhum contrato arquivado no momento.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.contracts.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-lg text-foreground mb-1">{c.title}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>Data: {formatDate(c.created)}</span>
                        {c.value && <span>• Valor: {formatCurrency(c.value)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Badge
                        variant={c.status === 'active' ? 'default' : 'secondary'}
                        className={c.status === 'active' ? 'bg-emerald-500 text-white' : ''}
                      >
                        {c.status === 'active'
                          ? 'Vigente'
                          : c.status === 'draft'
                            ? 'Rascunho'
                            : 'Expirado'}
                      </Badge>
                      {c.file ? (
                        <Button
                          className="ml-auto sm:ml-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                          asChild
                        >
                          <a
                            href={`${import.meta.env.VITE_POCKETBASE_URL}${c.file}`}
                            target="_blank"
                            download
                          >
                            <Download size={16} className="mr-2" /> Baixar PDF
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground italic ml-auto sm:ml-0">
                          Em emissão
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
