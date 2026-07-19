migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: 'user_id = @request.auth.id',
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'number', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['product', 'service'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_products_user_type ON products (user_id, type)'],
    })
    app.save(products)

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'edianedalbosco@gmail.com')
      const col = app.findCollectionByNameOrId('products')

      const seeds = [
        {
          name: 'Consultoria Estratégica',
          description: 'Sessão de consultoria empresarial personalizada',
          price: 1500,
          type: 'service',
        },
        {
          name: 'Curso de Gestão Financeira',
          description: 'Curso completo para empreendedores',
          price: 897,
          type: 'product',
        },
        {
          name: 'Mentoria Individual',
          description: 'Mentoria mensal com acompanhamento dedicado',
          price: 2500,
          type: 'service',
        },
        {
          name: 'Template Plano de Negócios',
          description: 'Modelo editável de plano de negócios',
          price: 197,
          type: 'product',
        },
      ]

      for (const s of seeds) {
        try {
          app.findFirstRecordByData('products', 'name', s.name)
        } catch (_) {
          const r = new Record(col)
          r.set('user_id', user.id)
          r.set('name', s.name)
          r.set('description', s.description)
          r.set('price', s.price)
          r.set('type', s.type)
          app.save(r)
        }
      }
    } catch (_) {}
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('products'))
  },
)
