FROM node:lts-alpine3.22

# Arguments
ARG APP_HOME=/home/node/app
ARG VCE_VERSION=unknown
ARG VCE_COMMIT_ID=unknown

# OCI Labels
LABEL org.opencontainers.image.title="SillyTavern VCE" \
  org.opencontainers.image.description="A standardized version of SillyTavern for the VoidCat RDC ecosystem." \
  org.opencontainers.image.vendor="VoidCat RDC" \
  org.opencontainers.image.maintainer="VoidCat RDC" \
  org.opencontainers.image.version="${VCE_VERSION}" \
  org.opencontainers.image.revision="${VCE_COMMIT_ID}" \
  org.opencontainers.image.licenses="AGPL-3.0" \
  org.opencontainers.image.url="https://github.com/SillyTavern/SillyTavern" \
  voidcat.rdc.identity="The Void Vessel"

# Install system dependencies
RUN apk add --no-cache gcompat tini git git-lfs curl

# Create app directory
WORKDIR ${APP_HOME}

# Set NODE_ENV to production
ENV NODE_ENV=production

# Bundle app source
COPY . ./

RUN \
  echo "*** Install npm packages ***" && \
  npm ci --no-audit --no-fund --loglevel=error --no-progress --omit=dev && npm cache clean --force

# Create config directory and link config.yaml
RUN \
  rm -f "config.yaml" || true && \
  ln -s "./config/config.yaml" "config.yaml" || true && \
  mkdir "config" || true

# Pre-compile public libraries
RUN \
  echo "*** Run Webpack ***" && \
  node "./docker/build-lib.js"

# Set the entrypoint script
RUN \
  echo "*** Cleanup ***" && \
  mv "./docker/docker-entrypoint.sh" "./" && \
  rm -rf "./docker" && \
  echo "*** Make docker-entrypoint.sh executable ***" && \
  chmod +x "./docker-entrypoint.sh" && \
  echo "*** Convert line endings to Unix format ***" && \
  dos2unix "./docker-entrypoint.sh"

# Fix extension repos permissions
RUN git config --global --add safe.directory "*"

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/public/index.html || exit 1

# Ensure proper handling of kernel signals
ENTRYPOINT ["tini", "--", "./docker-entrypoint.sh"]
