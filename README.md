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
docker pull ghcr.io/timfanda35/weasyprint-pdf-api:1.2.0
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

## Performance

WeasyPrint is CPU-bound. The endpoint is a plain `def`, so FastAPI renders each PDF in its threadpool and the event loop stays free. Threads still share the GIL, so to use more than one core run several uvicorn workers with `WEB_CONCURRENCY` (start small, e.g. 2, and tune on your hardware):

```bash
docker run -it --rm -p 8000:8000 -e WEB_CONCURRENCY=4 ghcr.io/timfanda35/weasyprint-pdf-api:latest
```

Load test with [k6](https://k6.io/). It ramps up concurrent renders and probes `/openapi.json` to detect a blocked event loop:

```bash
k6 run -e BASE_URL=http://localhost:8000 -e PAYLOAD=heavy -e MAX_VUS=16 k6.js
```

`PAYLOAD` is `small` (default) or `heavy` (200-row table). Set `STAGE_SECONDS` (default `30`) to change the length of each ramp stage.

### Benchmark results

Measured with the pinned dependency versions, the `heavy` payload, `docker run --cpus=4`, `STAGE_SECONDS=15`, ramping 1 to 16 VUs. The liveness probe is a cheap `GET /openapi.json` that only slows down when the event loop is blocked.

| Config | Renders completed | Failed requests | Liveness p95 |
|---|---|---|---|
| `async def`, 1 worker (before) | 52 | 0% | 2,586 ms |
| `def`, 1 worker | 60 | 0% | 79 ms |
| `def`, 2 workers | 85 | 0% | 48 ms |
| `def`, 4 workers | 86 | 0% | 22 ms |

- Making the endpoint a plain `def` stops renders from blocking the event loop (liveness p95 dropped about 33x). An earlier run on an older image and a busier host showed the same pattern.
- Two workers completed about 1.4x the renders of one. Four workers added nothing more in this environment, so linear scaling is not proven (the host was busy and k6 ran on the same machine). Each config ran once, so treat the numbers as indicative.

See [PERFORMANCE_REPORT.md](PERFORMANCE_REPORT.md) for the method, caveats and raw findings.

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
