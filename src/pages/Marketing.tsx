import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MarketingCampaignsTab } from '@/components/marketing-campaigns-tab'
import { MarketingContentTab } from '@/components/marketing-content-tab'
import { MarketingAiChat } from '@/components/marketing-ai-chat'
import { Megaphone, FileText, Sparkles } from 'lucide-react'

export default function Marketing() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Comercial & Marketing</h1>
        <p className="text-muted-foreground">
          Gerencie campanhas, conteúdo e estratégia de marketing com IA.
        </p>
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
