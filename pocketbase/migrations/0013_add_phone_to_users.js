migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('phone')) {
      usersCol.fields.add(new TextField({ name: 'phone' }))
    }
    app.save(usersCol)
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      usersCol.fields.removeByName('phone')
    } catch (_) {}
    app.save(usersCol)
  },
)
