FROM node:20-slim

RUN npm install -git npm@latest

COPY . .

WORKDIR /app/

RUN npm install && npm fund

CMD ["npm", "run", "start"]