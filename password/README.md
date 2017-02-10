# Miez Helpers - Password

This helper component will give you the ability to manipulate plain text passwords and transform them to hashed strings

## Basic usage

```javascript

const PasswordHelper = require('@miez/helpers/password');
const passwordHelper = new PasswordHelper();

// hashing a `password` using a random `salt`
passwordHelper.hash('Yourpassword', (err, hash, salt) => {
  if (err) throw err;

  console.log(hash); // '49b5d...6658e'
  console.log(salt); // '8c628...ea959'
});

// hasing a `password` using a custom `salt`
passwordHelper.hash('Yourpassword', { salt: 'my custom salt' }, (err, hash, salt) => {
  if (err) throw err;

  console.log(hash); // '49b5d...6658e'
  console.log(salt); // 'my custom salt'
});

```

## Custom options

The `PasswordHelper` class supports the following arguments:

- `len` - returned hash length, default `512`
- `saltLent` - randomly generated salt length, default `128`
- `iterations` - cost of the hash computation, default `18000`
- `digest` - algorithm used in the stretching process, default `sha512`

```javascript

const PasswordHelper = require('@miez/helpers/password');
const passwordHelper = new PasswordHelper({
  len: 256,
  saltLen: 64,
  iterations: 10000,
  digest: 'sha256'
});

```

## Methods

- `.hash()`
- `.verify()`

### hash

Creates a password hash using a strong one-way hashing algorithm. It is an abstraction over `crypto.pbkdf2()`, the random `salt` is generated using `crypto.randomBytes()`

```javascript

passwordHelper.hash(password [, options], callback);

```

Passing a custom salt:

```javascript

const opts = {
  salt: 'my very weak salt',
};

passwordHelper.hash('passwordString', opts, (err, hash, salt) => {
  if (err) throw err;

  console.log(hash); // '49b5d...6658e'
  console.log(salt); // 'my very weak salt`
});

```

To overwrite the current configuration pass a configuration object:

```javascript

const opts = {
  len: 1024,
  saltLen: 256,
  salt: 'my very weak salt',
};

passwordHelper.hash('passwordString', opts, (err, hash, salt) => {
  if (err) throw err;

  console.log(hash); // '49b5d...6658e' length 1024
  console.log(salt); // 'my very weak salt`
});

```

### verify

Verifies that a password matches a hash. Internally  uses `.hash()` method to create the hash using the provided `salt`. Returns `true` for a successful match, `false` otherwise.

```javascript

passwordHelper.verify(password, passwordHash, salt, callback);

```

Simple usage:

```javascript

passwordHelper.verify(password, passwordHash, salt, callback);
passwordHelper.verify('passwordString', '49b5d...6658e', 'initial salt', (err, result) => {
  if (err) throw err;

  console.log(result); // true
});

```

## License

[MIT](https://github.com/miezhq/miez-helpers/blob/master/LICENSE)
