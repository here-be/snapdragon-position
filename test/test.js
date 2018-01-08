'use strict';

require('mocha');
const assert = require('assert');
const Lexer = require('./support/lexer');
const position = require('..');
let lexer;

class Token {}

describe('snapdragon-position', function() {
  beforeEach(function() {
    lexer = new Lexer({Token: Token});
    lexer.use(position());
  });

  it('should export a function', function() {
    assert.equal(typeof position, 'function');
  });

  it('should work when passed to a Token', function() {
    var pos = lexer.position();
    var token = pos(new Token({type: 'nothing'}));

    assert(token.position);
    assert(token.position.start);
    assert.equal(token.position.start.line, 1);
    assert.equal(token.position.start.column, 1);

    assert(token.position.end);
    assert.equal(token.position.end.line, 1);
    assert.equal(token.position.end.column, 1);
  });

  it('should work when called on a token instance', function() {
    var pos = lexer.position();
    var token = new Token({type: 'nothing'});
    pos(token);

    assert(token.position);
    assert(token.position.start);
    assert.equal(token.position.start.line, 1);
    assert.equal(token.position.start.column, 1);

    assert(token.position.end);
    assert.equal(token.position.end.line, 1);
    assert.equal(token.position.end.column, 1);
  });

  it('should create a new Token with the given position and val', function() {
    var pos = lexer.position();
    var obj = pos({});

    assert(obj.position);
    assert(obj.position.start);
    assert.equal(obj.position.start.line, 1);
    assert.equal(obj.position.start.column, 1);

    assert(obj.position.end);
    assert.equal(obj.position.end.line, 1);
    assert.equal(obj.position.end.column, 1);
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
        column: 1,
        line: 1
      },
      end: {
        index: 3,
        column: 4,
        line: 1
      }
    });

    assert.deepEqual(lexer.advance().position, {
      start: {
        index: 3,
        column: 4,
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
