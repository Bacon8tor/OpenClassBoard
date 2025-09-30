# Building the No-Poll Version

This guide explains how to build and deploy the `nopoll` version of OpenClassBoard, which excludes polling functionality and doesn't require Firebase.

## What's Different?

The `nopoll` version:
- ✅ Includes all widgets EXCEPT the Poll widget
- ✅ No Firebase dependency
- ✅ Smaller image size
- ✅ Simpler deployment (no environment variables needed)
- ❌ No interactive polling or voting features

## Building Locally

### Option 1: Using the Build Script (Recommended)

```bash
# Make the script executable (Linux/Mac)
chmod +x build-nopoll.sh

# Run the build script
./build-nopoll.sh
```

### Option 2: Manual Build

```bash
# Build the Docker image
docker build -f Dockerfile.nopoll -t bacon8t0r/openclassboard:nopoll .
```

## Testing Locally

```bash
# Run the container
docker run -p 5173:5173 bacon8t0r/openclassboard:nopoll

# Open in browser
http://localhost:5173
```

## Deploying to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push bacon8t0r/openclassboard:nopoll
```

## How It Works

The build process uses Vite environment variables to conditionally exclude poll functionality:

1. **Dockerfile.nopoll** sets `VITE_DISABLE_POLL=true`
2. **App.jsx** checks this flag and:
   - Skips importing `PollWidget` and `VotingPage`
   - Hides the poll button in the widget toolbar
   - Shows a "not available" message if someone tries to access `/vote/*` URLs
3. **Build optimization**: Vite tree-shakes unused Firebase code, reducing bundle size

## Source Files

- `Dockerfile.nopoll` - Docker build file for nopoll version
- `build-nopoll.sh` - Build script
- `src/App.jsx` - Conditional poll imports (lines 16-29)
- `src/components/BottomBar.jsx` - Conditional poll button (lines 9-16)

## Verification

After building, verify the nopoll version works correctly:

1. ✅ All widgets should appear EXCEPT "Add Poll"
2. ✅ No Firebase errors in browser console
3. ✅ Visiting `/vote/anything` shows "Polling Not Available" message
4. ✅ All other widgets function normally

## Updating Both Versions

When making updates to widgets or core functionality:

```bash
# Build and push full version
docker build -t bacon8t0r/openclassboard:latest .
docker push bacon8t0r/openclassboard:latest

# Build and push nopoll version
./build-nopoll.sh
docker push bacon8t0r/openclassboard:nopoll
```

## Notes

- The `nopoll` version still includes the Firebase packages in `node_modules` but they're tree-shaken during the build
- If you want to completely remove Firebase from dependencies, you'd need to modify `package.json` (not recommended as it complicates maintenance)
- Both versions share the same codebase - the only difference is the `VITE_DISABLE_POLL` environment variable at build time