FROM node:8.12.0-alpine
WORKDIR /srv/app/

# Necessary for deps
RUN apk add --no-cache \
      git \
      g++ \
      python \
      make

# Copy package.json/package-lock.json first minimizes invalidating the cache
COPY package*.json /srv/app/

# Use tini to fix interrupts in node
# Make non-root user
RUN npm i && apk add --no-cache tini

# Copy whole directory to container
COPY . /srv/app/

# Build and prune dev deps
RUN npm prune --production

# Run as root
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]
