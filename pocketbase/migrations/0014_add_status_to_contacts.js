migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')
    if (!col.fields.getByName('status')) {
      col.fields.add(
        new SelectField({
          name: 'status',
          values: ['ativo', 'inativo'],
          maxSelect: 1,
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')
    try {
      col.fields.removeByName('status')
    } catch (_) {}
    app.save(col)
  },
)
