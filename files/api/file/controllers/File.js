'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Public node modules.
const parse = require('co-busboy');
const _ = require('lodash');

module.exports = {

  /**
   * Upload files.
   */

  upload: function * () {

    // Init variables.
    const promises = [];
    let part;

    // `co-busboy` configuration.
    let parts = parse(this,
      _.merge(strapi.config.upload, {
        autoFields: true,

        // Validation used by `co-busboy`.
        checkFile: function (fieldname, file, filename) {
          let acceptedExtensions = strapi.config.upload.acceptedExtensions || [];
          if (acceptedExtensions[0] !== '*' && !_.contains(acceptedExtensions, path.extname(filename))) {
            deferred.reject({
              status: 400,
              error: {
                message: 'Invalid file format ' + filename ? 'for this file' + filename : ''
              }
            });
          }
        }
      }));

    // Upload each file.
    while (part = yield parts) {
      promises.push(yield strapi.api.file.services.upload.upload(part, this));
    }

    try {
      let filesDescriptions = yield promises;
      this.body = filesDescriptions;
    } catch (err) {
      strapi.log.error(err);
      this.status = err.status || 500;
      this.body = err;
    }
  }
};
