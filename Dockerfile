FROM node:latest
WORKDIR /repo


# copy root manifests
COPY package.json turbo.json ./

# copy workspace folders (must match your repo)
COPY apps ./apps
COPY packages ./packages

# install deps
RUN npm ci

RUN ["rm", "-rf", ".next"]

RUN ["rm", "-rf", ".cache"]

RUN ["rm", "-rf", "node_modules"]


# build only the frontend app
RUN npm install --force

WORKDIR /repo/apps/frontend

RUN ["rm", "-rf", ".next"]

RUN ["rm", "-rf", ".cache"]

RUN ["rm", "-rf", "node_modules"]

RUN npm i

RUN npm run build
# runtime: start frontend only
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]