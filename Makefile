CONTAINER_IMAGE=weasyprint-pdf-api

build:
	docker build -t $(CONTAINER_IMAGE) .

dev-console:
	docker run -it --rm -p 8000:8000 -v $$(pwd)/app:/app $(CONTAINER_IMAGE) sh

server:
	docker run -it --rm -p 8000:8000 $(CONTAINER_IMAGE)

setup:
	uv venv
	. .venv/bin/activate && uv pip install -r requirements.txt

compile:
	. .venv/bin/activate && uv pip compile requirements.in > requirements.txt

sync:
	. .venv/bin/activate && uv sync
