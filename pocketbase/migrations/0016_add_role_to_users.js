migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('role')) {
      usersCol.fields.add(
        new SelectField({ name: 'role', values: ['manager', 'member'], maxSelect: 1 }),
      )
    }

    usersCol.listRule = "@request.auth.id != ''"
    usersCol.viewRule = "@request.auth.id != ''"
    usersCol.updateRule = "@request.auth.id != ''"
    usersCol.deleteRule = "@request.auth.id != ''"

    app.save(usersCol)

    app.db().newQuery("UPDATE users SET role = 'member' WHERE role = '' OR role IS NULL").execute()

    app
      .db()
      .newQuery("UPDATE users SET role = 'manager' WHERE email = 'edianedalbosco@gmail.com'")
      .execute()
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      usersCol.fields.removeByName('role')
    } catch (_) {}
    usersCol.listRule = 'id = @request.auth.id'
    usersCol.viewRule = 'id = @request.auth.id'
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    app.save(usersCol)
  },
)
