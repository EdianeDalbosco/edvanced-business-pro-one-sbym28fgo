migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const campaigns = app.findCollectionByNameOrId('campaigns')

    const marketingContent = new Collection({
      name: 'marketing_content',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        {
          name: 'campaign_id',
          type: 'relation',
          required: true,
          collectionId: campaigns.id,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text' },
        {
          name: 'media',
          type: 'file',
          maxSelect: 10,
          maxSize: 52428800,
          mimeTypes: [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
          ],
        },
        {
          name: 'status',
          type: 'select',
          values: ['draft', 'planned', 'published', 'archived'],
          maxSelect: 1,
        },
        { name: 'platform', type: 'text' },
        { name: 'scheduled_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_marketing_content_campaign ON marketing_content (campaign_id)'],
    })
    app.save(marketingContent)

    $ai.agents.define(app, {
      slug: 'marketing-specialist',
      name: 'Estrategista de Marketing AI',
      description:
        'Estrategista de conteudo digital que ajuda a definir estrategias, gerar legendas e sugerir calendario de publicacoes.',
      systemPrompt:
        'Voce e um especialista em marketing digital e copywriter. Ajuda o usuario a definir estrategias de conteudo, gerar titulos cativantes, escrever legendas para posts e sugerir as melhores datas de publicacao. Responda sempre em portugues brasileiro. Seja criativo, profissional e direto. Quando sugerir conteudo, formate com titulos e bullets para facilitar a leitura. Voce tem acesso as colecoes campaigns e marketing_content para ler e criar conteudo diretamente.',
      tier: 'fast',
      tools: [
        { collection: 'campaigns', perms: { read: true, list: true } },
        {
          collection: 'marketing_content',
          perms: { read: true, list: true, create: true, update: true },
        },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'Diretrizes de tom da marca: profissional, inovador, acessivel e orientado a resultados. Use linguagem clara e inspiradora. Evite jargao tecnico excessivo.',
          },
        },
        {
          type: 'text',
          payload: {
            text: 'Melhores praticas de redes sociais: Instagram foca em visuais e reels; LinkedIn em conteudo profissional e artigos; Facebook em comunidade e eventos. Poste nos horarios de pico: 12h-13h e 19h-21h. Use 3-5 hashtags relevantes por post.',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'marketing-specialist')
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('marketing_content'))
    } catch (_) {}
  },
)
