# arena-ts
[![Build Status](https://travis-ci.org/e-e-e/arena-ts.svg?branch=master)](https://travis-ci.org/e-e-e/arena-ts)
[![Coverage Status](https://coveralls.io/repos/github/e-e-e/arena-ts/badge.svg?branch=master)](https://coveralls.io/github/e-e-e/arena-ts?branch=master)

A typescript client for [are.na](are.na).

This is a work in progress and a partial implementation.

### Installation

```bash
// using npm
npm install arena-ts
// using yarn
yarn add arena-ts

```

### Example
```ts
import { ArenaClient } from 'arena-ts';

const client = new ArenaClient();

client.channels().then(console.log);
```

### API

[Arena Client API Documentation](https://e-e-e.github.io/arena-ts/)

This is based on [Arena's Restful API](dev.are.na).
