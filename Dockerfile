FROM node:10
WORKDIR /app
COPY . ./
RUN yarn
EXPOSE 9000
CMD ["node", "index.js", "start"]
