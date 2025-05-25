FROM node:22

WORKDIR /app/

RUN npm install -g npm@latest

COPY app/package*.json .

RUN npm install

COPY app .

RUN npm run test

RUN npm run build

CMD ["npm", "run", "start"]