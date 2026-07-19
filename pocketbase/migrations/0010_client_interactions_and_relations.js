migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const contacts = app.findCollectionByNameOrId('contacts')

    const interactions = new Collection({
      name: 'client_interactions',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        {
          name: 'contact_id',
          type: 'relation',
          required: true,
          collectionId: contacts.id,
          maxSelect: 1,
        },
        { name: 'date', type: 'date', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['call', 'email', 'meeting', 'note'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_interactions_contact ON client_interactions (contact_id, date)'],
    })
    app.save(interactions)

    const finance = app.findCollectionByNameOrId('finance')
    if (!finance.fields.getByName('contact_id')) {
      finance.fields.add(
        new RelationField({
          name: 'contact_id',
          collectionId: contacts.id,
          maxSelect: 1,
        }),
      )
    }
    app.save(finance)

    const tasks = app.findCollectionByNameOrId('tasks')
    if (!tasks.fields.getByName('contact_id')) {
      tasks.fields.add(
        new RelationField({
          name: 'contact_id',
          collectionId: contacts.id,
          maxSelect: 1,
        }),
      )
    }
    app.save(tasks)
  },
  (app) => {
    const tasks = app.findCollectionByNameOrId('tasks')
    if (tasks.fields.getByName('contact_id')) {
      tasks.fields.removeByName('contact_id')
    }
    app.save(tasks)

    const finance = app.findCollectionByNameOrId('finance')
    if (finance.fields.getByName('contact_id')) {
      finance.fields.removeByName('contact_id')
    }
    app.save(finance)

    const interactions = app.findCollectionByNameOrId('client_interactions')
    app.delete(interactions)
  },
)
