migrate(
  (app) => {
    let manager
    try {
      manager = app.findAuthRecordByEmail('_pb_users_auth_', 'edianedalbosco@gmail.com')
    } catch (_) {
      return
    }

    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    let member1
    try {
      member1 = app.findAuthRecordByEmail('_pb_users_auth_', 'carla.santos@edvanced.com')
    } catch (_) {
      member1 = new Record(usersCol)
      member1.setEmail('carla.santos@edvanced.com')
      member1.setPassword('Skip@Pass')
      member1.setVerified(true)
      member1.set('name', 'Carla Santos')
      member1.set('phone', '(11) 98765-4321')
      member1.set('role', 'member')
      app.save(member1)
    }

    let member2
    try {
      member2 = app.findAuthRecordByEmail('_pb_users_auth_', 'rafael.lima@edvanced.com')
    } catch (_) {
      member2 = new Record(usersCol)
      member2.setEmail('rafael.lima@edvanced.com')
      member2.setPassword('Skip@Pass')
      member2.setVerified(true)
      member2.set('name', 'Rafael Lima')
      member2.set('phone', '(11) 91234-5678')
      member2.set('role', 'member')
      app.save(member2)
    }

    const eventsCol = app.findCollectionByNameOrId('team_events')

    let existing1 = []
    try {
      existing1 = app.findRecordsByFilter(
        'team_events',
        'target_user_id = "' + member1.id + '" && action = "member_added"',
        '',
        1,
        0,
      )
    } catch (_) {}
    if (existing1.length === 0) {
      const e1 = new Record(eventsCol)
      e1.set('target_user_id', member1.id)
      e1.set('manager_id', manager.id)
      e1.set('action', 'member_added')
      e1.set('details', 'Novo membro "Carla Santos" adicionado à equipe como Membro.')
      app.save(e1)
    }

    let existing2 = []
    try {
      existing2 = app.findRecordsByFilter(
        'team_events',
        'target_user_id = "' + member2.id + '" && action = "member_added"',
        '',
        1,
        0,
      )
    } catch (_) {}
    if (existing2.length === 0) {
      const e2 = new Record(eventsCol)
      e2.set('target_user_id', member2.id)
      e2.set('manager_id', manager.id)
      e2.set('action', 'member_added')
      e2.set('details', 'Novo membro "Rafael Lima" adicionado à equipe como Membro.')
      app.save(e2)
    }

    let existing3 = []
    try {
      existing3 = app.findRecordsByFilter(
        'team_events',
        'target_user_id = "' + member1.id + '" && action = "role_changed"',
        '',
        1,
        0,
      )
    } catch (_) {}
    if (existing3.length === 0) {
      const e3 = new Record(eventsCol)
      e3.set('target_user_id', member1.id)
      e3.set('manager_id', manager.id)
      e3.set('action', 'role_changed')
      e3.set('details', 'Função de Carla Santos alterada de Membro para Gerente.')
      app.save(e3)
    }
  },
  (app) => {
    try {
      const m1 = app.findAuthRecordByEmail('_pb_users_auth_', 'carla.santos@edvanced.com')
      app.delete(m1)
    } catch (_) {}
    try {
      const m2 = app.findAuthRecordByEmail('_pb_users_auth_', 'rafael.lima@edvanced.com')
      app.delete(m2)
    } catch (_) {}
  },
)
