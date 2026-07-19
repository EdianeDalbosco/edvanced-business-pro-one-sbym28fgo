import { useState } from 'react'
import { FileDown, FileSpreadsheet, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface ExportButtonsProps {
  onExportPDF: () => Promise<void> | void
  onExportExcel: () => Promise<void> | void
}

export function ExportButtons({ onExportPDF, onExportExcel }: ExportButtonsProps) {
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null)

  const handlePDF = async () => {
    setLoading('pdf')
    try {
      await onExportPDF()
    } finally {
      setLoading(null)
    }
  }

  const handleExcel = async () => {
    setLoading('excel')
    try {
      await onExportExcel()
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading !== null}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Gerando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePDF} disabled={loading !== null}>
          <FileDown className="mr-2 h-4 w-4" /> Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExcel} disabled={loading !== null}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
