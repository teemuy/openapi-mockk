const Parser = require('openapi-parser')()
const Maybe = require('call-me-maybe')
const jsf = require('json-schema-faker')
const faker = require('faker')
const toJsonSchema = require('openapi-schema-to-json-schema')

jsf.extend('faker', function() {
  return faker;
});


module.exports = (api) => {
  return new OpenApiMock(api)
}

class OpenApiMock {
  constructor (api, { validated } = {}) {
    this.openapi = validated ? Promise.resolve(api) : Parser.validate(api)
  }

  responses (options = {}, callback) {
    const opts = { ...options, ...{ mock: { response: true } } }
    return Maybe(callback, this.mock(opts))
  }

  mock (options = {}) {
    return this.openapi.then(api => {
      return mockSchema(api, options)
    })
  }
}

const mockSchema = (api, options) => {
  let mock = {}
  const paths = api.paths
  if (paths) {
    const path = paths[options.path]
    if (path) {
      mock[options.path] = mockPath(path, options)
    }
  }
  return mock
}

const mockPath = (path, options) => {
  let mock = {}
  const operation = path[options.operation]
  if (operation) {
    mock[options.operation] = mockOperation(operation, options)
  }
  return mock
}

const mockOperation = (operation, options) => {
  let mock = {}
  if (options.mock && options.mock.response) {
    mock.responses = mockResponses(operation, options)
  }
  return mock
}

const mockResponses = (operation, options) => {
  let mock = {}
  const responses = operation.responses
  if (responses) {
    const response = responses[options.response]
    if (response) {
      return mockResponse(response, options)
    }
  }
  return mock
}

const mockResponse = (response, options) => {
  const content = response.content
  if (content) {
    const contentType = content[options.content]
    if (contentType) {
      return mockContent(contentType, options)
    }
  }
  return ''
}

const mockContent = (contentType, options) => {
  const schema = contentType.schema || contentType
  if (schema) {
    let example
    if (options.faker) {
      example = jsf(toJsonSchema(schema))
    } else {
      if (contentType.examples) {
        example = faker.random.arrayElement(contentType.examples)
      } else if (contentType.example) {
        example = contentType.example
      } else {
        throw new Error ('no example provided, use --faker')
      }
    }
    if (example) {
      return JSON.stringify(example)
    }
  }
  return ''
}
