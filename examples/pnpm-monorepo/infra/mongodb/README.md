# MongoDB

MongoDB to store application data and logs.

## Development

### Config

Copy the config:

```bash
cp .env.example .env
```

### Start

Start MongoDB for development:

```bash
docker compose up
```

Start in detached mode:

```bash
docker compose up -d
```

By default MongoDB is connected on port `27017`

Connection string: `mongodb://root:example@localhost:27017`

| access   | defaults value |
|----------|----------------|
| username | root           |
| password | example        |

### Stop

Stop MongoDB for development:

```bash
docker compose down
```

### Test

With the default `.env` values, execute:

```bash
docker exec -it monorepo-mongodb mongosh \
  --host localhost \
  --port 27017 \
  -u root \
  -p example \
  --authenticationDatabase admin \
  --eval "db.adminCommand({listDatabases: 1})"
```