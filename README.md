# WeasyPrint PDF API

A Restful API for print PDF with WeasyPrint.

- [FastAPI](https://github.com/tiangolo/fastapi)
- [WeasyPrint](https://github.com/Kozea/WeasyPrint)

## 1. Build container image

```bash
make build
```

## 2. Attach container

It create a container and bind port `8000`.

```bash
make dev-console
```

## 3. Start server

```bash
uvicorn main:app --reload --host 0.0.0.0
```

## 4. Access Swagger UI

Open http://localhost:8000/docs in the browser.

## 5. Request Body

POST `/pdfs`

```json
{ "html": "<h1>Hello World</h1>" }
```

Response will be streaming download.
