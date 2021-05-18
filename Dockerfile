FROM node:15.12.0 as builder

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN npx yarn

COPY . ./

RUN npx yarn build

FROM node:15.12.0-alpine3.10

WORKDIR /app

COPY ./server/package.json ./
COPY ./server/yarn.lock ./

RUN npx yarn

COPY ./src/config.json ./../src/config.json
COPY ./server/ ./
COPY --from=builder ./app/build ./static

EXPOSE 3000

ENV FP_SERVER_PORT=3000 FP_SERVER_DIR="./static"

CMD ["node", "index.js"];
