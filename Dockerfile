FROM node:18-alpine

COPY . .

WORKDIR /app/

RUN npm install && npm fund

CMD ["npm", "run", "start"]