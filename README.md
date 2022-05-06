# arena-ts

[![Build Status](https://travis-ci.org/e-e-e/arena-ts.svg?branch=master)](https://travis-ci.org/e-e-e/arena-ts)
[![Coverage Status](https://coveralls.io/repos/github/e-e-e/arena-ts/badge.svg?branch=master)](https://coveralls.io/github/e-e-e/arena-ts?branch=master)

A typescript client for [are.na](are.na). Compatible in node and browser environments.

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

##### Node JS

To use this library in Node you will need to inject your choice of Fetch API compatible libraries when instantiating the
client. A good choice is [node-fetch](https://www.npmjs.com/package/node-fetch). Fetch polyfills have been excluded from
this package to make it lighter for browsers where fetch is included natively.

For example:

```ts
import {ArenaClient} from 'arena-ts';
import fetch from 'node-fetch'

const client = new ArenaClient({fetch});

client.channels().then(console.log);
```

### API

Check out the complete [API Documentation](https://e-e-e.github.io/arena-ts/).

This is based on [Arena's Restful API](dev.are.na).

Note: some undocumented endpoints have been added:
- `client.me()` - gets authenticated users details
- `client.group('groupname').get()` - get group details
- `client.group('groupname').channels()` - group channels
