#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

python manage.py collectstatic --noinput
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "from django.contrib.auth import get_user_model; \
User = get_user_model(); \
User.objects.create_superuser('${ADMIN_CODE}','${ADMIN_EMAIL}', '${ADMIN_USERNAME}', '${ADMIN_PASSWORD}')" | python manage.py shell

gunicorn backend.wsgi:application --bind 0.0.0.0:8000
