FROM node:22.18.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# RUN npm run test

EXPOSE 3000

CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]
