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
    lexer = new Lexer();
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

  it('should return a Position object', function() {
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
    const lexer2 = new Lexer();
    lexer2.use(position());
    let count = 0;
    lexer2.emit = null;
    lexer.on('position', () => count++);
    lexer2.input = 'abc';
    lexer2.capture('text', /^\w+/);
    lexer2.lex('text');
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
