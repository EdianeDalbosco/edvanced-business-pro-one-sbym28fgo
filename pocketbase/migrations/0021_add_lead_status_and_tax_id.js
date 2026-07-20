migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')

    try {
      col.fields.removeByName('status')
    } catch (_) {}
    col.fields.add(
      new SelectField({
        name: 'status',
        values: ['lead', 'ativo', 'inativo'],
        maxSelect: 1,
      }),
    )

    if (!col.fields.getByName('tax_id')) {
      col.fields.add(new TextField({ name: 'tax_id' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')

    try {
      col.fields.removeByName('status')
    } catch (_) {}
    col.fields.add(
      new SelectField({
        name: 'status',
        values: ['ativo', 'inativo'],
        maxSelect: 1,
      }),
    )

    try {
      col.fields.removeByName('tax_id')
    } catch (_) {}

    app.save(col)
  },
)
