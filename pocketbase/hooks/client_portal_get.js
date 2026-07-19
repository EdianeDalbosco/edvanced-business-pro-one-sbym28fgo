routerAdd('GET', '/backend/v1/portal/{token}', (e) => {
  const token = e.request.pathValue('token')
  if (!token) return e.badRequestError('Token missing')

  try {
    // Run as admin to bypass RLS securely for this specific public view
    let contact
    let contracts = []

    $app.runInTransaction((txApp) => {
      contact = txApp.findFirstRecordByData('contacts', 'portal_token', token)
      try {
        contracts = txApp.findRecordsByFilter(
          'contracts',
          `contact_id = '${contact.id}'`,
          '-created',
          100,
          0,
        )
      } catch (err) {
        contracts = []
      }
    })

    return e.json(200, {
      contact: {
        id: contact.id,
        name: contact.getString('name'),
        email: contact.getString('email'),
      },
      contracts: contracts.map((c) => ({
        id: c.id,
        title: c.getString('title'),
        status: c.getString('status'),
        value: c.getFloat('value'),
        file: c.getString('file') ? `/api/files/contracts/${c.id}/${c.getString('file')}` : null,
        created: c.getString('created'),
      })),
    })
  } catch (err) {
    return e.notFoundError('Portal not found')
  }
})
