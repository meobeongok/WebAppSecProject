FROM node:16.15.0-alpine as builder

WORKDIR /frontend

RUN apk add --no-cache curl \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
RUN pnpm build

FROM nginx:1.21-alpine
COPY --from=builder /frontend/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]