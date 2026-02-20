# Monorepo Redis

Redis is used for caching Monorepo API.

## How to use

Run `make [COMMANDS]` in your terminal to use commands.

To get the commands list, run:

```shell
make help
```

## Production

### Start

Create a `.env.production` based on `.env.example`.

Then start the MQTT service for production:

```shell
make prod-docker-up &
```

By default database is connected on port `6179`.

### Stop

Stops the MQTT service for production.

```shell
make prod-docker-down
```

## Development

### Start

Start the MQTT service for development:

```shell
make dev-docker-up &
```

It will automatically generate the `.env` file from `.env.example`

By default database is connected on port `6179`.

### Stop

Stops the MQTT service for development.

```shell
make dev-docker-down
```

## Potential Issues

### Memory Overcommit Warning

If you see a warning like the following:

```shell
WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition. Being disabled, it can can also cause failures without low memory condition, see https://github.com/jemalloc/jemalloc/issues/1328. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
```

Open up a terminal and open the `sysctl.conf` file in a text editor.

```shell
sudo nano /etc/sysctl.conf
```

Add this line to the end of the file:

```shell
vm.overcommit_memory = 1
```

Save and close the file, and load the new configuration with:

```
sudo sysctl -p
```

Now, restart your Redis container.
