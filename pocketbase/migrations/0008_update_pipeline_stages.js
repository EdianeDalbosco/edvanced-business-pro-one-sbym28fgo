/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')

    // 1. Add value field and expand choices temporarily
    if (!col.fields.getByName('value')) {
      col.fields.add(new NumberField({ name: 'value', min: 0 }))
    }

    const stageField = col.fields.getByName('pipeline_stage')
    if (stageField) {
      stageField.values = [
        'new',
        'negotiation',
        'proposal',
        'closed',
        'prospeccao',
        'abordagem',
        'agendamento',
        'reuniao_conexao_sondagem',
        'proposta',
        'negociacao',
        'fechamento',
        'no_show',
      ]
    }
    app.save(col)

    // 2. Migrate data
    app
      .db()
      .newQuery("UPDATE contacts SET pipeline_stage = 'prospeccao' WHERE pipeline_stage = 'new'")
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE contacts SET pipeline_stage = 'negociacao' WHERE pipeline_stage = 'negotiation'",
      )
      .execute()
    app
      .db()
      .newQuery("UPDATE contacts SET pipeline_stage = 'proposta' WHERE pipeline_stage = 'proposal'")
      .execute()
    app
      .db()
      .newQuery("UPDATE contacts SET pipeline_stage = 'fechamento' WHERE pipeline_stage = 'closed'")
      .execute()

    // 3. Enforce new choices
    if (stageField) {
      stageField.values = [
        'prospeccao',
        'abordagem',
        'agendamento',
        'reuniao_conexao_sondagem',
        'proposta',
        'negociacao',
        'fechamento',
        'no_show',
      ]
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')

    const stageField = col.fields.getByName('pipeline_stage')
    if (stageField) {
      stageField.values = [
        'new',
        'negotiation',
        'proposal',
        'closed',
        'prospeccao',
        'abordagem',
        'agendamento',
        'reuniao_conexao_sondagem',
        'proposta',
        'negociacao',
        'fechamento',
        'no_show',
      ]
    }
    app.save(col)

    app
      .db()
      .newQuery(
        "UPDATE contacts SET pipeline_stage = 'new' WHERE pipeline_stage = 'prospeccao' OR pipeline_stage = 'abordagem' OR pipeline_stage = 'agendamento' OR pipeline_stage = 'reuniao_conexao_sondagem' OR pipeline_stage = 'no_show'",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE contacts SET pipeline_stage = 'negotiation' WHERE pipeline_stage = 'negociacao'",
      )
      .execute()
    app
      .db()
      .newQuery("UPDATE contacts SET pipeline_stage = 'proposal' WHERE pipeline_stage = 'proposta'")
      .execute()
    app
      .db()
      .newQuery("UPDATE contacts SET pipeline_stage = 'closed' WHERE pipeline_stage = 'fechamento'")
      .execute()

    if (stageField) {
      stageField.values = ['new', 'negotiation', 'proposal', 'closed']
    }
    col.fields.removeByName('value')

    app.save(col)
  },
)
