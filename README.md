# snapdragon-position [![NPM version](https://img.shields.io/npm/v/snapdragon-position.svg?style=flat)](https://www.npmjs.com/package/snapdragon-position) [![NPM monthly downloads](https://img.shields.io/npm/dm/snapdragon-position.svg?style=flat)](https://npmjs.org/package/snapdragon-position) [![NPM total downloads](https://img.shields.io/npm/dt/snapdragon-position.svg?style=flat)](https://npmjs.org/package/snapdragon-position) [![Linux Build Status](https://img.shields.io/travis/here-be/snapdragon-position.svg?style=flat&label=Travis)](https://travis-ci.org/here-be/snapdragon-position)

> Snapdragon util and plugin for patching the position on an AST node.

Please consider following this project's author, [Jon Schlinkert](https://github.com/jonschlinkert), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save snapdragon-position
```

## What does this do?

Adds a `.position` object to tokens that looks something like this:

```js
{
  source: 'string',
  start: { index: 0, column: 1, line: 1 },
  end: { index: 3, column: 4, line: 1 },
  range: [0, 3] // getter
}
```

When used as [snapdragon-lexer](https://github.com/here-be-snapdragons/snapdragon-lexer) plugin, this adds a `.position()` method to the instance and patches the `lexer.lex()` and `lexer.handle()` methods to automatically add [position objects](#position-objects) to tokens.

There is a more [detailed example](#example-usage) below.

**Heads up!**

If you would prefer for the property name to be `token.loc` rather than `token.position`, use [snapdragon-location](https://github.com/here-be/snapdragon-location) instead.

## API

The main export is a function that can be [used as a plugin](#plugin-usage) with [snapdragon-lexer](https://github.com/here-be-snapdragons/snapdragon-lexer), or called directly with an instance of [snapdragon-lexer](https://github.com/here-be-snapdragons/snapdragon-lexer).

### [position](index.js#L25)

Sets the `start` position and returns a function for setting the `end` position on a token.

**Params**

* `name` **{String|Object}**: (optional) Snapdragon Lexer or Tokenizer instance, or the name to use for the position property on the token. Default is `position`.
* `target` **{Object}**: Snapdragon Lexer or Tokenizer instance
* `returns` **{Function}**: Returns a function that takes a `token` as its only argument

**Example**

```js
const position = require('snapdragon-position');
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer('foo/bar');

lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);

const pos = position(lexer);
const token = pos(lexer.advance());
console.log(token);
```

### [.plugin](index.js#L51)

Use as a plugin to add a `.position` method to your [snapdragon-lexer](https://github.com/here-be-snapdragons/snapdragon-lexer) or [snapdragon-tokenizer][] instance to automatically add a position object to tokens when the `.lex()` or `.handle()` methods are used.

**Example**

```js
const Lexer = require('snapdragon-lexer');
const position = require('snapdragon-position');
const lexer = new Lexer();
lexer.use(position());
```

### [.location](index.js#L73)

Get the current source location, with `index`, `column` and `line`. Used by [.position()](#position) to create the "start" and "end" locations.

* `returns` **{Object}**: Returns an object with the current source location.

**Example**

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer();
console.log(lexer.location());
//=> Location { index: 0, column: 0, line: 1 };
```

### [.position](index.js#L97)

Returns a function for getting the current position.

* `returns` **{Function}**: Returns a function that takes a `token` as its only argument, and patches a `.position` property onto the token.

**Example**

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer('foo/bar');
lexer.use(position());

lexer.set('text', function(tok) {
  // get start position before advancing lexer
  const pos = this.position();
  const match = this.match(/^\w+/);
  if (match) {
    // get end position after advancing lexer (with .match)
    return pos(this.token(match));
  }
});
```

**Params**

* `start` **{Object}**: (required) Starting [location](#location)
* `end` **{Object}**: (required) Ending [location](#location)
* `target` **{Object}**: (optional) Snapdragon Lexer or Tokenizer instance
* `returns` **{Object}**

**Example**

```js
const Lexer = require('snapdragon-lexer');
const Location = require('snapdragon-position').Location;
const lexer = new Lexer('foo/bar');
lexer.capture('text', /^\w+/);
lexer.advance();
console.log(new Location(lexer));
//=> Location { index: 3, column: 4, line: 1 }
```

**Params**

* `start` **{Object}**: (required) Starting [location](#location)
* `end` **{Object}**: (required) Ending [location](#location)
* `target` **{Object}**: (optional) Snapdragon Lexer or Tokenizer instance
* `returns` **{Object}**

**Example**

```js
const Lexer = require('snapdragon-lexer');
const position = require('snapdragon-location');
const lexer = new Lexer('foo/bar')
  .capture('slash', /^\//)
  .capture('text', /^\w+/);

const start = new position.Location(lexer);
lexer.advance();
const end = new position.Location(lexer);
console.log(new position.Position(start, end, lexer));
// Position {
//   source: undefined,
//   start: Location { index: 0, column: 1, line: 1 },
//   end: Location { index: 3, column: 4, line: 1 } }
```

### Plugin usage

When used as a plugin, this adds a `.position()` method to a [snapdragon-lexer](https://github.com/here-be-snapdragons/snapdragon-lexer) instance, for adding [position information](#position-information) to tokens.

**Example**

```js
const position = require('snapdragon-position');
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer('foo/bar');
lexer.use(position());

lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);

