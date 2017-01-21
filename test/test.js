'use strict';

require('mocha');
var assert = require('assert');
var Node = require('snapdragon-node');
var position = require('..').position;


describe('snapdragon-position', function() {
  it('should export a function', function() {
    assert.equal(typeof Node, 'function');
  });

  it('should work when passed to a Node', function() {
    var pos = position();
    var node = pos(new Node());

    assert(node.position);
    assert(node.position.start);
    assert.equal(node.position.start.line, 0);
    assert.equal(node.position.start.column, 0);

    assert(node.position.end);
    assert.equal(node.position.end.line, 0);
    assert.equal(node.position.end.column, 0);
  });

  it('should work when called on a node instance', function() {
    var pos = position();
    var node = new Node();
    pos(node)

    assert(node.position);
    assert(node.position.start);
    assert.equal(node.position.start.line, 0);
    assert.equal(node.position.start.column, 0);

    assert(node.position.end);
    assert.equal(node.position.end.line, 0);
    assert.equal(node.position.end.column, 0);
  });

  it('should create a new Node with the given position and val', function() {
    var pos = position();
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
