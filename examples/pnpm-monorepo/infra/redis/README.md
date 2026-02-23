# Monorepo Redis

Redis is used for caching.

## Quickstart

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
