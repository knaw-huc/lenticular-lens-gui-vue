FROM node:lts-alpine as builder

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY entrypoint.sh /
RUN chmod +x entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
