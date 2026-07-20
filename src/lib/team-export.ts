import { downloadBlob, generatePDF } from '@/lib/export-utils'
import { formatDate } from '@/lib/format'

const ACTION_LABELS: Record<string, string> = {
  member_added: 'Membro Adicionado',
  member_removed: 'Membro Removido',
  role_changed: 'Função Alterada',
}

export function exportTeamEventsCSV(events: any[]) {
  const headers = [
    'ID',
    'Data de Criação',
    'Atualização',
    'Ação',
    'ID Membro',
    'Membro',
    'ID Gerente',
    'Gerente',
    'Detalhes',
  ]
  const rows = events.map((e) => [
    e.id,
    formatDate(e.created),
    formatDate(e.updated),
    ACTION_LABELS[e.action] || e.action,
    e.target_user_id || '',
    e.expand?.target_user_id?.name || '—',
    e.manager_id || '',
    e.expand?.manager_id?.name || '—',
    e.details || '',
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  downloadBlob(
    new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }),
    'historico-auditoria.csv',
  )
}

export function exportTeamEventsPDF(events: any[]) {
  generatePDF('Edvanced Business Pro', 'Histórico de Auditoria', [
    {
      type: 'table',
      title: 'Eventos da Equipe',
      headers: ['Data', 'Ação', 'Membro', 'Gerente', 'Detalhes'],
      rows: events.map((e) => [
        formatDate(e.created),
        ACTION_LABELS[e.action] || e.action,
        e.expand?.target_user_id?.name || '—',
        e.expand?.manager_id?.name || '—',
        e.details || '',
      ]),
    },
  ])
}
