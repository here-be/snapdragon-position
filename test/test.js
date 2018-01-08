'use strict';

require('mocha');
const use = require('use');
const assert = require('assert');
const Lexer = require('./support/lexer');
const Token = require('./support/token');
const position = require('..');
let lexer;

describe('snapdragon-position', function() {
  beforeEach(function() {
    lexer = new Lexer({ source: 'string' });
    lexer.use(position());
  });

  it('should patch a `.position` method onto the instance', function() {
    assert.equal(typeof lexer.position, 'function');
  });

  it('should patch a `.location` method onto the instance', function() {
    assert.equal(typeof lexer.location, 'function');
  });

  it('should throw an error if instance is invalid', function() {
    const foo = {};
    use(foo);
    assert.throws(function() {
      foo.use(position());
    }, /snapdragon/i);
  });

  it('should add `token.position` when called on a Token', function() {
    lexer.input = 'foo';
    const pos = lexer.position();
    let token = new Token();
    pos(token);

    assert.deepEqual(token.position, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 0,
        column: 0,
        line: 1
      }
    });

    lexer.capture('text', /^\w+/);
    lexer.advance();
    token = pos(new Token());

    assert.deepEqual(token.position, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 3,
        column: 3,
        line: 1
      }
    });
  });

  it('should allow a custom property to be passed to the plugin', function() {
    lexer = new Lexer('foo', { source: 'string' });
    lexer.use(position('whatever'));
    const pos = lexer.position();
    let token = new Token();
    pos(token);

    assert.deepEqual(token.whatever, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 0,
        column: 0,
        line: 1
      }
    });

    lexer.capture('text', /^\w+/);
    lexer.advance();
    token = pos(new Token());

    assert.deepEqual(token.whatever, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 3,
        column: 3,
        line: 1
      }
    });
  });

  it('should allow a custom property to be passed to the `.position` method', function() {
    lexer = new Lexer('foo', { source: 'string' });
    lexer.capture('text', /^\w+/);
    lexer.use(position());

    // custom property
    const pos = lexer.position('whatever');

    assert.deepEqual(pos(new Token()).whatever, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 0,
        column: 0,
        line: 1
      }
    });

    lexer.advance();
    assert.deepEqual(pos(new Token()).whatever, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 3,
        column: 3,
        line: 1
      }
    });
  });

  it('should allow main export to be used as a function', function() {
    lexer.capture('text', /^\w+/);
    lexer.input = 'foo/bar';
    const pos = position(lexer);
    lexer.advance();

    assert.deepEqual(pos(new Token()).position, {
      source: 'string',
      start: { index: 0, column: 0, line: 1 },
      end: { index: 3, column: 3, line: 1 }
    });
  });

  it('should take a custom prop when main export is used as a function', function() {
    lexer.capture('text', /^\w+/);
    lexer.input = 'foo/bar';
    const pos = position('whatever', lexer);
    lexer.advance();

    assert.deepEqual(pos(new Token()).whatever, {
      source: 'string',
      start: { index: 0, column: 0, line: 1 },
      end: { index: 3, column: 3, line: 1 }
    });
  });

  it('should return a Location object', function() {
    lexer.input = 'foo';

    assert.deepEqual(lexer.location(), {
      index: 0,
      column: 0,
      line: 1
    });

    lexer.capture('text', /^\w+/);
    lexer.advance();

    assert.deepEqual(lexer.location(), {
      index: 3,
      column: 3,
      line: 1
    });
  });

  it('should return the token', function() {
    const pos = lexer.position();
    const token = pos(new Token({type: 'nothing'}));
    assert(token instanceof Token);
  });

  it('should set token.position.source with lexer.options.source', function() {
    lexer = new Lexer('foo/bar', { source: 'string' });

    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);

    const start = new position.Location(lexer);
    const end = new position.Location(lexer);
    const pos = new position.Position(start, end, lexer);
    assert.equal(pos.source, 'string');
  });

  it('should set token.position.source to undefined if not defined on lexer.options', function() {
    lexer = new Lexer('foo/bar', {});

    lexer.capture('slash', /^\//);
    lexer.capture('text', /^\w+/);

    const start = new position.Location(lexer);
    const end = new position.Location(lexer);
    const pos = new position.Position(start, end);
    assert.equal(pos.source, undefined);
  });

  it('should expose a "range" getter on token.position', function() {
    lexer.input = 'abc';
    lexer.capture('text', /^\w+/);
    const token = lexer.advance();
    assert.deepEqual(token.position.range, [0, 3]);
  });

  it('should emit "position"', function(cb) {
    let count = 0;
    lexer.input = 'abc';
    lexer.on('position', () => count++);
    lexer.capture('text', /^\w+/);
    lexer.lex('text');
    assert.equal(count, 1);
    cb();
  });

  it('should lex until a match is found (integration test)', function(cb) {
    let count = 0;
    lexer.input = 'abc';
    lexer.on('position', () => count++);
    lexer.capture('nothing', /^aaalalalalal/);
    lexer.capture('text', /^\w+/);
    lexer.lex('nothing');
    lexer.lex('text');
    assert.equal(count, 1);
    cb();
  });

  it('should not fail if `.emit` is undefined', function() {
    lexer = new Lexer();
    lexer.use(position());
    let count = 0;
    lexer.emit = null;
    lexer.on('position', () => count++);
    lexer.input = 'abc';
    lexer.capture('text', /^\w+/);
    lexer.lex('text');
    assert.equal(count, 0);
  });

  it('should patch line number onto token.position', function() {
    lexer.input = 'abc\nmno\nxyx';
    lexer.capture('slash', /^\//);
    lexer.capture('star', /^\*/);
    lexer.capture('text', /^\w+/);
    lexer.capture('dot', /^\./);
    lexer.capture('newline', /^\n/);

    assert.deepEqual(lexer.advance().position, {
      source: 'string',
      start: {
        index: 0,
        column: 0,
        line: 1
      },
      end: {
        index: 3,
        column: 3,
        line: 1
      }
    });

    assert.deepEqual(lexer.advance().position, {
      source: 'string',
      start: {
        index: 3,
        column: 3,
        line: 1
      },
      end: {
        index: 4,
        column: 1,
        line: 2
      }
    });

    assert.deepEqual(lexer.advance().position, {
      source: 'string',
      start: {
        index: 4,
        column: 1,
        line: 2
      },
      end: {
        index: 7,
        column: 4,
        line: 2
      }
    });

    assert.deepEqual(lexer.advance().position, {
      source: 'string',
      start: {
        index: 7,
        column: 4,
        line: 2
      },
      end: {
        index: 8,
        column: 1,
        line: 3
      }
    });

    assert.deepEqual(lexer.advance().position, {
      source: 'string',
      start: {
        index: 8,
        column: 1,
        line: 3
      },
      end: {
        index: 11,
        column: 4,
        line: 3
      }
    });
  });
});
