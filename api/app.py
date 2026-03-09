from flask import Flask, request, send_file, render_template
import zipfile
import io
import uuid
import os
from PyPDF2 import PdfMerger
from pdf2docx import Converter
from docx import Document
from reportlab.pdfgen import canvas

app = Flask(__name__)

# /tmp is the ONLY writable directory in Vercel's serverless environment
TEMP_DIR = "/tmp"


def temp_path(ext):
    """Generate a safe temp file path under /tmp"""
    return os.path.join(TEMP_DIR, str(uuid.uuid4()) + ext)


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "GET":
        return render_template("index.html")

    tool = request.form.get("tool")
    files = request.files.getlist("files")

    if not files or files[0].filename == "":
        return "No files uploaded"

    # =============================
    # PDF MERGE
    # =============================
    if tool == "merge_pdf":
        merger = PdfMerger()
        output = io.BytesIO()
        for f in files:
            merger.append(f)
        merger.write(output)
        merger.close()
        output.seek(0)
        return send_file(
            output,
            download_name="merged.pdf",
            as_attachment=True
        )

    # =============================
    # PDF → WORD
    # =============================
    elif tool == "pdf_to_word":
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for f in files:
                # Must use /tmp — pdf2docx requires real file paths
                pdf_path = temp_path(".pdf")
                docx_path = temp_path(".docx")
                try:
                    with open(pdf_path, "wb") as temp:
                        temp.write(f.read())
                    cv = Converter(pdf_path)
                    cv.convert(docx_path)
                    cv.close()
                    with open(docx_path, "rb") as d:
                        zip_file.writestr(
                            f.filename.replace(".pdf", ".docx"),
                            d.read()
                        )
                finally:
                    if os.path.exists(pdf_path):
                        os.remove(pdf_path)
                    if os.path.exists(docx_path):
                        os.remove(docx_path)

        zip_buffer.seek(0)
        return send_file(
            zip_buffer,
            download_name="converted_word_files.zip",
            as_attachment=True
        )

    # =============================
    # WORD → PDF
    # =============================
    elif tool == "word_to_pdf":
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for f in files:
                docx_path = temp_path(".docx")
                try:
                    with open(docx_path, "wb") as temp:
                        temp.write(f.read())
                    doc = Document(docx_path)

                    # Write PDF to BytesIO — no need for a temp file
                    pdf_buffer = io.BytesIO()
                    c = canvas.Canvas(pdf_buffer)
                    y = 800
                    for para in doc.paragraphs:
                        c.drawString(40, y, para.text)
                        y -= 20
                        if y < 40:
                            c.showPage()
                            y = 800
                    c.save()
                    pdf_buffer.seek(0)

                    zip_file.writestr(
                        f.filename.replace(".docx", ".pdf"),
                        pdf_buffer.read()
                    )
                finally:
                    if os.path.exists(docx_path):
                        os.remove(docx_path)

        zip_buffer.seek(0)
        return send_file(
            zip_buffer,
            download_name="converted_pdf_files.zip",
            as_attachment=True
        )

    # =============================
    # ZIP EXTRACT
    # =============================
    elif tool == "extract_zip":
        uploaded_zip = zipfile.ZipFile(files[0])
        memory_zip = io.BytesIO()
        with zipfile.ZipFile(memory_zip, "w") as new_zip:
            for file in uploaded_zip.namelist():
                new_zip.writestr(file, uploaded_zip.read(file))
        memory_zip.seek(0)
        return send_file(
            memory_zip,
            download_name="extracted_files.zip",
            as_attachment=True
        )

    return "Invalid Tool"


if __name__ == "__main__":
    app.run(debug=True)
