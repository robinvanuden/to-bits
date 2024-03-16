FROM node:20-alpine

WORKDIR /app/

COPY app .

RUN npm i -g npm@latest

RUN npm i

CMD ["npm", "run", "start"]