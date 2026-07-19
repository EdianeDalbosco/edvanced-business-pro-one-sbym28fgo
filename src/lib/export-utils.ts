import pb from '@/lib/pocketbase/client'

export interface ExcelSheet {
  name: string
  headers: string[]
  rows: (string | number | null | undefined)[][]
}

export interface PdfSummaryItem {
  label: string
  value: string
}

export interface PdfSection {
  title?: string
  type: 'table' | 'summary'
  headers?: string[]
  rows?: (string | number | null | undefined)[][]
  items?: PdfSummaryItem[]
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[:\\/?*[\]]/g, '').slice(0, 31) || 'Sheet'
}

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '')
    return '<Cell><Data ss:Type="String"></Data></Cell>'
  if (typeof value === 'number' && isFinite(value))
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`
  return `<Cell><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getBusinessName(): string {
  return pb.authStore.record?.['name'] || pb.authStore.record?.['email'] || 'Business Pro'
}

export function exportToExcel(filename: string, sheets: ExcelSheet[]): void {
  const sheetXml = sheets
    .map((sheet) => {
      const name = sanitizeSheetName(sheet.name)
      const headerRow = `   <Row>${sheet.headers.map((h) => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}</Row>`
      const dataRows = sheet.rows
        .map((row) => `   <Row>${row.map((c) => formatCell(c)).join('')}</Row>`)
        .join('\n')
      return ` <Worksheet ss:Name="${escapeXml(name)}">\n  <Table>\n${headerRow}\n${dataRows}\n  </Table>\n </Worksheet>`
    })
    .join('\n')

  const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n${sheetXml}\n</Workbook>`
  downloadBlob(
    new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' }),
    `${filename}.xls`,
  )
}

export function generatePDF(
  businessName: string,
  reportTitle: string,
  sections: PdfSection[],
): void {
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const sectionsHtml = sections
    .map((section) => {
      let html = ''
      if (section.title) html += `<h2>${escapeHtml(section.title)}</h2>`
      if (section.type === 'summary' && section.items) {
        html += '<div class="summary-grid">'
        section.items.forEach((item) => {
          html += `<div class="summary-card"><span class="label">${escapeHtml(item.label)}</span><span class="value">${escapeHtml(item.value)}</span></div>`
        })
        html += '</div>'
      }
      if (section.type === 'table' && section.headers && section.rows) {
        html += '<table><thead><tr>'
        section.headers.forEach((h) => {
          html += `<th>${escapeHtml(h)}</th>`
        })
        html += '</tr></thead><tbody>'
        section.rows.forEach((row) => {
          html += '<tr>'
          row.forEach((cell) => {
            html += `<td>${escapeHtml(String(cell ?? ''))}</td>`
          })
          html += '</tr>'
        })
        html += '</tbody></table>'
      }
      return html
    })
    .join('')

  const css = `@page{margin:2cm}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;margin:0}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #d4a017;padding-bottom:16px;margin-bottom:24px}.business-name{font-size:22px;font-weight:bold;color:#11244e}.report-date{font-size:12px;color:#666}h1{font-size:20px;color:#11244e;margin-bottom:16px}h2{font-size:15px;color:#11244e;margin-top:20px;margin-bottom:10px;border-bottom:1px solid #ddd;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px}th{background:#f0f0f5;padding:8px;text-align:left;border:1px solid #ddd;font-weight:600}td{padding:6px 8px;border:1px solid #ddd}tr:nth-child(even) td{background:#fafafa}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}.summary-card{border:1px solid #ddd;border-radius:8px;padding:12px;background:#f9f9f9}.summary-card .label{display:block;font-size:11px;color:#666;margin-bottom:4px}.summary-card .value{display:block;font-size:18px;font-weight:bold;color:#11244e}`
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(reportTitle)}</title><style>${css}</style></head><body><div class="header"><div class="business-name">${escapeHtml(businessName)}</div><div class="report-date">Gerado em: ${date}</div></div><h1>${escapeHtml(reportTitle)}</h1>${sectionsHtml}</body></html>`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }
}
