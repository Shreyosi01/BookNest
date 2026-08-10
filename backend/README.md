# BookNest API

FastAPI backend for BookNest: JWT auth + SQLite, matching the frontend's `Book` type field-for-field.

## Setup (Windows / PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Open `.env` and replace `SECRET_KEY` with a long random string (e.g. run `python -c "import secrets; print(secrets.token_hex(32))"` and paste the result in).

## Run

```powershell
uvicorn app.main:app --reload
```

- API root: http://127.0.0.1:8000
- Interactive docs (Swagger UI): http://127.0.0.1:8000/docs
- A `booknest.db` SQLite file is created automatically on first run — nothing else to set up.

## Endpoints

| Method | Path           | Auth required | Description                    |
|--------|----------------|----------------|--------------------------------|
| POST   | /auth/signup   | no             | Create account, returns a token |
| POST   | /auth/login    | no             | Log in, returns a token        |
| GET    | /auth/me       | yes            | Current user's profile         |
| GET    | /books         | yes            | List the current user's books  |
| POST   | /books         | yes            | Create a book                  |
| GET    | /books/{id}    | yes            | Get one book                   |
| PUT    | /books/{id}    | yes            | Partially update a book        |
| DELETE | /books/{id}    | yes            | Delete a book                  |

All `/books` routes only ever see the logged-in user's own books — there's no way to read or edit someone else's data.

## Auth flow

1. `POST /auth/signup` with `{ name, email, password }` → returns `{ accessToken, tokenType }`.
2. Store that token (e.g. in memory or localStorage on the frontend).
3. Send it on every future request as a header: `Authorization: Bearer <token>`.
4. Tokens are valid for 7 days by default (`ACCESS_TOKEN_EXPIRE_MINUTES` in `.env`).

## JSON casing

Every request/response uses **camelCase** (`totalPages`, `currentPage`, `dateAdded`, etc.) to match the frontend's `Book` type exactly — no field-name translation needed on either side.