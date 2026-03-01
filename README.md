# WeasyPrint PDF API

A Restful API for print PDF with WeasyPrint.

- [FastAPI](https://github.com/tiangolo/fastapi)
- [WeasyPrint](https://github.com/Kozea/WeasyPrint)

## Use the pre-build container image
### Pull Image

Get the latest version (main branch)

```bash
docker pull ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

Or use specific version (recommended)

```bash
docker pull ghcr.io/timfanda35/weasyprint-pdf-api:1.1.3
```

### Run Container

Run with default port `8000`

```bash
docker run -it --rm -p 8000:8000 ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

Run with specific port, like `8080`

```bash
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

Use thg dev container with VS Code

https://vscode.com.tw/docs/devcontainers/containers

## Test

Install `httpx` and `pytest`

```bash
pip install httpx pytest
```

Run test cases

```bash
pytest
```
