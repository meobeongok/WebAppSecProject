FROM node:16.15.0-alpine as builder

WORKDIR /frontend

RUN apk add --no-cache curl \
    && curl -sL https://unpkg.com/@pnpm/self-installer | node

COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
RUN pnpm build

FROM owasp/modsecurity-crs:nginx-alpine
COPY --from=builder /frontend/dist /usr/share/nginx/html
RUN rm /etc/nginx/templates/conf.d/default.conf.template
COPY ./nginx/nginx.conf /etc/nginx/templates/conf.d
RUN mv /etc/nginx/templates/conf.d/nginx.conf /etc/nginx/templates/conf.d/default.conf.template
CMD ["nginx", "-g", "daemon off;"]