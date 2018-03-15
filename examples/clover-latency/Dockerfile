FROM node:9.8.0

COPY package.json /
COPY webpack.config.js /

RUN npm install

COPY . /

WORKDIR /

EXPOSE 8080

CMD ["npm", "start"]
