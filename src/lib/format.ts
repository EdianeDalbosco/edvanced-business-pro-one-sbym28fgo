export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString))
}

export const isToday = (dateString: string) => {
  if (!dateString) return false
  const d = new Date(dateString)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}
