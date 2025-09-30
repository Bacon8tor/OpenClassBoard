#!/bin/bash

# Build script for OpenClassBoard nopoll version
# This builds a Docker image without polling functionality

echo "🚀 Building OpenClassBoard (nopoll version)..."

# Build the Docker image
docker build -f Dockerfile.nopoll -t bacon8t0r/openclassboard:nopoll .

echo "✅ Build complete!"
echo ""
echo "To push to Docker Hub, run:"
echo "  docker push bacon8t0r/openclassboard:nopoll"
echo ""
echo "To run locally:"
echo "  docker run -p 5173:5173 bacon8t0r/openclassboard:nopoll"