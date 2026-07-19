import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/lib/format'
import type { CashFlowPoint } from '@/lib/finance-utils'

interface CashFlowChartProps {
  data: CashFlowPoint[]
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <Card className="border-border">
      <CardHeader className="bg-muted/50 border-b border-border rounded-t-xl">
        <CardTitle className="text-lg text-foreground">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[300px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Sem dados de fluxo de caixa.
            </div>
          ) : (
            <ChartContainer
              config={{
                income: { color: 'hsl(141, 70%, 45%)' },
                expense: { color: 'hsl(0, 72%, 60%)' },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94a3b8' }}
                    tickFormatter={(val) => `R$ ${Math.abs(val) / 1000}k`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          formatCurrency(Number(value)),
                          name === 'income'
                            ? 'Entradas'
                            : name === 'expense'
                              ? 'Saídas'
                              : 'Líquido',
                        ]}
                      />
                    }
                  />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                  <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
