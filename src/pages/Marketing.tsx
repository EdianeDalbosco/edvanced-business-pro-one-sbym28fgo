import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MarketingCampaignsTab } from '@/components/marketing-campaigns-tab'
import { MarketingContentTab } from '@/components/marketing-content-tab'
import { MarketingAiChat } from '@/components/marketing-ai-chat'
import { Megaphone, FileText, Sparkles } from 'lucide-react'
import { ExportButtons } from '@/components/export-buttons'
import { exportToExcel, generatePDF, getBusinessName } from '@/lib/export-utils'
import { getCampaigns } from '@/services/campaigns'
import { getMarketingContent } from '@/services/marketing-content'
import { formatDate } from '@/lib/format'

export default function Marketing() {
  const handleExportPDF = async () => {
    const [campaigns, content] = await Promise.all([getCampaigns(), getMarketingContent()])
    generatePDF(getBusinessName(), 'Comercial & Marketing', [
      {
        type: 'table',
        title: 'Campanhas',
        headers: ['Nome', 'Canal', 'Status', 'Orçamento', 'Início', 'Fim'],
        rows: campaigns.map((c: any) => [
          c.name,
          c.channel || '',
          c.status || '',
          c.budget || 0,
          c.start_date ? formatDate(c.start_date) : '',
          c.end_date ? formatDate(c.end_date) : '',
        ]),
      },
      {
        type: 'table',
        title: 'Conteúdo',
        headers: ['Título', 'Plataforma', 'Status', 'Data Agendada'],
        rows: content.map((c: any) => [
          c.title,
          c.platform || '',
          c.status || '',
          c.scheduled_date ? formatDate(c.scheduled_date) : '',
        ]),
      },
    ])
  }

  const handleExportExcel = async () => {
    const [campaigns, content] = await Promise.all([getCampaigns(), getMarketingContent()])
    exportToExcel('marketing', [
      {
        name: 'Campanhas',
        headers: ['Nome', 'Descrição', 'Canal', 'Status', 'Orçamento', 'Data Início', 'Data Fim'],
        rows: campaigns.map((c: any) => [
          c.name,
          c.description || '',
          c.channel || '',
          c.status || '',
          c.budget || 0,
          c.start_date || '',
          c.end_date || '',
        ]),
      },
      {
        name: 'Conteúdo',
        headers: ['Título', 'Corpo', 'Plataforma', 'Status', 'Data Agendada'],
        rows: content.map((c: any) => [
          c.title,
          c.body || '',
          c.platform || '',
          c.status || '',
          c.scheduled_date || '',
        ]),
      },
    ])
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Comercial & Marketing
          </h1>
          <p className="text-muted-foreground">
            Gerencie campanhas, conteúdo e estratégia de marketing com IA.
          </p>
        </div>
        <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
      </div>
      <Tabs defaultValue="campaigns">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="campaigns">
            <Megaphone size={16} className="mr-2" /> Campanhas
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText size={16} className="mr-2" /> Conteúdo
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles size={16} className="mr-2" /> Estrategista AI
          </TabsTrigger>
        </TabsList>
        <TabsContent value="campaigns" className="mt-6">
          <MarketingCampaignsTab />
        </TabsContent>
        <TabsContent value="content" className="mt-6">
          <MarketingContentTab />
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
          <MarketingAiChat />
        </TabsContent>
      </Tabs>
    </div>
  )
}