var token = lexer.advance();
console.log(token);
```

Adds a `.position` object to the token, like this:

```js
Token {
  type: 'text',
  value: 'foo',
  match: [ 'foo', index: 0, input: 'foo/*' ],
  position: {
    start: { index: 0, column: 1, line: 1 },
    end: { index: 3, column: 4, line: 1 },
    range: [0, 3] // getter
  } 
}
```

## Token objects

See the [Token documentation](https://github.com/here-be/snapdragon-token/blob/master/README.md#token-object) for more details about the `Token` object.

```js
interface Token {
  type: string;
  value: string;
  match: array | undefined;
  position: Position;
}
```

## Position objects

The `token.position` property contains source string position information on the token.

```js
interface Position {
  source: string | undefined;
  start: Location;
  end: Location;
  range: array (getter)
}
```

* `source` **{string|undefined}** - the source position provided by `lexer.options.source`. Typically this is a filename, but could also be `string` or any user defined value.
* `start` **{object}** - start [location object](#location-objects), which is the location of the _first character of_ the lexed source string.
* `end` **{object}** - end [location object](#location-objects), which is the location of the _last character of_ the lexed source string.
* `range` **{array}** - getter that returns an array with the following values: `[position.start.index, position.end.index]`

## Location objects

Each `Location` object consists of an `index` number (0-based), a `column` number (0-based), and a `line` number (1-based):

```js
interface Location {
  index: number; // >= 0
  column: number; // >= 0,
  line: number; // >= 1
}
```

* `line` **{string|undefined}** - the source position provided by `lexer.options.source`. Typically this is a filename, but could also be `string` or any user defined value.
* `column` **{object}** - start [location object](#location-objects), which is the location of the _first character of_ the lexed source string.
* `end` **{object}** - end [location object](#location-objects), which is the location of the _last character of_ the lexed source string.

## Example usage

```js
const Lexer = require('snapdragon-lexer');
const lexer = new Lexer('foo/*', { source: 'string' });
lexer.use(position());
lexer.capture('star', /^\*/);
lexer.capture('slash', /^\//);
lexer.capture('text', /^\w+/);

lexer.tokenize();
console.log(lexer.tokens);
```

Results in:

```js
[
  {
    type: 'text',
    val: 'foo',
    match: ['foo', index: 0, input: 'foo/*'],
    position: {
      source: 'string',
      start: { index: 0, column: 1, line: 1 },
      end: { index: 3, column: 4, line: 1 },
      range: [0, 3]
    }
  },
  {
    type: 'slash',
    val: '/',
    match: ['/', index: 0, input: '/*'],
    position: {
      source: 'string',
      start: { index: 3, column: 4, line: 1 },
      end: { index: 4, column: 5, line: 1 },
      range: [3, 4]
    }
  },
  {
    type: 'star',
    val: '*',
    match: ['*', index: 0, input: '*'],
    position: {
      source: 'string',
      start: { index: 4, column: 5, line: 1 },
      end: { index: 5, column: 6, line: 1 },
      range: [4, 5]
    }
  }
]
```

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>
<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Related projects

You might also be interested in these projects:

* [snapdragon-capture](https://www.npmjs.com/package/snapdragon-capture): Snapdragon plugin that adds a capture method to the parser instance. | [homepage](https://github.com/jonschlinkert/snapdragon-capture "Snapdragon plugin that adds a capture method to the parser instance.")
* [snapdragon-node](https://www.npmjs.com/package/snapdragon-node): Snapdragon utility for creating a new AST node in custom code, such as plugins. | [homepage](https://github.com/jonschlinkert/snapdragon-node "Snapdragon utility for creating a new AST node in custom code, such as plugins.")
* [snapdragon-util](https://www.npmjs.com/package/snapdragon-util): Utilities for the snapdragon parser/compiler. | [homepage](https://github.com/jonschlinkert/snapdragon-util "Utilities for the snapdragon parser/compiler.")

### Author

**Jon Schlinkert**

* [linkedin/in/jonschlinkert](https://linkedin.com/in/jonschlinkert)
* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2018, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on January 08, 2018._