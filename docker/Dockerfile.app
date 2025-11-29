# docker/Dockerfile.app
# 1) build stage — use Node 16 LTS which is compatible with older react-scripts/postcss
FROM node:16-bullseye AS build
WORKDIR /src/app

# Ensure we don't accidentally copy host node_modules; dockerignore should already exclude it.
# Set npm registry to npmjs (reduces chance of yarn registry 502 proxy issues)
RUN npm config set registry https://registry.npmjs.org/

# copy package files first to leverage build cache
COPY src/app/package.json src/app/yarn.lock ./

# reduce concurrency to avoid transient registry throttling in CI/docker
ENV YARN_FLAGS="--frozen-lockfile --network-concurrency 1"

RUN yarn install $YARN_FLAGS

# copy source and run build
COPY src/app ./
# ENV CI=true
RUN yarn build

# 2) production nginx stage
FROM nginx:stable-alpine
# copy custom nginx conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# copy built static files
COPY --from=build /src/app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
