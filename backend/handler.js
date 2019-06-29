const connectToDatabase = require('./db') // initialize connection

// simple Error constructor for handling HTTP error codes
function HTTPError (statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

module.exports.healthCheck = async () => {
  await connectToDatabase()
  console.log('Connection successful.')
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Connection successful.' })
  }
}

module.exports.create = async (event) => {
  try {
    const { Department } = await connectToDatabase()
    const department = await Department.create(JSON.parse(event.body))
    return {
      statusCode: 200,
      body: JSON.stringify(department)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the department.'
    }
  }
}

module.exports.getOne = async (event) => {
  try {
    const { Department } = await connectToDatabase()
    const department = await Department.findById(event.pathParameters.id)
    if (!department) throw new HTTPError(404, `Department with id: ${event.pathParameters.id} was not found`)
    return {
      statusCode: 200,
      body: JSON.stringify(department)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not fetch the Department.'
    }
  }
}

module.exports.getAll = async () => {
  try {
    const { Department } = await connectToDatabase()
    const departments = await Department.findAll()
    return {
      statusCode: 200,
      body: JSON.stringify(departments)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not fetch the departments.'
    }
  }
}

module.exports.update = async (event) => {
  try {
    const input = JSON.parse(event.body)
    const { Department } = await connectToDatabase()
    const department = await Department.findById(event.pathParameters.id)
    if (!department) throw new HTTPError(404, `Department with id: ${event.pathParameters.id} was not found`)
    if (input.title) department.title = input.title
    if (input.description) department.description = input.description
    await department.save()
    return {
      statusCode: 200,
      body: JSON.stringify(department)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could not update the Department.'
    }
  }
}

module.exports.destroy = async (event) => {
  try {
    const { Department } = await connectToDatabase()
    const department = await Department.findById(event.pathParameters.id)
    if (!department) throw new HTTPError(404, `Department with id: ${event.pathParameters.id} was not found`)
    await department.destroy()
    return {
      statusCode: 200,
      body: JSON.stringify(department)
    }
  } catch (err) {
    return {
      statusCode: err.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Could destroy fetch the Department.'
    }
  }
}