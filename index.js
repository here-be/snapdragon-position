'use strict';

/**
 * Create a new Location object with `index`, `column`,
 * and `line`
 */

class Location {
  constructor(lexer) {
    this.index = lexer.loc.index;
    this.column = lexer.loc.column;
    this.line = lexer.loc.line;
  }
}

/**
 * Create a new Position object with `start` and `end`
 * locations.
 */

class Position {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  get range() {
    return [this.start.index, this.end.index];
  }
}

/**
 * Sets the `start` location and returns a function for setting
 * the `end` location.
 *
 * ```js
 * const position = require('snapdragon-position');
 * const Lexer = require('snapdragon-lexer');
 * const lexer = new Lexer('foo/bar');
 *
 * lexer.capture('slash', /^\//);
 * lexer.capture('text', /^\w+/);
 *
 * var pos = position(lexer);
 * var token = pos(lexer.advance());
 * console.log(token);
 * ```
 * @param {Object} `lexer` Lexer instance
 * @return {Function} Returns a function that takes a `token` as its only argument
 * @api public
 */

function position(lexer) {
  if (!lexer) return position.plugin();
  const start = new Location(lexer);

  return (tok) => {
    tok.position = new Position(start, new Location(lexer));
    if (lexer.emit) lexer.emit('position', tok);
    return tok;
  };
}

/**
 * Use as a plugin to add a `.position` method to your [snapdragon-lexer][]
 * instance, which automatically adds a position object to tokens when the
 * `.lex()` method is used.
 *
 * ```js
 * var Lexer = require('snapdragon-lexer');
 * var position = require('snapdragon-position');
 * var lexer = new Lexer();
 * lexer.use(position.plugin());
 * ```
 * @api public
 */

position.plugin = () => {
  return function(lexer) {
    if (!lexer.isLexer) {
      throw new Error('expected a Snapdragon.Lexer instance');
    }

    /**
     * Get the current cursor location, with `index`, `line` and `column`.
     * This is used in the [.position()](#position) method to add the "start"
     * and "end" locations to the position object, you can also call it directly
     * when needed.
     *
     * ```js
     * const Lexer = require('snapdragon-lexer');
     * const lexer = new Lexer();
     * console.log(lexer.location());
     * //=> Location { index: 0, line: 1, column: 1 };
     * ```
     * @return {Object} Returns an object with the current lexer location, with
     * cursor `index`, `line`, and `column` numbers.
     * @api public
     */

    lexer.location = () => new Location(lexer);

    /**
     * Returns a function for getting the current position.
     *
     * ```js
     * const Lexer = require('snapdragon-lexer');
     * const lexer = new Lexer('foo/bar');
     * lexer.use(position.plugin());
     *
     * lexer.set('text', function(tok) {
     *   // get start position before advancing lexer
     *   const pos = this.position();
     *   const match = this.match(/^\w+/);
     *   if (match) {
     *     // get end position after advancing lexer (with .match)
     *     return pos(this.token(match));
     *   }
     * });
     * ```
     * @return {Function} Returns a function that takes a `token` as its only argument
     * @api public
     */

    lexer.position = () => position(lexer);

    /**
     * Override the `.lex` method to automatically patch
     * position onto returned tokens in a future-proof way.
     */

    lexer.lex = (type) => {
      const pos = lexer.position();
      const tok = lexer.constructor.prototype.lex.call(lexer, type);
      if (tok) {
        return pos(tok);
      }
    };
  };
};

/**
 * Expose `Location` and `Position` classes
 */

module.exports = position;
module.exports.Location = Location;
module.exports.Position = Position;
