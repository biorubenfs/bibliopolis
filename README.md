# Getting started 

## Start a Mongo Replica Set with only one node

> **IMPORTANT**: Use this only for develop purposes

Create a `docker-compose.yml` with:

```yml
services:
  mongo1:
    image: mongo:7.0
    container_name: "mongo-single-rs"
    command: ["--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    ports:
      - 27018:27017
    extra_hosts:
      - "host.docker.internal:host-gateway"
    healthcheck:
      test: echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'host.docker.internal:27018'}]}) }" | mongosh --port 27017 --quiet
      interval: 5s
      timeout: 30s
      start_period: 0s
      retries: 30
    volumes:
      - "mongo1_data:/data/db"
      - "mongo1_config:/data/configdb"

volumes:
  mongo1_data:
  mongo1_config:
```

And add in your `/etc/hosts` file something like:

```
XXX.XXX.XXX.XXX   host.docker.internal
```

where X are your local IP.

Your connection string should be: `mongodb://localhost:27018/bibliopolis".
