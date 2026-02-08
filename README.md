# Getting started 

## Start a Mongo Replica Set with only one node

> **IMPORTANT**: Use this only for develop purposes

Run:

```bash
docker-compose up
```

And add in your `/etc/hosts` file something like:

```
XXX.XXX.XXX.XXX   host.docker.internal
```

where first column is your local IP address.

Your connection string should be: `mongodb://localhost:27018/bibliopolis`.

## Read the docs environment

- Install `pipx`

```bash
sudo apt install pipx
pipx ensurepath
```


- Install mkdocs

```bash
pipx install mkdocs
pipx inject mkdocs mkdocs-material
```

- Start mkdocs
```bash
mkdocs new .
```

```bash
mkdocs serve
```