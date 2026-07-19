/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')

    if (!col.fields.getByName('mentor_name')) col.fields.add(new TextField({ name: 'mentor_name' }))
    if (!col.fields.getByName('mentor_document'))
      col.fields.add(new TextField({ name: 'mentor_document' }))
    if (!col.fields.getByName('mentor_address'))
      col.fields.add(new TextField({ name: 'mentor_address' }))
    if (!col.fields.getByName('mentee_name')) col.fields.add(new TextField({ name: 'mentee_name' }))
    if (!col.fields.getByName('mentee_document'))
      col.fields.add(new TextField({ name: 'mentee_document' }))
    if (!col.fields.getByName('mentee_address'))
      col.fields.add(new TextField({ name: 'mentee_address' }))
    if (!col.fields.getByName('sessions_count'))
      col.fields.add(new NumberField({ name: 'sessions_count' }))
    if (!col.fields.getByName('frequency')) col.fields.add(new TextField({ name: 'frequency' }))
    if (!col.fields.getByName('schedule_details'))
      col.fields.add(new TextField({ name: 'schedule_details' }))
    if (!col.fields.getByName('session_location'))
      col.fields.add(new TextField({ name: 'session_location' }))
    if (!col.fields.getByName('payment_terms'))
      col.fields.add(new TextField({ name: 'payment_terms' }))
    if (!col.fields.getByName('city')) col.fields.add(new TextField({ name: 'city' }))
    if (!col.fields.getByName('district')) col.fields.add(new TextField({ name: 'district' }))

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')

    col.fields.removeByName('mentor_name')
    col.fields.removeByName('mentor_document')
    col.fields.removeByName('mentor_address')
    col.fields.removeByName('mentee_name')
    col.fields.removeByName('mentee_document')
    col.fields.removeByName('mentee_address')
    col.fields.removeByName('sessions_count')
    col.fields.removeByName('frequency')
    col.fields.removeByName('schedule_details')
    col.fields.removeByName('session_location')
    col.fields.removeByName('payment_terms')
    col.fields.removeByName('city')
    col.fields.removeByName('district')

    app.save(col)
  },
)
