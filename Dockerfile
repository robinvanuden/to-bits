FROM node:20-alpine

WORKDIR /app/

RUN npm install -g npm@latest

COPY app/package*.json .

RUN npm install

COPY app .

CMD ["npm", "run", "start"]