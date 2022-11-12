FROM node:16-alpine

# Create app directory
RUN mkdir -p /usr/src/app

# Install global helper packages
RUN npm i -g node-prune typeorm

# Install app dependencies
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json

RUN cd /usr/src/app && npm install

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm run tsc

# Remove source as it is no longer needed
RUN rm -r src

COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000 3080

HEALTHCHECK --interval=60s --start-period=90s --timeout=10s CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]

