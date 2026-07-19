migrate(
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')
    const products = app.findCollectionByNameOrId('products')

    if (!contracts.fields.getByName('document_number')) {
      contracts.fields.add(new TextField({ name: 'document_number' }))
    }
    if (!contracts.fields.getByName('address')) {
      contracts.fields.add(new TextField({ name: 'address' }))
    }
    if (!contracts.fields.getByName('contract_body')) {
      contracts.fields.add(new TextField({ name: 'contract_body' }))
    }
    if (!contracts.fields.getByName('is_lgpd_compliant')) {
      contracts.fields.add(new BoolField({ name: 'is_lgpd_compliant' }))
    }
    if (!contracts.fields.getByName('start_date')) {
      contracts.fields.add(new DateField({ name: 'start_date' }))
    }
    if (!contracts.fields.getByName('end_date')) {
      contracts.fields.add(new DateField({ name: 'end_date' }))
    }
    if (!contracts.fields.getByName('product_id')) {
      contracts.fields.add(
        new RelationField({ name: 'product_id', collectionId: products.id, maxSelect: 1 }),
      )
    }
    app.save(contracts)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const campaigns = new Collection({
      name: 'campaigns',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'channel', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['planning', 'active', 'completed', 'paused'],
          maxSelect: 1,
        },
        { name: 'budget', type: 'number' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_campaigns_user_status ON campaigns (user_id, status)'],
    })
    app.save(campaigns)

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'edianedalbosco@gmail.com')
      const col = app.findCollectionByNameOrId('campaigns')
      const seeds = [
        {
          name: 'Campanha Black Friday',
          description: 'Promocao de fim de ano com descontos especiais',
          channel: 'Instagram Ads',
          status: 'planning',
          budget: 5000,
          start_date: '2026-11-20',
          end_date: '2026-11-30',
        },
        {
          name: 'Webinar Gratuito de Gestao',
          description: 'Atracao de leads via webinar educativo',
          channel: 'Email Marketing',
          status: 'active',
          budget: 1500,
          start_date: '2026-07-01',
          end_date: '2026-07-31',
        },
        {
          name: 'Google Ads Servicos Premium',
          description: 'Campanha de busca para servicos de consultoria',
          channel: 'Google Ads',
          status: 'active',
          budget: 3000,
          start_date: '2026-06-01',
          end_date: '2026-12-31',
        },
        {
          name: 'Programa de Indicacao',
          description: 'Programa de indicacao para clientes ativos',
          channel: 'WhatsApp',
          status: 'paused',
          budget: 800,
          start_date: '2026-05-01',
          end_date: '2026-08-31',
        },
      ]
      for (const s of seeds) {
        try {
          app.findFirstRecordByData('campaigns', 'name', s.name)
        } catch (_) {
          const r = new Record(col)
          r.set('user_id', user.id)
          r.set('name', s.name)
          r.set('description', s.description)
          r.set('channel', s.channel)
          r.set('status', s.status)
          r.set('budget', s.budget)
          r.set('start_date', s.start_date)
          r.set('end_date', s.end_date)
          app.save(r)
        }
      }
    } catch (_) {}
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('campaigns'))
    } catch (_) {}
    const contracts = app.findCollectionByNameOrId('contracts')
    try {
      contracts.fields.removeByName('document_number')
    } catch (_) {}
    try {
      contracts.fields.removeByName('address')
    } catch (_) {}
    try {
      contracts.fields.removeByName('contract_body')
    } catch (_) {}
    try {
      contracts.fields.removeByName('is_lgpd_compliant')
    } catch (_) {}
    try {
      contracts.fields.removeByName('start_date')
    } catch (_) {}
    try {
      contracts.fields.removeByName('end_date')
    } catch (_) {}
    try {
      contracts.fields.removeByName('product_id')
    } catch (_) {}
    app.save(contracts)
  },
)
