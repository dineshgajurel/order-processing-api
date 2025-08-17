# Description

Distributed Order Processing API

# Major Tools and Technologies

- TypeScript/javasctipt
  - language

- NesJS
  - framework

- PostgreSQL
  - Primary Databse

- TypeORM
  -Databse ORM

- JWT
  - authentication
  - Role based authorization

- bscrypt
  - password hasing

- NestJS throttler
  - rate limiting/throttling

- Redis
  - cache
  - queue

- BullMQ
  - queue management
  - async job handling
  - work with Redis
- NestJS gateway/socket.io
  - websocket
  - notification handling

- class-validator
  - validation

- and so on......

# Project setup (Before starting)

## Clone Repository

- SSH

```bash
git clone git@github.com:dineshgajurel/order-processing-api.git
```

- HTTPS (optional)

```bash
git clone https://github.com/dineshgajurel/order-processing-api.git
```

## Install dependancies

```bash
$ npm install
```

## environment setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

- you can update as per the need, but for now with default docker config, it will work fine (if not please verify)

- NOTE: This is just to make it easier `.env.example` contains the auth/password as per the docker-config, (only for local purpose)

## Docker setup and run in local

1.  There is Dockerfile and docker-config.yml to run `Nest app`, `Postgres database` and `Redis`

HINT:

```bash
docker compose up -d --build
```

service will run in 3000, 5432 and 6379 respectively (Default port)

you are freee to modify/update if needed

## Migration run (no need to manually run)

1.  There is migration script available in package.json

HINT

```bash
$ npm run migration:run
```

Note: Migration script will be triggered after `npm run build ` before serving the app in container. so no need to manually do it (migt be applicable if want to run alternatively)

# Compile and run the project (alternative)

HINT: if you face any issues and want to test it locally without docker config

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

# Run tests

1. There is test run script available in package.json

HINT

```bash
npm run test
```

Note: Test script will trigger after `npm run build ` before running the app. So, no need to manually do it (migt be applicable if want to run alternatively)

Note: For this time the test covarage is not full, just wanted to showcase (my ability 😊) the funcationalites of test case,
so there are two test suites available

1. `app.controller.spec.ts` (available default while setting up NestJS)
2. `user.service.spec.ts`

# Resources

## Swagger API docs

- Swagger docs UI can be accessed and tested on ,[ localhost:3000/api/docs](http://localhost:3000/api/docs)

## Sample API requests (to test)

- The `api-requests.http` file is available in the root

  [here](https://github.com/dineshgajurel/order-processing-api/blob/main/api-requests.http)

## Architechture Diagram

Basic archticture diagram to understand the overview of the implementation

[Architecture Diagram](https://lucid.app/lucidchart/f310969a-085d-4923-bb9d-54e29f00a254/edit?viewport_loc=-1045%2C-821%2C2705%2C1189%2C0_0&invitationId=inv_d7689ae2-19d5-4cd6-8d92-5cde0be52f6e)

## Web socket testing

- To test and verify web socket

  (web-socket-test.html) file in the root

  [here](https://github.com/dineshgajurel/order-processing-api/blob/main/web-socket-test.html)

# Further improvements (TODO)

- Comprehensive Architechture diagram supported by extra flow diagram
- Full/Most Test coverage (TDD)
- Further refactor to better handle structure/architecture
- Enhanced API documentation using Swagger/OpenAPI syntax including accurate request/response examples and error cases
- Logout full functionalities (just simulated the endpoints for now)
