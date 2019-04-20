# -- base layer --
FROM node:8.12.0-alpine AS base 
# set working directory
WORKDIR /app
# install tini to fix interrupts in node 
RUN apk update && apk add yarn libtool autoconf automake tini python g++ make && rm -rf /var/cache/apk/*
# set tini as entrypoint 
ENTRYPOINT ["/sbin/tini", "--"]
# check for package updates 
COPY package.json yarn.lock ./ 

# -- build layer --
FROM base AS build 
# install dependencies
# make non-root user 
RUN yarn && \
      addgroup -S appgroup && \
      adduser -S appuser -G appgroup
# copy source code
COPY . . 
# set non-root user 
USER appuser 

# -- release layer --
FROM build AS release 
# copy app
COPY --from=build /app .
# start app
CMD ["node", "index.js"]
