# @lindorm-io/mongo
This package contains Mongo Repository utilities for lindorm.io packages.

## Installation
```shell script
npm install --save @lindorm-io/mongo
```

## Usage

### Mongo Connection
```typescript
const mongo = new MongoConnection({
  user: "user",
  password: "password",
  host: "https://db/location/",
  port: 27000,
  name: "db-name",
});

await mongo.connect();
const db = mongo.db();

await mongo.disconnect();
```

### Repository
```typescript
class Repository extends BaseRepository implements IRepository {} 

const repository = new Repository({
  db,
  logger: winstonLogger,
  collectionName: "collection",
  indices: [
    { index: { id: 1 }, options: { unique: true } },
  ],
  schema: Joi.object(),
});
```
