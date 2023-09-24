from fastapi.testclient import TestClient

from .main import app

client = TestClient(app)

def test_default_file_name():
    response = client.post(
        "/pdfs",
        json={"html": "<h1>Hello World</h1>"},
    )

    assert response.status_code == 200
    assert response.headers['content-disposition'] == 'attachment; name="weasyprint"; filename="weasyprint.pdf"'
    assert response.headers['content-type'] == 'application/pdf'

def test_empty_file_name():
    response = client.post(
        "/pdfs",
        json={"filename": "           ", "html": "<h1>Hello World</h1>"},
    )

    assert response.status_code == 200
    assert response.headers['content-disposition'] == 'attachment; name="weasyprint"; filename="weasyprint.pdf"'
    assert response.headers['content-type'] == 'application/pdf'

def test_strip_specific_file_name():
    response = client.post(
        "/pdfs",
        json={"filename": "   shipping-label   ", "html": "<h1>Hello World</h1>"},
    )

    assert response.status_code == 200
    assert response.headers['content-disposition'] == 'attachment; name="shipping-label"; filename="shipping-label.pdf"'
    assert response.headers['content-type'] == 'application/pdf'
