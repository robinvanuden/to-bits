FROM node:20-alpine

RUN npm install -g npm@latest

COPY app .

WORKDIR /app/

RUN npm i -g npm

RUN npm i

CMD ["npm", "run", "start"]