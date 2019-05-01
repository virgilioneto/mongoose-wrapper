'use strict'
const mongoose = require('mongoose')
mongoose.Promise = Promise

/**
 * MongoDB wrapper for MongooseJS
 * @see {@link http://mongoosejs.com/|MongooseJS} for more details and samples
 * @class MongoDB
 */
class MongoDB {
  /**
   * MongoDB connection
   * @param connectionString {String}
   * @returns {*} database instance
   */
  static connect (connectionString) {
    mongoose.connect(connectionString, { useNewUrlParser: true })
    return mongoose.connection
  }
}

module.exports = MongoDB
module.exports.Schema = require('./Schema')
module.exports.Repository = require('./Repository')
