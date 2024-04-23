FROM node:16-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
# docker build -t d4clt/canva-server:0.0.1.RELEASE .