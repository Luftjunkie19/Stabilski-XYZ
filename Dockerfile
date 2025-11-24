FROM node:25.2.1-alpine3.21

WORKDIR /repo

COPY package*.json package-lock.json ./

RUN npm ci

RUN npm install -g npm@11.6.3

COPY apps/frontend ./apps/frontend

COPY packages ./packages

WORKDIR /repo/apps/frontend

RUN rm -rf node_modules

RUN rm -rf .next

RUN rm -rf .turbo

RUN npm i --force

RUN npm i react-dom --force

RUN npm ci 

RUN npx next build

EXPOSE 3000

CMD ["npm", "start"]
