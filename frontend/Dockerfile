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

COPY ./nginx/templates/default.conf.template /etc/nginx/templates/conf.d/
COPY ./nginx/rules/RESPONSE-999-EXCLUSION-RULES-AFTER-CRS.conf /opt/owasp-crs/rules/

CMD ["nginx", "-g", "daemon off;"]