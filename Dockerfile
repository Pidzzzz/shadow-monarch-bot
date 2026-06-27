FROM node:20-alpine

RUN apk add --no-cache chromium ffmpeg

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

CMD ["node", "src/index.js"]
