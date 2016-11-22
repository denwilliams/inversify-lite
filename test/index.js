import test from 'ava';
const inversify = require('inversify');
const inversifyLite = require('..');

test('something', t => {
  const container = inversifyLite.create({ inversify, require })
  .transient('one', one)
  .transient('./fixtures/some-service')
  .singleton('two', two);

  // container.get('one');
  // container.get('one');
  container.run(one => {});
});

function one(two, someService) {
  console.log('one');
}

function two() {
  console.log('two');
}
