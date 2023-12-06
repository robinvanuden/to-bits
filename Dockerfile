FROM node:20-slim

COPY . .

WORKDIR /app/

RUN npm install && npm fund

CMD ["npm", "run", "start"]