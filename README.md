# WeasyPrint PDF API

A Restful API for print PDF with WeasyPrint.

- [FastAPI](https://github.com/tiangolo/fastapi)
- [WeasyPrint](https://github.com/Kozea/WeasyPrint)

## Use the pre-build container image
### Pull Image

```
docker pull ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

### Run Container

Run with default port `8000`

```
docker run -it --rm -p 8000:8000 ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

Run with specific port, like `8080`

```
docker run -it --rm -p 8080:8080 -e PORT=8080 ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

### Access Swagger UI

Open http://localhost:8000/docs in the browser.

### Send Request

POST `/pdfs`, for example:

```json
{ "html": "<h1>Hello World</h1>" }
```

Response will be streaming download.

You can also specific filename:

```json
{ "filename": "shipping-label", "html": "<h1>Hello World</h1>" }
```

## Development

### 1. Build container image

```bash
make build
```

### 2. Attach container

It create a container and bind port `8000`.

```bash
make dev-console
```

### 3. Start server

```bash
uvicorn main:app --reload --host 0.0.0.0
```

## Test

Install `httpx` and `pytest`

```
pip install httpx pytest
```

Run test cases

```
pytest
```