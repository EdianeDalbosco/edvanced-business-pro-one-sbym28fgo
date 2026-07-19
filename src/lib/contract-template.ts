export interface ContractTemplateData {
  clientName: string
  documentNumber: string
  address: string
  contractTitle: string
  serviceDetails: string
  value: number
  startDate: string
  endDate: string
}

const LGPD_CLAUSE = `CLÁUSULA DE PROTEÇÃO DE DADOS PESSOAIS (LGPD)
Em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD), o CONTRATANTE autoriza expressamente a CONTRATADA a coletar, armazenar, tratar e utilizar seus dados pessoais fornecidos neste contrato, exclusivamente para fins de execução do presente contrato e cumprimento de obrigações legais. A CONTRATADA compromete-se a:
a) Manter a confidencialidade e a segurança dos dados pessoais;
b) Não utilizar os dados para finalidades distintas das aqui previstas, salvo mediante consentimento prévio e expresso;
c) Excluir os dados após o término da relação contratual, salvo retenção obrigatória por lei.
O CONTRATANTE poderá exercer, a qualquer tempo, seus direitos de acesso, retificação, eliminação, portabilidade e oposição ao tratamento de dados, conforme previsto na legislação vigente.`

export function generateContractTemplate(data: ContractTemplateData): string {
  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
  const formatDate = (d: string) =>
    d ? new Intl.DateTimeFormat('pt-BR').format(new Date(d)) : '[Data não informada]'

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE:
  Nome: ${data.clientName || '[Não informado]'}
  CPF/CNPJ: ${data.documentNumber || '[Não informado]'}
  Endereço: ${data.address || '[Não informado]'}

CONTRATADA:
  [Nome da sua empresa]

CLÁUSULA 1ª – OBJETO
  ${data.contractTitle || '[Não informado]'}

CLÁUSULA 2ª – DESCRIÇÃO DOS SERVIÇOS
  ${data.serviceDetails || '[Descrição não informada]'}

CLÁUSULA 3ª – VALOR
  O valor total do presente contrato é de ${formatBRL(data.value)}, a ser pago conforme acordado entre as partes.

CLÁUSULA 4ª – VIGÊNCIA
  O presente contrato terá vigência de ${formatDate(data.startDate)} a ${formatDate(data.endDate)}.

${LGPD_CLAUSE}

CLÁUSULA 6ª – DISPOSIÇÕES GERAIS
  Este contrato representa o acordo integral entre as partes. Qualquer modificação deverá ser feita por escrito e assinada por ambas as partes. Fica eleito o foro da comarca do CONTRATANTE para dirimir quaisquer controvérsias.

_____________________________     _____________________________
  CONTRATANTE                        CONTRATADA

Data: ${new Intl.DateTimeFormat('pt-BR').format(new Date())}`
}
