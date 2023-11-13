# arena-ts

[![Build Status](https://travis-ci.org/e-e-e/arena-ts.svg?branch=master)](https://travis-ci.org/e-e-e/arena-ts)
[![Coverage Status](https://coveralls.io/repos/github/e-e-e/arena-ts/badge.svg?branch=master)](https://coveralls.io/github/e-e-e/arena-ts?branch=master)

A typescript client for [are.na](are.na). Compatible in node and browser environments.

Minimum node version 18.

Prior art: [arena-js](https://github.com/ivangreene/arena-js).

**Note:** This is an unofficial client and typing information has been derived by comparing the official documentation
with response types from use. These may change over time or depending on context, if you notice any discrepancies please
let us know. Contributions are welcome.

### Installation

```bash
// using npm
npm install arena-ts
// using yarn
yarn add arena-ts

```

### Usage

##### Simple Example:

```ts
import {ArenaClient} from 'arena-ts';

const client = new ArenaClient();

client.channels().then(console.log);
```

### API

Check out the complete [API Documentation](https://e-e-e.github.io/arena-ts/).

This is based on [Arena's Restful API](dev.are.na).

Note: some undocumented endpoints have been added:

- `client.me()` - gets authenticated users details
- `client.group('groupname').get()` - get group details
- `client.group('groupname').channels()` - group channels
- `client.block(123).comments()` - fetch block comments
- `client.block(123).addComment('comment')` - add new comment to block
- `client.block(123).deleteComment(123)` - delete comment by id
- `client.block(123).updateComment(123, 'new comment')` - update comment by id
