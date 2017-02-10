'use strict';

const DEF_LEN = 512;
const DEF_SALT_LEN = 128;
const DEF_ITERATIONS = 18000;
const DEF_DIGEST = 'sha512';

const crypto = require('crypto');

class PasswordHelper {
  constructor(opts) {
    opts = opts || {};
    this.defaultOpts = {
      len: opts.len || DEF_LEN,
      saltLen: opts.saltLen || DEF_SALT_LEN,
      iterations: opts.iterations || DEF_ITERATIONS,
      digest: opts.digest || DEF_DIGEST,
    }
  }

  /**
   * Creates a hashed string from a given string using password stretching technique.
   * If there is no `salt` specified a random string will be generated
   *
   * @param {string} password
   * @param {object} [opts] - options object
   * @param {function} callback
   */
  hash(password, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    const localOpts = Object.assign({}, this.defaultOpts, opts);

    if (opts.salt) {
      return this.hashPasswordCustomSalt(password, opts.salt, localOpts, callback);
    }

    return this.hashPassword(password, localOpts, callback);
  }

  /**
   * Creates a hashed string from a given string using password stretching technique,
   * using a randomly generated `salt`
   *
   * @param {string} password
   * @param {object} opts - options object
   * @param {function} callback
   */
  hashPassword(password, opts, callback) {
    this.generateSalt(opts, (err, salt) => {
      if (err) {
        return callback(err);
      }

      this.hashPasswordCustomSalt(password, salt, opts, callback);
    });
  }

  /**
   * Creates a hashed string from a given string using password stretching technique,
   * using a custom `salt`
   *
   * @param {string} password
   * @param {string} salt
   * @param {object} opts - options object
   * @param {function} callback
   */
  hashPasswordCustomSalt(password, salt, opts, callback) {
    opts.password = password;
    opts.salt = salt;
    this.generateDerivedKey(opts, (err, derivedKey) => {
      if (err) {
        return callback(err);
      }

      callback(null, derivedKey, opts.salt);
    });
  }

  /**
   * Generates a derived key for a specified password string
   *
   * @param {object} opts
   * @param {function} callback
   */
  generateDerivedKey(opts, callback) {
    crypto.pbkdf2(opts.password, opts.salt, opts.iterations, opts.len / 2, opts.digest, (err, derivedKey) => {
      if (err) {
        return callback(err);
      }

      return callback(null, derivedKey.toString('hex'));
    });
  }


  /**
   * Generates a random salt
   *
   * @param {object} opts
   * @param {function} callback
   */
  generateSalt(opts, callback) {
    crypto.randomBytes(opts.saltLen / 2, (err, saltBuf) => {
      if (err) {
        return callback(err);
      }

      callback(null, saltBuf.toString('hex'));
    });
  }

  /**
   * Verifies if a password matches a hash for a specific salt
   *
   * @param {string} password
   * @param {string} passwordHash
   * @param {string} salt
   * @param {function} callback
   */
  verify(password, passwordHash, salt, callback) {
    this.hash(password, { salt }, (err, hashedPassword) => {
      if (err) {
        return callback(err);
      }

      if (passwordHash === hashedPassword) {
        return callback(null, true);
      }

      callback(null, false);
    })
  }
}

module.exports = PasswordHelper;
