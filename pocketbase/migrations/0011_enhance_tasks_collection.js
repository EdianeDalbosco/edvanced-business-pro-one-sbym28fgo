migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    const goalsId = app.findCollectionByNameOrId('goals').id
    const contractsId = app.findCollectionByNameOrId('contracts').id

    if (!col.fields.getByName('business_area')) {
      col.fields.add(new TextField({ name: 'business_area' }))
    }
    if (!col.fields.getByName('recurrence')) {
      col.fields.add(
        new SelectField({ name: 'recurrence', values: ['none', 'daily', 'weekly'], maxSelect: 1 }),
      )
    }
    if (!col.fields.getByName('goal_id')) {
      col.fields.add(new RelationField({ name: 'goal_id', collectionId: goalsId, maxSelect: 1 }))
    }
    if (!col.fields.getByName('contract_id')) {
      col.fields.add(
        new RelationField({ name: 'contract_id', collectionId: contractsId, maxSelect: 1 }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    col.fields.removeByName('business_area')
    col.fields.removeByName('recurrence')
    col.fields.removeByName('goal_id')
    col.fields.removeByName('contract_id')
    app.save(col)
  },
)
