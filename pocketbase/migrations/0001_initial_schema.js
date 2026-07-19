migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const planning = new Collection({
      name: 'business_planning',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'mission', type: 'text' },
        { name: 'vision', type: 'text' },
        { name: 'values', type: 'text' },
        { name: 'strategy', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_planning_user ON business_planning (user_id)'],
    })
    app.save(planning)

    const goals = new Collection({
      name: 'goals',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'target_value', type: 'number' },
        { name: 'current_value', type: 'number' },
        { name: 'deadline', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['pending', 'in_progress', 'completed', 'cancelled'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_goals_user_status ON goals (user_id, status)'],
    })
    app.save(goals)

    const finance = new Collection({
      name: 'finance',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'description', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'type', type: 'select', values: ['income', 'expense'], maxSelect: 1 },
        { name: 'category', type: 'text' },
        { name: 'date', type: 'date', required: true },
        { name: 'status', type: 'select', values: ['paid', 'pending'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_finance_user_date ON finance (user_id, date)'],
    })
    app.save(finance)

    const contacts = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'type', type: 'select', values: ['prospect', 'client'], maxSelect: 1 },
        {
          name: 'pipeline_stage',
          type: 'select',
          values: ['new', 'negotiation', 'proposal', 'closed'],
          maxSelect: 1,
        },
        { name: 'portal_token', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contacts_user_type ON contacts (user_id, type)',
        "CREATE UNIQUE INDEX idx_contacts_token ON contacts (portal_token) WHERE portal_token != ''",
      ],
    })
    app.save(contacts)

    const contracts = new Collection({
      name: 'contracts',
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
        { name: 'title', type: 'text', required: true },
        { name: 'value', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['draft', 'active', 'expired', 'terminated'],
          maxSelect: 1,
        },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 10485760 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_contracts_contact ON contracts (contact_id)'],
    })
    app.save(contracts)

    const tasks = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: 'user_id = @request.auth.id',
      viewRule: 'user_id = @request.auth.id',
      createRule: "@request.auth.id != ''",
      updateRule: 'user_id = @request.auth.id',
      deleteRule: 'user_id = @request.auth.id',
      fields: [
        { name: 'user_id', type: 'relation', required: true, collectionId: users.id, maxSelect: 1 },
        { name: 'title', type: 'text', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'priority', type: 'select', values: ['low', 'medium', 'high'], maxSelect: 1 },
        { name: 'status', type: 'select', values: ['todo', 'doing', 'done'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_tasks_user_date ON tasks (user_id, due_date)'],
    })
    app.save(tasks)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('tasks'))
    app.delete(app.findCollectionByNameOrId('contracts'))
    app.delete(app.findCollectionByNameOrId('contacts'))
    app.delete(app.findCollectionByNameOrId('finance'))
    app.delete(app.findCollectionByNameOrId('goals'))
    app.delete(app.findCollectionByNameOrId('business_planning'))
  },
)
