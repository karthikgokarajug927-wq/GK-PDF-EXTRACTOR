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

@app.route('/')
def home():
    return render_template("index.html")

@app.route("/", methods=["POST"])
def process():

    tool = request.form.get("tool")
    files = request.files.getlist("files")

    if not files or files[0].filename == "":
        return "No files uploaded"

    memory_file = io.BytesIO()

    # =============================
    # PDF MERGE
    # =============================
    if tool == "merge_pdf":
        merger = PdfMerger()

        for f in files:
            merger.append(f)

        merger.write(memory_file)
        merger.close()

        memory_file.seek(0)

        return send_file(
            memory_file,
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

                unique = str(uuid.uuid4())

                temp_pdf = "/tmp/temp.pdf"
temp_docx = "/tmp/temp.docx"
                with open(temp_pdf, "wb") as t:
                    t.write(f.read())

                cv = Converter(temp_pdf)
                cv.convert(temp_docx)
                cv.close()

                with open(temp_docx, "rb") as d:
                    zip_file.writestr(
                        f.filename.replace(".pdf", ".docx"),
                        d.read()
                    )

                os.remove(temp_pdf)
                os.remove(temp_docx)

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

                unique = str(uuid.uuid4())

                temp_docx = "/tmp/temp.docx"
temp_pdf = "/tmp/temp.pdf"

                with open(temp_docx, "wb") as t:
                    t.write(f.read())

                doc = Document(temp_docx)

                c = canvas.Canvas(temp_pdf)

                y = 800
                for para in doc.paragraphs:
                    c.drawString(40, y, para.text)
                    y -= 20
                    if y < 40:
                        c.showPage()
                        y = 800

                c.save()

                with open(temp_pdf, "rb") as p:
                    zip_file.writestr(
                        f.filename.replace(".docx", ".pdf"),
                        p.read()
                    )

                os.remove(temp_docx)
                os.remove(temp_pdf)

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

        zip_file = zipfile.ZipFile(files[0])
        memory_zip = io.BytesIO()

        with zipfile.ZipFile(memory_zip, "w") as new_zip:
            for file in zip_file.namelist():
                new_zip.writestr(file, zip_file.read(file))

        memory_zip.seek(0)

        return send_file(
            memory_zip,
            download_name="extracted_files.zip",
            as_attachment=True
        )

    return "Invalid Tool"


if __name__ == "__main__":
    app.run()

