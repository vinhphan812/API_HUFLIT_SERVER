FROM node:12-alpine
WORKDIR /API_HUFLIT_SERVER
COPY . .
RUN npm install --save
CMD ["node", "index.js"]
