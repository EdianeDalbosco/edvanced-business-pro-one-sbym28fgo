import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getTransactions } from '@/services/finance'
import { getContacts } from '@/services/contacts'
import { formatCurrency } from '@/lib/format'
import { Activity, TrendingUp, Users } from 'lucide-react'

export default function Results() {
  const [finance, setFinance] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])

  useEffect(() => {
    Promise.all([getTransactions(), getContacts()]).then(([f, c]) => {
      setFinance(f)
      setContacts(c)
    })
  }, [])

  const totalIncome = finance.filter((f) => f.type === 'income').reduce((a, b) => a + b.amount, 0)
  const totalExpense = finance.filter((f) => f.type === 'expense').reduce((a, b) => a + b.amount, 0)
  const ltv =
    contacts.filter((c) => c.type === 'client').length > 0
      ? totalIncome / contacts.filter((c) => c.type === 'client').length
      : 0

  const totalContacts = contacts.length
  const clients = contacts.filter((c) => c.type === 'client').length
  const conversionRate = totalContacts > 0 ? Math.round((clients / totalContacts) * 100) : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resultados & Análises</h1>
        <p className="text-slate-500">Métricas de performance global do seu negócio.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Activity size={24} />
              </div>
              <div className="font-medium text-indigo-100">Margem de Lucro Bruta</div>
            </div>
            <div className="text-4xl font-bold">
              {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}
              %
            </div>
            <p className="text-indigo-200 mt-2 text-sm">
              Proporção da receita retida após despesas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div className="font-medium text-emerald-100">LTV Médio (Lifetime Value)</div>
            </div>
            <div className="text-4xl font-bold">{formatCurrency(ltv)}</div>
            <p className="text-emerald-100 mt-2 text-sm">Valor médio gerado por cliente ativo</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500 text-white shadow-xl shadow-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users size={24} />
              </div>
              <div className="font-medium text-amber-100">Taxa de Conversão de Leads</div>
            </div>
            <div className="text-4xl font-bold">{conversionRate}%</div>
            <p className="text-amber-100 mt-2 text-sm">Proporção de prospects que fecharam</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Resumo Consolidado</CardTitle>
          <CardDescription>O histórico completo registrado no sistema.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div>
            <div className="text-sm font-medium text-slate-500">Receita Total Acumulada</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Despesa Total Acumulada</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {formatCurrency(totalExpense)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Total de Contatos Gerados</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{totalContacts}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Clientes Fechados</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{clients}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
