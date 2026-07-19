migrate(
  (app) => {
    const planningCol = app.findCollectionByNameOrId('business_planning')
    if (!planningCol.fields.getByName('priorities')) {
      planningCol.fields.add(new TextField({ name: 'priorities' }))
    }
    app.save(planningCol)

    const goalsCol = app.findCollectionByNameOrId('goals')

    if (!goalsCol.fields.getByName('related_objective')) {
      goalsCol.fields.add(new TextField({ name: 'related_objective' }))
    }
    if (!goalsCol.fields.getByName('period_month')) {
      goalsCol.fields.add(new TextField({ name: 'period_month' }))
    }
    if (!goalsCol.fields.getByName('expected_result')) {
      goalsCol.fields.add(new TextField({ name: 'expected_result' }))
    }
    if (!goalsCol.fields.getByName('indicator')) {
      goalsCol.fields.add(new TextField({ name: 'indicator' }))
    }
    if (!goalsCol.fields.getByName('initial_value')) {
      goalsCol.fields.add(new NumberField({ name: 'initial_value' }))
    }
    if (!goalsCol.fields.getByName('observations')) {
      goalsCol.fields.add(new TextField({ name: 'observations' }))
    }
    if (!goalsCol.fields.getByName('priority')) {
      goalsCol.fields.add(
        new SelectField({ name: 'priority', values: ['low', 'medium', 'high'], maxSelect: 1 }),
      )
    }
    if (!goalsCol.fields.getByName('progress_percent')) {
      goalsCol.fields.add(new NumberField({ name: 'progress_percent', min: 0, max: 100 }))
    }

    try {
      goalsCol.fields.removeByName('status')
    } catch (_) {}
    goalsCol.fields.add(
      new SelectField({
        name: 'status',
        values: [
          'nao_iniciada',
          'em_andamento',
          'em_risco',
          'concluida',
          'nao_alcancada',
          'cancelada',
        ],
        maxSelect: 1,
      }),
    )

    app.save(goalsCol)

    app
      .db()
      .newQuery(
        "UPDATE goals SET status = 'nao_iniciada' WHERE status = 'pending' OR status = '' OR status IS NULL",
      )
      .execute()
    app
      .db()
      .newQuery("UPDATE goals SET status = 'em_andamento' WHERE status = 'in_progress'")
      .execute()
    app.db().newQuery("UPDATE goals SET status = 'concluida' WHERE status = 'completed'").execute()
    app.db().newQuery("UPDATE goals SET status = 'cancelada' WHERE status = 'cancelled'").execute()
    app
      .db()
      .newQuery("UPDATE goals SET priority = 'medium' WHERE priority = '' OR priority IS NULL")
      .execute()
    app
      .db()
      .newQuery('UPDATE goals SET progress_percent = 0 WHERE progress_percent IS NULL')
      .execute()
  },
  (app) => {
    const planningCol = app.findCollectionByNameOrId('business_planning')
    try {
      planningCol.fields.removeByName('priorities')
    } catch (_) {}
    app.save(planningCol)

    const goalsCol = app.findCollectionByNameOrId('goals')
    ;[
      'related_objective',
      'period_month',
      'expected_result',
      'indicator',
      'initial_value',
      'observations',
      'priority',
      'progress_percent',
    ].forEach((f) => {
      try {
        goalsCol.fields.removeByName(f)
      } catch (_) {}
    })
    try {
      goalsCol.fields.removeByName('status')
    } catch (_) {}
    goalsCol.fields.add(
      new SelectField({
        name: 'status',
        values: ['pending', 'in_progress', 'completed', 'cancelled'],
        maxSelect: 1,
      }),
    )
    app.save(goalsCol)

    app.db().newQuery("UPDATE goals SET status = 'pending' WHERE status = 'nao_iniciada'").execute()
    app
      .db()
      .newQuery(
        "UPDATE goals SET status = 'in_progress' WHERE status = 'em_andamento' OR status = 'em_risco'",
      )
      .execute()
    app.db().newQuery("UPDATE goals SET status = 'completed' WHERE status = 'concluida'").execute()
    app
      .db()
      .newQuery(
        "UPDATE goals SET status = 'cancelled' WHERE status = 'nao_alcancada' OR status = 'cancelada'",
      )
      .execute()
  },
)
