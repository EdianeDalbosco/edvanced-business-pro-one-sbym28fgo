migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const collection = new Collection({
      name: 'team_events',
      type: 'base',
      listRule: '@request.auth.role = "manager"',
      viewRule: '@request.auth.role = "manager"',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.role = "manager"',
      deleteRule: '@request.auth.role = "manager"',
      fields: [
        {
          name: 'target_user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          maxSelect: 1,
        },
        {
          name: 'manager_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          maxSelect: 1,
        },
        {
          name: 'action',
          type: 'select',
          required: true,
          values: ['member_added', 'member_removed', 'role_changed'],
          maxSelect: 1,
        },
        { name: 'details', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_team_events_created ON team_events (created)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('team_events')
    app.delete(collection)
  },
)
