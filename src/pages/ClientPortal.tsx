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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Inválido</h1>
          <p className="text-slate-500">O portal que você tentou acessar não existe ou expirou.</p>
        </div>
      </div>
    )

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando portal seguro...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/20 text-white">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            Área do Cliente
          </h1>
          <p className="text-lg text-slate-600">
            Bem-vindo(a) ao seu portal exclusivo,{' '}
            <span className="font-semibold text-indigo-600">{data.contact.name}</span>
          </p>
        </div>

        <Card className="shadow-lg border-slate-200 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 pb-6">
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-indigo-600" /> Seus Contratos e Documentos
            </CardTitle>
            <CardDescription>
              Acesse e baixe os documentos vigentes do nosso acordo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.contracts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-50/50">
                Nenhum contrato arquivado no momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.contracts.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-lg text-slate-800 mb-1">{c.title}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          Data: {formatDate(c.created)}
                        </span>
                        {c.value && (
                          <span className="flex items-center gap-1">
                            • Valor: {formatCurrency(c.value)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <Badge
                        variant={c.status === 'active' ? 'default' : 'secondary'}
                        className={
                          c.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                        }
                      >
                        {c.status === 'active'
                          ? 'Vigente'
                          : c.status === 'draft'
                            ? 'Rascunho'
                            : 'Expirado'}
                      </Badge>
                      {c.file ? (
                        <Button
                          className="ml-auto sm:ml-0 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
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
                        <span className="text-sm text-slate-400 italic ml-auto sm:ml-0">
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
