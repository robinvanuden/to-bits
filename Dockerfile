FROM node:20-slim

RUN npm install -g npm@latest

COPY . .

WORKDIR /app/

RUN npm install && npm audit fix

CMD ["npm", "run", "start"]