'use strict'

class Repository {
  constructor (model) {
    this._model = model
  }

  getById (
    id,
    {
      trashed = false,
      lean = false,
      select = null,
      populateRef = '',
      populateFields = ''
    } = Object
  ) {
    return this.getOne(
      {
        where: { _id: id },
        trashed,
        lean,
        select,
        populateRef,
        populateFields
      }
    )
  }
  getOne (
    {
      where = {},
      sort = { _id: 1 },
      trashed = false,
      lean = false,
      fields = null,
      populateRef = '',
      populateFields = ''
    } = Object
  ) {
    if (!trashed) where['deletedAt'] = null
    let query = this._model.findOne(where)
    query.select(fields)
    query.populate(populateRef, populateFields)
    query.sort(sort)
    query.lean(lean)
    return query.exec()
  }
  getList (
    {
      where = {},
      sort = { _id: 1 },
      trashed = false,
      lean = false,
      fields = null,
      populateRef = '',
      populateFields = '',
      page = 1,
      itemsPerPage = 100
    } = Object
  ) {
    if (!trashed) where['deletedAt'] = null
    return new Promise((resolve, reject) => {
      let promises = []
      if (page && itemsPerPage) {
        promises.push(this.count(where, trashed))
      }

      promises.push(new Promise((resolve, reject) => {
        let query = this._model.find(where)
        query.select(fields)
        query.populate(populateRef, populateFields)
        query.sort(sort)
        query.lean(lean)
        if (page && itemsPerPage) {
          query.limit(itemsPerPage)
          query.skip((page - 1) * itemsPerPage)
        }
        query.exec()
          .then(resolve)
          .catch(reject)
      }))

      Promise.all(promises)
        .then(data => {
          let count
          let result
          let payload = {}
          if (data.length === 2) {
            count = data[0]
            result = data[1]
          } else {
            result = data[0]
          }
          if (page && itemsPerPage) {
            payload['page'] = page
            payload['itemsPerPage'] = itemsPerPage
            payload['itemsRemaining'] = count - result.length
          }

          payload['resultCount'] = result.length
          payload['result'] = result
          resolve(payload)
        })
        .catch(reject)
    })
  }

  count (
    {
      where = {},
      trashed = false
    }
  ) {
    if (!trashed) where['deletedAt'] = null
    return this._model.countDocuments(where)
  }

  create (data) {
    delete data['deletedAt']
    return this._model.create(data)
  }
  update (id, data) {
    delete data['deletedAt']
    return this._model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      {
        useFindAndModify: false,
        new: true
      }
    )
  }
  delete (id) {
    return this._model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      {
        useFindAndModify: false,
        new: true
      }
    )
  }
  restore (id) {
    return this._model.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      {
        useFindAndModify: false,
        new: true
      }
    )
  }
}

module.exports = Repository
