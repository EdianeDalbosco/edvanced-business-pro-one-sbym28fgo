migrate(
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')

    if (!tasksCol.fields.getByName('type')) {
      tasksCol.fields.add(
        new SelectField({
          name: 'type',
          values: ['task', 'meeting', 'appointment', 'project', 'delivery'],
          maxSelect: 1,
        }),
      )
    }
    if (!tasksCol.fields.getByName('start_date')) {
      tasksCol.fields.add(new DateField({ name: 'start_date' }))
    }
    if (!tasksCol.fields.getByName('progress_percent')) {
      tasksCol.fields.add(new NumberField({ name: 'progress_percent', min: 0, max: 100 }))
    }
    if (!tasksCol.fields.getByName('next_action')) {
      tasksCol.fields.add(new TextField({ name: 'next_action' }))
    }
    if (!tasksCol.fields.getByName('observations')) {
      tasksCol.fields.add(new TextField({ name: 'observations' }))
    }
    if (!tasksCol.fields.getByName('links')) {
      tasksCol.fields.add(new TextField({ name: 'links' }))
    }
    if (!tasksCol.fields.getByName('time')) {
      tasksCol.fields.add(new TextField({ name: 'time' }))
    }
    if (!tasksCol.fields.getByName('participants')) {
      tasksCol.fields.add(new TextField({ name: 'participants' }))
    }
    if (!tasksCol.fields.getByName('location')) {
      tasksCol.fields.add(new TextField({ name: 'location' }))
    }
    if (!tasksCol.fields.getByName('reminder')) {
      tasksCol.fields.add(new TextField({ name: 'reminder' }))
    }
    if (!tasksCol.fields.getByName('meeting_result')) {
      tasksCol.fields.add(new TextField({ name: 'meeting_result' }))
    }

    try {
      tasksCol.fields.removeByName('status')
    } catch (_) {}
    tasksCol.fields.add(
      new SelectField({
        name: 'status',
        values: [
          'nao_iniciado',
          'em_andamento',
          'aguardando',
          'concluido',
          'atrasado',
          'cancelado',
        ],
        maxSelect: 1,
      }),
    )

    app.save(tasksCol)

    app
      .db()
      .newQuery(
        "UPDATE tasks SET status = 'nao_iniciado' WHERE status = 'todo' OR status = '' OR status IS NULL",
      )
      .execute()
    app.db().newQuery("UPDATE tasks SET status = 'em_andamento' WHERE status = 'doing'").execute()
    app.db().newQuery("UPDATE tasks SET status = 'concluido' WHERE status = 'done'").execute()
    app.db().newQuery("UPDATE tasks SET type = 'task' WHERE type = '' OR type IS NULL").execute()
    app
      .db()
      .newQuery('UPDATE tasks SET progress_percent = 0 WHERE progress_percent IS NULL')
      .execute()

    const contractsCol = app.findCollectionByNameOrId('contracts')
    if (!contractsCol.fields.getByName('objective')) {
      contractsCol.fields.add(new TextField({ name: 'objective' }))
    }
    if (!contractsCol.fields.getByName('steps')) {
      contractsCol.fields.add(new TextField({ name: 'steps' }))
    }
    if (!contractsCol.fields.getByName('deliverables')) {
      contractsCol.fields.add(new TextField({ name: 'deliverables' }))
    }
    if (!contractsCol.fields.getByName('expected_result')) {
      contractsCol.fields.add(new TextField({ name: 'expected_result' }))
    }
    app.save(contractsCol)
  },
  (app) => {
    const tasksCol = app.findCollectionByNameOrId('tasks')
    const newFields = [
      'type',
      'start_date',
      'progress_percent',
      'next_action',
      'observations',
      'links',
      'time',
      'participants',
      'location',
      'reminder',
      'meeting_result',
    ]
    newFields.forEach((f) => {
      try {
        tasksCol.fields.removeByName(f)
      } catch (_) {}
    })
    try {
      tasksCol.fields.removeByName('status')
    } catch (_) {}
    tasksCol.fields.add(
      new SelectField({ name: 'status', values: ['todo', 'doing', 'done'], maxSelect: 1 }),
    )
    app.save(tasksCol)

    app.db().newQuery("UPDATE tasks SET status = 'todo' WHERE status = 'nao_iniciado'").execute()
    app.db().newQuery("UPDATE tasks SET status = 'doing' WHERE status = 'em_andamento'").execute()
    app.db().newQuery("UPDATE tasks SET status = 'done' WHERE status = 'concluido'").execute()

    const contractsCol = app.findCollectionByNameOrId('contracts')
    ;['objective', 'steps', 'deliverables', 'expected_result'].forEach((f) => {
      try {
        contractsCol.fields.removeByName(f)
      } catch (_) {}
    })
    app.save(contractsCol)
  },
)
