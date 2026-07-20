migrate(
  (app) => {
    var managerRule =
      '@request.auth.id != "" && (user_id = @request.auth.id || @request.auth.role = "manager")'

    var tasksCol = app.findCollectionByNameOrId('tasks')
    tasksCol.listRule = managerRule
    tasksCol.viewRule = managerRule
    tasksCol.updateRule = managerRule
    tasksCol.deleteRule = managerRule
    app.save(tasksCol)

    var goalsCol = app.findCollectionByNameOrId('goals')
    goalsCol.listRule = managerRule
    goalsCol.viewRule = managerRule
    goalsCol.updateRule = managerRule
    goalsCol.deleteRule = managerRule
    app.save(goalsCol)
  },
  (app) => {
    var tasksCol = app.findCollectionByNameOrId('tasks')
    tasksCol.listRule = 'user_id = @request.auth.id'
    tasksCol.viewRule = 'user_id = @request.auth.id'
    tasksCol.updateRule = 'user_id = @request.auth.id'
    tasksCol.deleteRule = 'user_id = @request.auth.id'
    app.save(tasksCol)

    var goalsCol = app.findCollectionByNameOrId('goals')
    goalsCol.listRule = 'user_id = @request.auth.id'
    goalsCol.viewRule = 'user_id = @request.auth.id'
    goalsCol.updateRule = 'user_id = @request.auth.id'
    goalsCol.deleteRule = 'user_id = @request.auth.id'
    app.save(goalsCol)
  },
)
