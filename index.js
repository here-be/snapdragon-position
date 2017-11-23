'use strict';

const define = require('define-property');

/**
 * Store the position for a token
 */

class Position {
  constructor(start, lexer) {
    this.start = start;
    this.end = { line: lexer.line, column: lexer.column };
  }
}

function position(lexer) {
  var start = { line: lexer.line, column: lexer.column };
  define(start, 'consumed', lexer.consumed);
  define(start, 'input', lexer.input);

  return (token) => {
    token.position = new lexer.Position(start, lexer);
    return token;
  };
}

/**
 * Adds a `.position` method to a [snapdragon-lexer][] instance
 * for patching the start and end positions onto tokens.
 *
 * ```js
 * var Lexer = require('snapdragon-lexer');
 * var position = require('snapdragon-position');
 * var lexer = new Lexer();
 * lexer.use(position());
 * ```
 * @api public
 */

module.exports = () => {
  let lex = null;

  return function(lexer) {
    if (!this.isLexer) {
      throw new Error('expected a Snapdragon.Lexer instance');
    }

    /**
     * Set the `Position` class on `lexer.Position`
     */

    this.Position = Position;

    /**
     * Mark current position and patch `token.position` with
     * `start` and `end` line and column.
     *
     * ```js
     * lexer.set('star', function(token) {
     *   var pos = this.position();
     *   var match = this.match(/foo/);
     *   if (match) {
     *     // pass `pos` to `this.token` to patch position
     *     return pos(this.token(match[0]));
     *   }
     * });
     * ```
     * @return {Function} Returns a function that takes `token` and is called before returning the token in a lexer visitor function.
     * @api public
     */

    this.position = () => position(this);

    /**
     * Override the `.lex` method to patch position onto returned nodes
     */

    if (!lex) lex = this.lex.bind(this);
    this.lex = (type) => {
      const pos = this.position();
      const tok = lex(type);
      if (tok) {
        return pos(tok);
      }
    };
  };
};

/**
 * Expose `Position`
 */

module.exports.Position = Position;
module.exports.position = position;
