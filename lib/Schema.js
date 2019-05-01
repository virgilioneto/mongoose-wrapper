'use strict'
const mongoose = require('mongoose')
const { Schema } = mongoose

/**
 * @class BaseSchema
 * @extends mongoose.Schema
 * @param name {String}
 * @param fields {Object}
 * @param [options=Object] {Object=}
 * @param [logical=false] {Boolean=} if true, create only in memory instance
 */
class BaseSchema extends Schema {
  constructor (name, fields, options = {}, logical = false) {
    if (!logical) {
      if (!fields.hasOwnProperty('deletedAt')) {
        fields.deletedAt = {
          type: Date,
          required: false,
          default: null
        }
      }

      if (!options.hasOwnProperty('collection')) options.collection = name
    }

    super(fields, options)

    this.Instance = mongoose.model(name, this)
  }

  /**
   * Get model instance
   * @return {*}
   */
  getInstance () {
    return this.Instance
  }

  /**
   * Get new schema instance
   * @param fields {Object}
   * @return {*}
   * @static
   */
  static subDocument (fields) {
    return new Schema(
      fields,
      {
        _id: false
      }
    )
  }
}

module.exports = BaseSchema
