import io

from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from weasyprint import HTML

class PrintPdfRequest(BaseModel):
    html: str
    filename: str = 'weasyprint'

# https://fastapi.tiangolo.com/
app = FastAPI()

@app.post("/pdfs")
async def print_pdf(response: Response, body: PrintPdfRequest):
    # https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#rendering-to-a-single-file
    byte_string = HTML(string=body.html).write_pdf()

    if not body.filename.strip():
        filename = 'weasyprint'
    else:
        filename = body.filename.strip()

    headers = {
        'Content-Type': 'application/pdf',
        'Content-Disposition': '%s; name="%s"; filename="%s.%s"' % (
            'attachment',
            filename,
            filename,
            'pdf'
        )
    }
    return StreamingResponse(io.BytesIO(byte_string), headers=headers)
