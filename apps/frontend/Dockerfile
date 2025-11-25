FROM node:22-alpine3.22 AS build

WORKDIR /repo

COPY . .

RUN npm install --force

RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]