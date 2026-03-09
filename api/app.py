from flask import Flask, request, send_file, render_template
import zipfile
import io
import uuid
import os

from PyPDF2 import PdfMerger
from pdf2docx import Converter
from docx import Document
from reportlab.pdfgen import canvas

app = Flask(__name__, template_folder="../templates")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/", methods=["POST"])
def process():

    tool = request.form.get("tool")
    files = request.files.getlist("files")

    if not files:
        return "No files uploaded"

    temp_dir = "/tmp"

    # ---------------- MERGE PDF ----------------
    if tool == "merge":

        merger = PdfMerger()

        for file in files:
            filename = str(uuid.uuid4()) + ".pdf"
            path = os.path.join(temp_dir, filename)
            file.save(path)
            merger.append(path)

        output_path = os.path.join(temp_dir, "merged.pdf")
        merger.write(output_path)
        merger.close()

        return send_file(output_path, as_attachment=True, download_name="merged.pdf")

    # ---------------- PDF TO WORD ----------------
    elif tool == "pdf_to_word":

        file = files[0]

        pdf_path = os.path.join(temp_dir, str(uuid.uuid4()) + ".pdf")
        docx_path = os.path.join(temp_dir, str(uuid.uuid4()) + ".docx")

        file.save(pdf_path)

        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()

        return send_file(docx_path, as_attachment=True, download_name="converted.docx")

    # ---------------- WORD TO PDF ----------------
    elif tool == "word_to_pdf":

        file = files[0]

        docx_path = os.path.join(temp_dir, str(uuid.uuid4()) + ".docx")
        pdf_path = os.path.join(temp_dir, str(uuid.uuid4()) + ".pdf")

        file.save(docx_path)

        document = Document(docx_path)
        c = canvas.Canvas(pdf_path)

        y = 800
        for para in document.paragraphs:
            c.drawString(50, y, para.text)
            y -= 20

        c.save()

        return send_file(pdf_path, as_attachment=True, download_name="converted.pdf")

    # ---------------- ZIP FILES ----------------
    elif tool == "zip":

        memory_file = io.BytesIO()

        with zipfile.ZipFile(memory_file, "w") as zf:
            for file in files:
                zf.writestr(file.filename, file.read())

        memory_file.seek(0)

        return send_file(
            memory_file,
            as_attachment=True,
            download_name="files.zip",
            mimetype="application/zip"
        )

    return "Invalid tool selected"
