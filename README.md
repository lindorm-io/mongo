# @lindorm-io/mongo
Mongo and Repository tools for lindorm.io packages.

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
class Repository extends RepositoryBase implements IRepository {
  protected createEntity(data: any): Entity {
    return new Entity(data);
  }

  protected getEntityJSON(entity: Entity): any {
    return {
      id: entity.id,
      created: entity.created,
      updated: entity.updated,
      version: entity.version,
    };
  }
} 

const repository = new Repository({
  db,
  logger: winstonLogger,
  collectionName: "collection",
  indices: [
    { index: { id: 1 }, options: { unique: true } },
  ],
  schema: Joi.object(),
});

await repository.create(entity);
await repository.update(entity);
const entity = await repository.find({ filter });
await [e1,e2] = await repository.findMany({ filter });
await repository.remove(entity);
await repository.removeMany({ filter });
```
