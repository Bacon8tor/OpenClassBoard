#!/bin/sh
set -e

# Inject runtime environment variables into /app/dist/config.js
# This allows Firebase credentials to be passed at container start
# rather than being baked into the image at build time.
cat > /app/dist/config.js << EOF
window.__ENV__ = {
  "VITE_FIREBASE_API_KEY":            "${VITE_FIREBASE_API_KEY:-}",
  "VITE_FIREBASE_AUTH_DOMAIN":        "${VITE_FIREBASE_AUTH_DOMAIN:-}",
  "VITE_FIREBASE_DATABASE_URL":       "${VITE_FIREBASE_DATABASE_URL:-}",
  "VITE_FIREBASE_PROJECT_ID":         "${VITE_FIREBASE_PROJECT_ID:-}",
  "VITE_FIREBASE_STORAGE_BUCKET":     "${VITE_FIREBASE_STORAGE_BUCKET:-}",
  "VITE_FIREBASE_MESSAGING_SENDER_ID":"${VITE_FIREBASE_MESSAGING_SENDER_ID:-}",
  "VITE_FIREBASE_APP_ID":             "${VITE_FIREBASE_APP_ID:-}",
  "VITE_FIREBASE_MEASUREMENT_ID":     "${VITE_FIREBASE_MEASUREMENT_ID:-}"
};
EOF

exec serve -s /app/dist -l 3000
