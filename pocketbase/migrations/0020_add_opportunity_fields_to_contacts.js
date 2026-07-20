/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')

    if (!col.fields.getByName('contact_nature')) {
      col.fields.add(
        new SelectField({
          name: 'contact_nature',
          values: ['pessoa_fisica', 'pessoa_juridica'],
          maxSelect: 1,
        }),
      )
    }
    if (!col.fields.getByName('organization')) {
      col.fields.add(new TextField({ name: 'organization' }))
    }
    if (!col.fields.getByName('lead_source')) {
      col.fields.add(new TextField({ name: 'lead_source' }))
    }
    if (!col.fields.getByName('next_follow_up')) {
      col.fields.add(new DateField({ name: 'next_follow_up' }))
    }
    if (!col.fields.getByName('notes')) {
      col.fields.add(new TextField({ name: 'notes' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contacts')

    try {
      col.fields.removeByName('contact_nature')
    } catch (_) {}
    try {
      col.fields.removeByName('organization')
    } catch (_) {}
    try {
      col.fields.removeByName('lead_source')
    } catch (_) {}
    try {
      col.fields.removeByName('next_follow_up')
    } catch (_) {}
    try {
      col.fields.removeByName('notes')
    } catch (_) {}

    app.save(col)
  },
)
