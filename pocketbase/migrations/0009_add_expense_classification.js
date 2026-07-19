migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('finance')

    if (!col.fields.getByName('expense_classification')) {
      col.fields.add(
        new SelectField({
          name: 'expense_classification',
          values: ['fixed', 'variable'],
          maxSelect: 1,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('finance')
    col.fields.removeByName('expense_classification')
    app.save(col)
  },
)
