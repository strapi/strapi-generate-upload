'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Public node modules.
const _ = require('lodash');
const parse = require('co-busboy');

module.exports = {

  /**
   * Upload files.
   */

  upload: function * () {

    // Init variables.
    const promises = [];
    let part;

    // `co-busboy` configuration.
    const parts = parse(this,
      _.merge(strapi.api.upload.config, {
        autoFields: true,

        // Validation used by `co-busboy`.
        checkFile: function (fieldname, file, filename) {
          const acceptedExtensions = strapi.api.upload.config.acceptedExtensions || [];
          if (acceptedExtensions[0] !== '*' && !_.contains(acceptedExtensions, path.extname(filename))) {
            this.status = 400;
            this.body = {
              message: 'Invalid file format ' + filename ? 'for this file' + filename : ''
            };
          }
        }
      }));

    // Upload each file.
    while (part = yield parts) {
      promises.push(yield strapi.api.upload.services.upload.upload(part, this));
    }

    try {
      const uploadDescriptions = yield promises;
      this.body = uploadDescriptions;
    } catch (err) {
      strapi.log.error(err);
      this.status = err.status || 500;
      this.body = err;
    }
  }
};
