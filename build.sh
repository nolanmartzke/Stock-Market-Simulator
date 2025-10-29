#!/usr/bin/env bash

# Minimal build script for TRD Wars
# Stops containers, builds images, and starts them again

set -e

echo "Stopping containers..."
docker compose down

echo "Building images..."
docker compose build

echo "Starting containers (detached)..."
docker compose up -d

echo "\nDone. Access containers at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080"
echo "  MySQL:    localhost:3306"

echo "\nIf you get a permission error running this script, run:"
echo "  chmod +x build.sh"

exit 0
