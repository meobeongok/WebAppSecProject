# WebAppSecProject - Alunno

**WIP btw 🐧🐧🐧**

## What is Alunno?

Alunno is a web-based course management application for WebAppSec course which uses [Django](https://www.djangoproject.com) and [React](https://reactjs.org).

🚀 Fast

🎨 Beautiful interface

🛡️ Super Duper Secure

## Getting Started

### Prerequisites

- Python: `3.9.12`
- Nodejs: `16.15.0`

### Environment variables

- Use `.env.local` to store your secrets (`*.local` files is ignored). Ex: Django secret key, ...
- Use `.env` to store other variables.
- `.env*` files should place in `backend` or `frontend` folder.

### Code formatting

After [setup](#setup), you can format code with the following command:

- Backend:

  ```bash
  black { your file or folder } # Python only
  ```

  - Ex: If your current directory is `backend`, you can run:

    ```bash
    black .
    ```

- Frontend

  ```bash
  pnpm format
  ```

### Django secret key

After [setup](#setup), if you want to generate new Django secret key, you can run:

```bash
manage.py djecrety
```

### Setup

1. Get the source code

```bash
git clone https://github.com/ducluongtran9121/Web-Application-Project.git
cd Web-Application-Project
```

2. Set up

- Set up backend

  - Create environment

    ```bash
    cd backend
    python -m venv .venv # Or python3
    ```

  - Active environment

    ```bash
    .venv\Scripts\Activate.ps1 # Powershell
    .venv\Scripts\activate.bat # Command Prompt
    .venv\Scripts\activate # Unix
    ```

  - Install dependencies

    ```bash
    pip install -r .\requirements.txt
    ```

  - Add your secret key

    ```bash
    echo "DJANGO_SECRET_KEY={ Your secret key }" > .env.local
    ```

  - Migrate

    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

- Set up frontend

  - Install dependencies

    ```bash
    cd frontend
    pnpm i
    ```

### Run

- Backend

  ```bash
  python manage.py runserver
  ```

- Frontend

  - To run dev server

    ```bash
    pnpm dev
    ```

  - To build the app

    ```bash
    pnpm build
    ```

### Docker setup

- Environment variables setup

  - Backend `.env.local` template

    ```
    DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 [::1]
    DJANGO_SECRET_KEY=k=ke$8gp0x88=&$p9_r328jn@*j1y^rz+f81s5wv@a=)8(yuc@
    DJANGO_DEBUG=False

    # auto create a superuser if CREATE_ADMIN=True
    CREATE_ADMIN=True
    ADMIN_CODE=123456
    ADMIN_PASSWORD=123456
    ADMIN_USERNAME=admin
    ADMIN_EMAIL=admin@admin.com

    # uncomment to use postpreSQL
    #DATABASE=postgres
    #SQL_ENGINE=django.db.backends.postgresql
    #SQL_DATABASE=postgres
    #SQL_USER=postgres
    #SQL_PASSWORD=k&432postgres
    #SQL_HOST=postgresdb
    #SQL_PORT=5432
    ```

  - Frontend `.env.local` template

    ```
    # Frontend config enviroment
    VITE_BACKEND_URL=http://localhost/api
    VITE_MEDIA_URL=http://localhost
    # Nginx config enviroment
    ALLOWED_METHODS=GET HEAD POST OPTIONS DELETE
    ```

  - PostgreSQL `.env.local` template

    ```
    POSTGRES_NAME=postgres
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=k&432postgres
    ```

- Run

  In Web-Application-Project folder, run command:

  ```
  docker-compose up
  ```

## Tech Stack

- Backend

  - [Python](https://www.python.org)
  - [Django](https://www.djangoproject.com)
  - [Django REST](https://www.django-rest-framework.org)

- Frontend

  - [TypeScript](https://www.typescriptlang.org)
  - [React](https://reactjs.org)
  - [Mantine](https://mantine.dev)

- Deploy

  - [docker](https://www.docker.com/)
  - [nginx](https://www.nginx.com/)

- Love ❤️

## Teams

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<table>
  <tr>
    <td align="center"><a href="https://github.com/pinanek23"><img src="https://avatars.githubusercontent.com/u/57288958?v=4?s=100" width="150px;" alt=""/><br /><sub><b>Ngo Duc Hoang Son</b></sub></a><br /><a href="https://github.com/ducluongtran9121/Web-Application-Project/commits?author=pinanek23" title="Code">💻</a> <a href="https://github.com/ducluongtran9121/Web-Application-Project/commits?author=pinanek23" title="Documentation">📖</a> <a href="#design-pinanek23" title="Design">🎨</a> <a href="#maintenance-pinanek23" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/thihuynhdotexe"><img src="https://avatars.githubusercontent.com/u/71972700?v=4?s=100" width="150px;" alt=""/><br /><sub><b>thihuynhdotexe</b></sub></a><br /><a href="https://github.com/ducluongtran9121/Web-Application-Project/commits?author=thihuynhdotexe" title="Code">💻</a> <a href="#maintenance-thihuynhdotexe" title="Maintenance">🚧</a> <a href="#projectManagement-thihuynhdotexe" title="Project Management">📆</a></td>
    <td align="center"><a href="https://github.com/ducluongtran9121"><img src="https://avatars.githubusercontent.com/u/62114461?v=4?s=100" width="150px;" alt=""/><br /><sub><b>janlele91</b></sub></a><br /><a href="https://github.com/ducluongtran9121/Web-Application-Project/commits?author=ducluongtran9121" title="Code">💻</a> <a href="#maintenance-ducluongtran9121" title="Maintenance">🚧</a> <a href="#projectManagement-ducluongtran9121" title="Project Management">📆</a></td></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->
