export interface MentoringTemplateData {
  title: string
  mentor_name: string
  mentor_document: string
  mentor_address: string
  mentee_name: string
  mentee_document: string
  mentee_address: string
  sessions_count: string
  frequency: string
  schedule_details: string
  session_location: string
  package_value: string
  payment_terms: string
  city: string
  start_date: string
  end_date: string
}

function formatDateBR(dateStr: string): string {
  if (!dateStr) return '{data_contrato}'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')
  } catch {
    return '{data_contrato}'
  }
}

export function generateMentoringTemplate(data: MentoringTemplateData): string {
  const title = data.title || 'CONTRATO DE MENTORIA'
  const endDateClause = data.end_date
    ? `\nd. A vigência deste contrato será de ${formatDateBR(data.start_date)} a ${formatDateBR(data.end_date)}.`
    : ''

  return `${title}

É livremente celebrado entre ${data.mentor_name || '{coach_nome}'}, CPF/CNPJ nº ${data.mentor_document || '{coach_cpf_cnpj}'}, residente na ${data.mentor_address || '{coach_endereco}'}, doravante designado como Mentor, e ${data.mentee_name || '{coachee_nome}'}, CPF/CNPJ nº ${data.mentee_document || '{coachee_cpf_cnpj}'}, residente no ${data.mentee_address || '{coachee_endereco}'}, doravante denominada de Mentorado, o seguinte contrato de Mentoria, o qual ambos se comprometem a cumprir, de mútuo acordo, boa-fé, livre e espontânea vontade nos termos a seguir elencados:

1. NATUREZA DOS SERVIÇOS
a. O Mentor proporciona ao Mentorado os seus serviços de Mentoria seguindo os métodos definidos como um processo que decorre no campo de uma relação profissional entre Mentor e Mentorado que ajuda e permite ao Mentorado obter resultados de caráter prático na sua vida, carreira, atividade escolar, ou profissionalmente. Através do comprometimento com o processo de Mentoria, há aprofundamento do autoconhecimento, aperfeiçoamento do desempenho e da qualidade de vida. O Mentoria leva à tomada de consciência, potencializa escolhas e leva a mudanças. Libera o potencial do Mentorado para maximizar o seu desempenho, levando-o a ultrapassar probabilisticamente suas próprias limitações, hábitos e inconsistência.
b. O Mentor não é, nem precisa ser, um perito no campo de trabalho do cliente, a não ser quando se trata de um processo de mentoria profissional específico, o Mentoria é uma parceria sinérgica na qual o Mentor usa a sua formação, talentos, intuição, capacidade de observação, empatia, escuta, sensibilidade e ultrapassar suas dificuldades e expandir suas possibilidades nos diferentes campos de atuação humana.
c. O Mentoria ora proposto refere-se ao Mentoria com agendas livres com temas pré-agendados.
d. O número de encontros com temas livres serão de ${data.sessions_count || '{num_sessoes}'} sessões, os temas serão livres ou previamente pactuados entre os contratantes, a saber: Agenda - livre

2. QUALIFICAÇÃO E EXPERIÊNCIA PROFISSIONAL DO MENTOR
a. O Mentor declara ser detentor da Formação e Certificação que atesta as suas capacidades, conhecimentos e competência para conduzir processos de Mentoria de acordo com os parâmetros técnicos, educacionais.

3. PADRÕES E PRINCÍPIOS ÉTICOS DO MENTORIA
a. Este contrato será como orientação básica ao comportamento ético de ambos contratantes. Estará presente a confiança, o respeito mútuo, a dignidade humana, a integridade, a confidencialidade, o sigilo, a honestidade, a comunicação real, a negociação, a readaptação e redirecionamentos permanentes.

4. FUNCIONAMENTO DAS SESSÕES E HONORÁRIOS
a. A frequência ora contratada será ${data.frequency || '{frequencia}'} a serem realizadas nas seguintes datas e horários: ${data.schedule_details || '{datas_horarios}'}.
b. O local será na ${data.session_location || '{local_sessoes}'}.
c. Entre as sessões poderá haver tarefas sugeridas pelo Mentor e eventuais trocas de correspondência eletrônica (WhatsApp, Messenger) ou mesmo telefonemas.
d. Em caso de falta de comparecimento do Mentorado em qualquer sessão agendada, quando não RENEGOCIADA com o limite mínimo de 24 horas de antecedência, será considerada como realizada.
e. Em caso de atraso no início de uma sessão que seja de responsabilidade do Mentorado será arrogado ao tempo remanescente da sua sessão, não havendo espaço nem tempo para sua compensação no final.
f. Se as sessões atingirem um tempo satisfatório antes do final do tempo previsto, o Mentor sugerirá ao Mentorado o término dessa sessão de forma a aproveitar o momento e o impacto dos resultados atingidos; entretanto, sempre caberá ao Mentorado definir se quer terminar aí a sessão ou aproveitar os minutos restantes para trabalhar outros temas, assuntos ou possibilidades.${endDateClause}

5. VALOR E FORMA DE PAGAMENTO
a. O valor do pacote é de R$ ${data.package_value || '{valor_pacote}'}.
b. A forma de pagamento será: ${data.payment_terms || '{forma_pagamento}'}.

${data.city || '{cidade}'}, ${formatDateBR(data.start_date)}.

_____________________________________________________
${data.mentor_name || '{coach_nome}'}
Mentor

_____________________________________________________
${data.mentee_name || '{coachee_nome}'}
Mentorado`
}
