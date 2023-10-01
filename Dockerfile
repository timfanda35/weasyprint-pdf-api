FROM python:3.11-alpine as base

# Build Stage
FROM base as builder

RUN apk add --no-cache \
  gcc libffi-dev musl-dev \
  python3-dev py3-cffi

RUN mkdir /install
WORKDIR /install

COPY requirements.txt /requirements.txt
RUN pip install --prefix=/install -r /requirements.txt

# Application
FROM base

EXPOSE 8000
ENV PORT=8000

WORKDIR /app

RUN apk add --no-cache \
  pango \
  font-noto-cjk

COPY --from=builder /install /usr/local
COPY ./app/main.py /app/

CMD ["sh", "-c", "uvicorn main:app --host=0.0.0.0 --port=$PORT"]
