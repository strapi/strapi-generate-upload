'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const fs = require('fs');
const path = require('path');

/**
 * Runs after this generator has finished
 *
 * @param {Object} scope
 * @param {Function} cb
 */

module.exports = function afterGenerate(scope, cb) {

  // `User` model file path.
  const userFilePath = path.resolve(scope.rootPath, 'api', 'user', 'models', 'User.settings.json');

  // Current `user` model.
  const userFile = fs.readFileSync(userFilePath);
  const userModel = JSON.parse(userFile);

  // Updated `user` model.
  userModel.attributes.filesCreated = {
    collection: 'upload',
    via: 'createdBy'
  };

  // Update the `User.settings.json` file with the new attributes.
  const newUserFile = JSON.stringify(userModel, null, '  ');
  fs.writeFileSync(userFilePath, newUserFile);

  // Trigger callback with no error to proceed.
  return cb.success();
};
