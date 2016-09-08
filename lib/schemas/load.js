/* eslint-disable  import/no-unresolved */
var nodePath = require('path');
var fs = require('fs');
var _ = require('lodash');
var cachedPrimitives;
var cachedComposite;

function getFromCache() {
  try {
    return require('../../cache/models.json');
  } catch (e) {
    return false;
  }
}

function cacheSchema(schema) {
  return fs.writeFileSync(__dirname + '/../../cache/models.json', JSON.stringify(schema));
}

/**
 * Get all kind of schemas
 * @param settings <settings.models>
 * @returns {Object} collected schemas key-value
 */
function collectAllSchemas(settings) {
  var jsonSchema = {};
  var reduxSchema = {};
  var schemas = {};
  if (settings.json) {
    jsonSchema = require('./formats/json')(settings.json);
  }
  if (settings.redux) {
    reduxSchema = require('./formats/redux')(settings.redux);
  }
  schemas = _.assign(jsonSchema, reduxSchema);

  return schemas;
}

/**
 * Preparing models
 * @param {Object} settings <settings>
 */
function loadComposite(settings) {
  if (cachedComposite) return cachedComposite;
  var schemas;
  if (!settings || !settings.models) {
    throw new Error('Please provide settings.typelint.models section in your eslint config');
  }
  if (settings.useCache) {
    schemas = getFromCache() || cacheSchema(collectAllSchemas(settings.models));
  } else {
    schemas = collectAllSchemas(settings.models);
  }
  cachedComposite = schemas;
  return schemas;
}

function loadPrimitive() {
  if (cachedPrimitives) return cachedPrimitives;
  var wrap = function (props, title) {
    return {
      type: 'object',
      title: title,
      properties: props.reduce(function (prev, prop) {
        prev[prop] = 'string';
        return prev;
      }, {})
    };
  };
  cachedPrimitives = {
    string: wrap(Object.getOwnPropertyNames(String.prototype), 'string'),
    array: wrap(Object.getOwnPropertyNames(Array.prototype), 'array'),
    number: wrap(Object.getOwnPropertyNames(Number.prototype), 'number'),
    boolean: wrap(Object.getOwnPropertyNames(Boolean.prototype), 'object'),
  };
  return cachedPrimitives;
}

module.exports = {
  loadPrimitive: loadPrimitive,
  loadComposite: loadComposite,
};