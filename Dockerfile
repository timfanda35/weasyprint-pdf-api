# https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#alpine-3-12

FROM alpine:3.18

EXPOSE 8000
ENV PORT=8000
ENV ALLOWED_HOSTS="*"
ENV CORS_ORIGINS="*"

WORKDIR /app

RUN apk add --no-cache \
  py3-pip py3-pillow py3-cffi py3-brotli gcc musl-dev python3-dev pango \
  ttf-dejavu ttf-droid ttf-freefont ttf-liberation font-noto font-noto-cjk

COPY ./requirements.txt /app/requirements.txt

RUN python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

COPY ./app/main.py /app/

CMD ["sh", "-c", "source .venv/bin/activate && uvicorn main:app --host=0.0.0.0 --port=$PORT"]
