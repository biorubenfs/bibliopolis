# Deployment en VPS - Guía Rápida

## 📋 Archivos necesarios en el VPS

En este repositorio encontrarás estos archivos para el VPS:

- `docker-compose.vps.yml` → Renombrar a `docker-compose.yml`
- `.env.vps.example` → Copiar a `.env` y configurar
- `update.sh` → Script para actualizar fácilmente

---

## 🚀 Setup Inicial (una sola vez)

### 1. Preparar el VPS

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cerrar sesión y volver a conectar
exit
ssh tu-usuario@tu-vps
```

### 2. Crear directorio y archivos

```bash
mkdir ~/bibliopolis
cd ~/bibliopolis
```

Copia los archivos del repositorio al VPS:
- `docker-compose.vps.yml` → `docker-compose.yml`
- `.env.vps.example` → `.env`
- `update.sh`

O créalos manualmente copiando el contenido.

### 3. Configurar docker-compose.yml

Edita `docker-compose.yml` y cambia `USUARIO` por tu usuario de GitHub:

```yaml
image: ghcr.io/TU_USUARIO_GITHUB/bibliopolis:latest
```

### 4. Configurar variables de entorno

```bash
nano .env
```

Configura **OBLIGATORIAMENTE**:
- `MONGO_URI` → Tu connection string de MongoDB Atlas
- `JWT_SECRET` → Genera uno seguro con `openssl rand -base64 32`
- `CORS_ORIGIN` → Dominio de tu frontend
- `DEFAULT_ADMIN_*` → Credenciales del admin inicial

### 5. (Solo si el package es privado) Login en GHCR

Si el package de GitHub es público, **salta este paso**.

```bash
# Crea un Personal Access Token en GitHub con "read:packages"
echo "TU_GITHUB_TOKEN" | docker login ghcr.io -u TU_USUARIO --password-stdin
```

### 6. Iniciar la aplicación

```bash
docker-compose up -d
```

### 7. Verificar

```bash
# Ver logs
docker-compose logs -f

# Probar
curl http://localhost:3000/
```

---

## 🔄 Actualizar a nueva versión

```bash
cd ~/bibliopolis
./update.sh
```

O manualmente:

```bash
docker-compose pull
docker-compose up -d
docker image prune -f
```

---

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver estado
docker-compose ps

# Reiniciar
docker-compose restart

# Parar
docker-compose down

# Entrar al contenedor
docker-compose exec app sh

# Ver recursos
docker stats bibliopolis
```

---

## 🌐 Reverse Proxy (Nginx/Caddy)

Para servir en tu dominio con HTTPS, añade un reverse proxy.

**Ejemplo con Caddy** (automático SSL):

```bash
# Instalar Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configurar
sudo nano /etc/caddy/Caddyfile
```

Contenido del Caddyfile:

```
tudominio.com {
    reverse_proxy localhost:3000
}
```

```bash
# Recargar Caddy
sudo systemctl reload caddy
```

---

## 🔍 Troubleshooting

**Contenedor no inicia:**
```bash
docker-compose logs app
```

**No puede conectar a MongoDB:**
- Verifica el `MONGO_URI` en `.env`
- Asegúrate que la IP del VPS está en la whitelist de MongoDB Atlas

**No puede hacer pull de la imagen:**
- Verifica que el package sea público o que hayas hecho login en GHCR
- Verifica que el nombre de usuario en `docker-compose.yml` sea correcto

**Puerto 3000 en uso:**
- Cambia el puerto en `docker-compose.yml`: `"OTRO_PUERTO:3000"`
