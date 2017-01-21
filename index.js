'use strict';

var Node = require('snapdragon-node');

/**
 * Store the position for a node
 */

function Position(start, parser) {
  this.start = start;
  this.end = { line: parser.line, column: parser.column };
}

/**
 * Adds a `.position` method to a [snapdragon][] `Parser` instance.
 *
 * ```js
 * var Snapdragon = require('snapdragon');
 * var position = require('snapdragon-position');
 * var parser = new Snapdragon.Parser();
 * parser.use(position());
 * ```
 * @api public
 */

module.exports = function() {
  return function(snapdragon) {
    if (snapdragon.isSnapdragon) {
      snapdragon.parser.define('position', position);

    } else if (snapdragon.isParser) {
      snapdragon.define('position', position);

    } else {
      throw new Error('expected an instance of snapdragon or snapdragon.parser');
    }
  };
};

/**
 * Mark position and patch `node.position` with `start` and `end` line and column.
 *
 * ```js
 * parser.set('foo', function(node) {
 *   var pos = this.position();
 *   var match = this.match(/foo/);
 *   if (match) {
 *     // pass `pos` to `this.node` to patch position
 *     return pos(this.node(match[0]));
 *   }
 * });
 * ```
 * @return {Function} Returns a function that takes `node` and is called before returning the node in a parser visitor function.
 * @api public
 */

function position() {
  var self = this || { line: 0, column: 0, stack: [] };
  var start = { line: self.line, column: self.column };
  var parsed = self.parsed;

  return function pos(node) {
    if (!node.isNode) node = new Node(node);

    node.position = new Position(start, self);
    if (node.isNode) {
      node.define('parsed', parsed);
      node.define('inside', self.stack.length > 0);
      node.define('rest', self.input);
    }
    return node;
  };
}

/**
 * Expose `Position`
 */

module.exports.Position = Position;

/**
 * Expose `position`
 */

module.exports.position = position;
