onRecordCreateRequest((e) => {
  if (!e.record.get('user_id') && e.auth) {
    e.record.set('user_id', e.auth.id)
  }
  e.next()
}, 'marketing_content')
