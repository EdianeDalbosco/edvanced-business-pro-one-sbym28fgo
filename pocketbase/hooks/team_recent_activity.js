routerAdd(
  'GET',
  '/backend/v1/team/recent-activity',
  (e) => {
    const userId = e.auth && e.auth.id
    if (!userId) return e.unauthorizedError('auth required')

    try {
      const user = $app.findRecordById('users', userId)
      if (user.getString('role') !== 'manager') {
        return e.forbiddenError('Apenas gerentes podem visualizar a atividade da equipe')
      }
    } catch (err) {
      return e.internalServerError('Erro ao verificar permissões')
    }

    var users = []
    var tasks = []
    var interactions = []

    try {
      users = $app.findRecordsByFilter('users', "id != ''", 'name', 1000, 0)
    } catch (err) {}

    try {
      tasks = $app.findRecordsByFilter('tasks', "id != ''", '-created', 50, 0)
    } catch (err) {}

    try {
      interactions = $app.findRecordsByFilter('client_interactions', "id != ''", '-created', 50, 0)
    } catch (err) {}

    var userMap = {}
    for (var i = 0; i < users.length; i++) {
      userMap[users[i].id] = users[i].getString('name') || 'Sem nome'
    }

    var activities = []

    for (var t = 0; t < tasks.length; t++) {
      var task = tasks[t]
      var tUid = task.getString('user_id')
      activities.push({
        id: task.id,
        type: 'task',
        title: task.getString('title'),
        status: task.getString('status'),
        created: task.getString('created'),
        user_id: tUid,
        user_name: userMap[tUid] || 'Desconhecido',
      })
    }

    for (var n = 0; n < interactions.length; n++) {
      var inter = interactions[n]
      var iUid = inter.getString('user_id')
      activities.push({
        id: inter.id,
        type: 'interaction',
        description: inter.getString('description'),
        interaction_type: inter.getString('type'),
        created: inter.getString('created'),
        contact_id: inter.getString('contact_id'),
        user_id: iUid,
        user_name: userMap[iUid] || 'Desconhecido',
      })
    }

    activities.sort(function (a, b) {
      return new Date(b.created).getTime() - new Date(a.created).getTime()
    })

    return e.json(200, activities.slice(0, 5))
  },
  $apis.requireAuth(),
)
