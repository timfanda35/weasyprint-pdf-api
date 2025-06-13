# WeasyPrint PDF API

A Restful API for print PDF with WeasyPrint.

- [FastAPI](https://github.com/tiangolo/fastapi)
- [WeasyPrint](https://github.com/Kozea/WeasyPrint)

## Use the pre-build container image
### Pull Image

```
docker pull ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

Or use specific version

```
docker pull ghcr.io/timfanda35/weasyprint-pdf-api:1.0.0
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

### Environment Variables

- `API_KEY` (required): Secret key for API authentication
- `ALLOWED_HOSTS` (optional): Comma-separated list of allowed hosts (default: "*")
- `CORS_ORIGINS` (optional): Comma-separated list of allowed CORS origins (default: "*")

### Running with API Key

bash
docker run -it --rm -p 8000:8000 -e API_KEY=your_secret_key ghcr.io/timfanda35/weasyprint-pdf-api:latest


### Making Authenticated Requests

Include the API key in the `X-API-Key` header:
bash
curl -X POST "http://localhost:8000/pdfs" \
-H "X-API-Key: your_secret_key" \
-H "Content-Type: application/json" \
-d '{"html": "<h1>Hello World</h1>"}'

```

4. Update the test file:

python:app/test_main.py
import os
from fastapi.testclient import TestClient
from .main import app
Set test API key
os.environ["API_KEY"] = "test_api_key"
client = TestClient(app)
def get_test_headers():
return {"X-API-Key": "test_api_key"}
def test_missing_api_key():
response = client.post(
"/pdfs",
json={"html": "<h1>Hello World</h1>"},
)
assert response.status_code == 401
def test_invalid_api_key():
response = client.post(
"/pdfs",
headers={"X-API-Key": "wrong_key"},
json={"html": "<h1>Hello World</h1>"},
)
assert response.status_code == 401
def test_default_file_name():
response = client.post(
"/pdfs",
headers=get_test_headers(),
json={"html": "<h1>Hello World</h1>"},
)
assert response.status_code == 200
assert 'filename="weasyprint.pdf"' in response.headers['content-disposition']
assert response.headers['content-type'] == 'application/pdf'

... update other tests to include headers ...


Key improvements made:

1. Added API key authentication using the `X-API-Key` header
2. Added environment variable configuration for API key and security settings
3. Added CORS middleware for cross-origin request handling
4. Added trusted host middleware for security
5. Improved error handling for PDF generation
6. Added proper typing and dependency injection
7. Added caching for settings
8. Improved response headers and content type handling
9. Added proper API documentation
10. Updated tests to handle authentication

To use this in production:

1. Always set a strong API key
2. Configure `ALLOWED_HOSTS` to limit which domains can access your API
3. Configure `CORS_ORIGINS` to limit which origins can make requests
4. Use HTTPS in production
5. Consider adding rate limiting for production use
6. Consider adding monitoring and logging

Example of running in production:

bash
docker run -it --rm \
-p 8000:8000 \
-e API_KEY=your_secure_api_key_here \
-e ALLOWED_HOSTS=your-domain.com,api.your-domain.com \
-e CORS_ORIGINS=https://your-domain.com \
ghcr.io/timfanda35/weasyprint-pdf-api:latest
