'use strict';

require('mocha');
const use = require('use');
const assert = require('assert');
const Token = require('snapdragon-token');
const position = require('..');
let lexer;

class Lexer {
  constructor() {
    this.isLexer = true;
    this.column = 0;
    this.line = 0;
    use(this);
  }
  lex(tok) {
    return tok;
  }
}

describe('snapdragon-position', function() {
  beforeEach(function() {
    lexer = new Lexer();
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
    assert.equal(token.position.start.line, 0);
    assert.equal(token.position.start.column, 0);

    assert(token.position.end);
    assert.equal(token.position.end.line, 0);
    assert.equal(token.position.end.column, 0);
  });

  it('should work when called on a token instance', function() {
    var pos = lexer.position();
    var token = new Token({type: 'nothing'});
    pos(token)

    assert(token.position);
    assert(token.position.start);
    assert.equal(token.position.start.line, 0);
    assert.equal(token.position.start.column, 0);

    assert(token.position.end);
    assert.equal(token.position.end.line, 0);
    assert.equal(token.position.end.column, 0);
  });

  it('should create a new Token with the given position and val', function() {
    var pos = lexer.position();
    var obj = pos({});

    assert(obj.position);
    assert(obj.position.start);
    assert.equal(obj.position.start.line, 0);
    assert.equal(obj.position.start.column, 0);

    assert(obj.position.end);
    assert.equal(obj.position.end.line, 0);
    assert.equal(obj.position.end.column, 0);
  });
});
