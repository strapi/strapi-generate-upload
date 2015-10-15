'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');
const fs = require('fs');

// Public node modules.
const _ = require('lodash');

module.exports = {

  /**
   * Upload files.
   *
   * @param part   File extracted from the request body.
   * @param ctx
   * @returns {*}
   */

  upload: function * (part, ctx) {

    // Init the promise.
    let deferred = Promise.defer();

    // Init and format variables.
    const promises = [];
    const defaultUploadFolder = 'public/upload';
    let stream;
    ctx = ctx || {};

    // Set the filename.
    const filename = Date.now().toString() + '-' + (_.kebabCase(part.fileName) || Math.floor(Math.random() * 1000000).toString());

    // Start uploading.
    stream = fs.createWriteStream(path.join(process.cwd(), strapi.config.upload.folder || defaultUploadFolder, filename));
    part.pipe(stream);

    // Register the data of the file in the database.
    promises.push(File.create(_.merge(part, {
      user: ctx.user && ctx.user.id,
      originalFilenameFormatted: _.kebabCase(part.fileName),
      originalFilename: part.fileName || '',
      filename: filename
    })));

    try {
      let files = yield promises;
      deferred.resolve(files);
    } catch (err) {
      strapi.log.error(err);
      deferred.reject(err);
    }

    return deferred.promise;
  }
};
