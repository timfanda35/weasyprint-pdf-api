CONTAINER_IMAGE=weasyprint-pdf-api

build:
	docker build -t $(CONTAINER_IMAGE) .

dev-console:
	docker run -it --rm -p 8000:8000 -v $$(pwd):/app $(CONTAINER_IMAGE) sh

server:
	docker run -it --rm -p 8000:8000 $(CONTAINER_IMAGE)
