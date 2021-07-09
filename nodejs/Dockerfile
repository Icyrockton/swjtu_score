FROM node:alpine
WORKDIR /backend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3010
RUN npm run build
CMD ["node","./dist/index.js"]
