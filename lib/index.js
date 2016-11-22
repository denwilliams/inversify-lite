const annotate = require('fn-annotate');
const path = require('path');
const utils = require('./utils');

exports.create = (opts) => {
  if (!opts.container && !opts.inversify) {
    throw new Error('Requires either inversify module or an existing container to be provided')
  }
  if (!opts.inversify) {
    throw new Error('Requires inversify module to be provided')
  }
  const container = opts.container || new opts.inversify.Container();

  return new Builder(container, opts.inversify, opts.require || require);
};

class Builder {
  constructor(container, inversify, require) {
    this._container = container;
    this._inversify = inversify;
    this._require = require;
  }

  _bindPath(servicePath, opts) {
    const fn = this._require(servicePath);
    const type = dashToCamel(path.basename(servicePath));
    return this._bindFactory(type, fn, opts);
  }

  _bindFactory(type, fn, opts) {
    const args = annotate(fn);

    const binding = this._container.bind(type).toDynamicValue(ctx => {
      const deps = args.map(type => ctx.container.get(type));
      fn.apply(null, deps);
    });

    if (opts && opts.lifecycle === 'singleton') binding.inSingletonScope();

    return this;
  }

  _getDeps(types) {
    return types.map(type => this._container.get(type));
  }

  _bindClass(type, ctor, opts) {
    this._inversify.decorate(inversify.injectable(), fn);

    const args = annotate(fn);
    args.forEach((arg, i) => {
      this._inversify.decorate(inversify.inject(arg), fn, i);
    });

    const binding = this._container.bind(type).to(ctor);

    if (opts && opts.lifecycle === 'singleton') binding.inSingletonScope();

    return this;
  }

  register() {
    if (arguments.length === 1) return this._bindPath(arguments[1]);
    return this._bindFactory.apply(this, arguments);
  }

  singleton() {
    if (arguments.length === 1) return this._bindPath(arguments[0], { lifecycle: 'singleton' });
    return this._bindFactory(arguments[0], arguments[1], { lifecycle: 'singleton' });
  }

  transient() {
    if (arguments.length === 1) return this._bindPath(arguments[0], { lifecycle: 'transient' });
    return this._bindFactory(arguments[0], arguments[1], { lifecycle: 'transient' });
  }

  get(type) {
    return this._container.get(type);
  }

  run(fn) {
    const args = annotate(fn);
    const deps = this._getDeps(args);
    fn.apply(null, deps);
  }
}

function dashToCamel(str) {
  return str.replace(/\-([a-z])/g, function(m,a) {
    return a.toUpperCase();
  });
}
