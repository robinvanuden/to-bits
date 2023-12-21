FROM node:20-alpine

RUN npm install -g npm@latest

COPY app .

WORKDIR /app/

RUN npm install

CMD ["npm", "run", "start"]