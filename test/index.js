import test from 'ava';
const inversify = require('inversify');
const inversifyLite = require('..');

test('something', t => {
  const container = inversifyLite.create({ inversify })
  .register('one', one)
  .transient('two', two);

  container.get('one');
  container.get('one');
});

function one(two) {
  console.log('one');
}

function two() {
  console.log('two');
}
