FROM python:3.9.6-alpine as builder

ENV PYTHONDONTWRITEBYTECODE 1

COPY requirements.txt ./
RUN apk add --update --no-cache --virtual .build-deps postgresql-dev gcc python3-dev musl-dev

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN find /usr/local \( -type d -a -name test -o -name tests \)  -o \( -type f -a -name '*.pyc' -o -name '*.pyo' \) -exec rm -rf '{}' +

FROM python:3.9.6-alpine
COPY --from=builder /usr/local/lib/python3.9/site-packages/ /usr/local/lib/python3.9/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

WORKDIR /backend

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

COPY . .

CMD ["./entrypoint.sh"]