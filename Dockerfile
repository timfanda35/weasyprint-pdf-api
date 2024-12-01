# https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#alpine-3-12

FROM alpine:3.18

EXPOSE 8000
ENV PORT=8000

WORKDIR /app

RUN apk add --no-cache \
  py3-pip py3-pillow py3-cffi py3-brotli gcc musl-dev python3-dev pango \
  ttf-dejavu ttf-droid ttf-freefont ttf-liberation font-noto font-noto-cjk

COPY ./requirements.txt /app/requirements.txt

RUN pip3 install -r requirements.txt

COPY ./app/main.py /app/

# Add environment variable for API key
ENV API_KEY=""
ENV ALLOWED_HOSTS="*"
ENV CORS_ORIGINS="*"

CMD ["sh", "-c", "uvicorn main:app --host=0.0.0.0 --port=$PORT"]
