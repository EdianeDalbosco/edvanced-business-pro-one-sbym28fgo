migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('finance')

    if (!col.fields.getByName('issue_date')) {
      col.fields.add(new DateField({ name: 'issue_date' }))
    }
    if (!col.fields.getByName('document_number')) {
      col.fields.add(new TextField({ name: 'document_number' }))
    }
    if (!col.fields.getByName('cost_center')) {
      col.fields.add(new TextField({ name: 'cost_center' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('finance')
    col.fields.removeByName('issue_date')
    col.fields.removeByName('document_number')
    col.fields.removeByName('cost_center')
    app.save(col)
  },
)
