# Performance report — issue #36 (concurrency)

## Summary
- **Problem:** `print_pdf` was `async def` and called the CPU-bound `HTML(...).write_pdf()` directly, blocking the event loop. While one PDF rendered, every other request (even a trivial `GET /openapi.json`) had to wait.
- **Fix:** `async def print_pdf` → `def print_pdf` (`app/main.py`). FastAPI now runs renders in its threadpool. `WEB_CONCURRENCY` (uvicorn workers) can spread renders over several cores.
- **Proven:** the event loop is no longer blocked. A cheap request's p95 latency dropped from **2,586 ms to 79 ms** (1 worker), and to **22 ms** with 4 workers. This held in two independent benchmark runs (see Earlier run).
- **Partly proven:** 2 workers completed ~1.4x the renders of 1 worker. 4 workers gave no further gain in this environment, so linear scaling is **not** shown (see Caveats).
- **Small effect:** with one worker, completed renders went 52 → 60 (+15%). Threads share the GIL, so one worker is still about one core of render work. The main win is responsiveness, not single-worker throughput.

## Method
- Image built from the repo `Dockerfile` with the pinned `requirements.txt`: weasyprint 70.0, fastapi 0.142.2, uvicorn 0.54.0. `pytest`: 4 passed on this image.
- Load tool: `k6.js` (this repo), `PAYLOAD=heavy` (200-row table), `STAGE_SECONDS=15`, ramp 1→2→4→8→16 VUs.
- Two concurrent scenarios: `ramp` (POST `/pdfs`) and `liveness` (GET `/openapi.json` every 200 ms). The liveness probe does no CPU work, so its latency only rises if the event loop is blocked.
- Each config ran in a fresh container: `docker run --cpus=4 -e WEB_CONCURRENCY=N`, with the app directory mounted over `/app`.
- Baseline = the same code with `async def` restored.
- Run: `k6 run -e BASE_URL=http://localhost:8001 -e PAYLOAD=heavy -e STAGE_SECONDS=15 k6.js`

## Results (pinned versions)
Renders completed = k6 `checks` minus `iterations` (the `body is a PDF` check only runs for renders). Liveness = `GET /openapi.json`.

| Config | Renders completed | Failed requests | Liveness p95 | Liveness max | Render p50 / p95 |
|---|---|---|---|---|---|
| A. baseline `async def`, 1 worker | 52 | 0% | 2,586 ms | 3,145 ms | 3.3 s / 19.9 s |
| B. `def`, 1 worker | 60 | 0% | 79 ms | 288 ms | 4.2 s / 22.9 s |
| C. `def`, 2 workers | 85 | 0% | 48 ms | 243 ms | 3.3 s / 16.9 s |
| D. `def`, 4 workers | 86 | 0% | 22 ms | 124 ms | 2.6 s / 13.5 s |

Render latency at the higher stages is dominated by queueing: 16 VUs against a multi-second render saturates the service. The 5 s ramp p95 threshold in `k6.js` is therefore exceeded in every config; the liveness and failure-rate thresholds pass in B–D and the liveness threshold fails in A.

## What the data shows
1. **Blocking removed (strong evidence).** Liveness p95 fell ~33x (2,586 → 79 ms) from the one-word change alone, and further with more workers.
2. **Workers help up to a point.** 60 → 85 renders going from 1 to 2 workers (1.4x); 86 with 4 workers.
3. **Concurrency test.** `test_concurrent_requests` (8 simultaneous requests) passes.

## Earlier run (older image, noisier host)
A first run used a local image with weasyprint 69.0 / fastapi 0.141.1 / uvicorn 0.52.1 while the host was heavily loaded (load average ~16 on 8 cores). It showed the same pattern: liveness p95 11,957 ms → 106 ms (1 worker) → 22 ms (4 workers), the baseline timing out 6.1% of requests, and completed renders 15 → 23 → 41 → 45 for baseline / 1 / 2 / 4 workers. In that run a pure CPU spin test in the container showed 4 processes taking 2.7x as long as 1, i.e. the host could not run work in parallel, so it is not evidence about the code.

## Caveats (read before quoting numbers)
- **Scaling beyond 2 workers is unexplained.** The host was still busy during the pinned run (load average ~5–7 on 8 cores), k6 ran on the same machine as the containers, and traffic went through Docker Desktop port forwarding. Any of these could cap throughput, but I did not isolate the cause. Rerun on an idle machine or a dedicated CI runner before quoting scaling numbers.
- **Single short run per config** (15 s stages, at most ~86 renders). Treat render counts as indicative, not precise. The liveness comparison is large enough to be robust.
- Raw k6 `http_reqs` / "req/s" counts liveness probes too (the majority of requests) and must not be read as render throughput.

## Recommendation
- Keep `def print_pdf` (done).
- Set `WEB_CONCURRENCY` to a small number (2 gave most of the measured gain here); tune on your own hardware, since gains depend on available cores.
- Add a request timeout / concurrency cap upstream if heavy documents are expected; at saturation, queueing drives latency.
