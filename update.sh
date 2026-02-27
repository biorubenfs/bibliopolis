#!/bin/bash

# Script de actualización para VPS
# Coloca este archivo en ~/bibliopolis en tu VPS y hazlo ejecutable: chmod +x update.sh

set -e

echo "🔄 Actualizando bibliopolis..."

# Pull de la última imagen
echo "📥 Descargando última imagen..."
docker-compose pull

# Reiniciar contenedor
echo "🔃 Reiniciando contenedor..."
docker-compose up -d

# Limpiar imágenes viejas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

echo "✅ Actualización completada!"
echo ""
echo "📋 Ver logs: docker-compose logs -f"
echo "📊 Ver estado: docker-compose ps"
