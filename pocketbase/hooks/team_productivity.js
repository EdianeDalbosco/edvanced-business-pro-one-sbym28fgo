routerAdd(
  'GET',
  '/backend/v1/team/productivity',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    try {
      const user = $app.findRecordById('users', userId)
      if (user.getString('role') !== 'manager') {
        return e.forbiddenError('Apenas gerentes podem visualizar a produtividade da equipe')
      }
    } catch (err) {
      return e.internalServerError('Erro ao verificar permissões')
    }

    let users = []
    let tasks = []

    try {
      users = $app.findRecordsByFilter('users', "id != ''", 'name', 1000, 0)
    } catch (err) {}

    try {
      tasks = $app.findRecordsByFilter('tasks', "id != ''", '-created', 10000, 0)
    } catch (err) {}

    var stats = []
    for (var i = 0; i < users.length; i++) {
      var u = users[i]
      var uid = u.id
      var userTasks = []
      for (var j = 0; j < tasks.length; j++) {
        if (tasks[j].getString('user_id') === uid) {
          userTasks.push(tasks[j])
        }
      }
      var total = userTasks.length
      var completed = 0
      for (var k = 0; k < userTasks.length; k++) {
        if (userTasks[k].getString('status') === 'concluido') {
          completed++
        }
      }
      stats.push({
        id: uid,
        name: u.getString('name') || 'Sem nome',
        email: u.getString('email') || '',
        role: u.getString('role') || 'member',
        avatar: u.getString('avatar') || '',
        totalTasks: total,
        completedTasks: completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      })
    }

    return e.json(200, stats)
  },
  $apis.requireAuth(),
)
