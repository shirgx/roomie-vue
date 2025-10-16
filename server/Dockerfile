FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

RUN mkdir -p uploads

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
