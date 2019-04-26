FROM node:10.15.3-slim


WORKDIR /app
COPY . ./
RUN npm install
EXPOSE 4000

CMD ["npm", "start"]