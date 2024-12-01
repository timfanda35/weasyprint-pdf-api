from dotenv import load_dotenv
import io
import os
import logging
from typing import Annotated

from fastapi import FastAPI, Response, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, SecretStr
from functools import lru_cache
from weasyprint import HTML, urls

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class Settings:
    def __init__(self):
        self.API_KEY = os.getenv("API_KEY")
        if not self.API_KEY:
            raise ValueError("API_KEY environment variable must be set")
        self.ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")
        self.CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

@lru_cache()
def get_settings():
    return Settings()

class PrintPdfRequest(BaseModel):
    html: str
    filename: str = 'weasyprint'

app = FastAPI(
    title="WeasyPrint PDF API",
    description="A REST API for generating PDFs from HTML using WeasyPrint",
    version="1.0.0"
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=get_settings().ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

async def verify_api_key(x_api_key: Annotated[str | None, Header()] = None):
    if not x_api_key or x_api_key != get_settings().API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )
    return x_api_key

@app.post("/pdfs")
async def print_pdf(
    body: PrintPdfRequest,
    api_key: Annotated[str, Depends(verify_api_key)]
):
    if not body.html.strip():
        raise HTTPException(
            status_code=400,
            detail="HTML content cannot be empty"
        )

    try:
        # Create HTML object with explicit base URL
        html = HTML(string=body.html, base_url=urls.path2url('/'))
        
        # Generate PDF with error logging
        try:
            byte_string = html.write_pdf()
        except Exception as pdf_error:
            logger.error(f"PDF generation error: {str(pdf_error)}", exc_info=True)
            raise HTTPException(
                status_code=400,
                detail=f"PDF generation failed: {str(pdf_error)}"
            )
            
    except Exception as e:
        logger.error(f"WeasyPrint error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=400,
            detail=f"HTML processing failed: {str(e)}"
        )

    filename = body.filename.strip() or 'weasyprint'

    headers = {
        'Content-Type': 'application/pdf',
        'Content-Disposition': f'attachment; filename="{filename}.pdf"'
    }
    return StreamingResponse(
        io.BytesIO(byte_string),
        headers=headers,
        media_type='application/pdf'
    )
