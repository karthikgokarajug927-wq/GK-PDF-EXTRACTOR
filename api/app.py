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

    temp_dir = "/tmp"

    if tool == "merge":

        merger = PdfMerger()

        for file in files:
            path = os.path.join(temp_dir, str(uuid.uuid4()) + ".pdf")
            file.save(path)
            merger.append(path)

        output = os.path.join(temp_dir, "merged.pdf")
        merger.write(output)
        merger.close()

        return send_file(output, as_attachment=True)


    elif tool == "pdf_to_word":

        file = files[0]

        pdf_path = os.path.join(temp_dir, "input.pdf")
        docx_path = os.path.join(temp_dir, "output.docx")

        file.save(pdf_path)

        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()

        return send_file(docx_path, as_attachment=True)


    elif tool == "word_to_pdf":

        file = files[0]

        docx_path = os.path.join(temp_dir, "input.docx")
        pdf_path = os.path.join(temp_dir, "output.pdf")

        file.save(docx_path)

        doc = Document(docx_path)
        c = canvas.Canvas(pdf_path)

        y = 800
        for para in doc.paragraphs:
            c.drawString(50, y, para.text)
            y -= 20

        c.save()

        return send_file(pdf_path, as_attachment=True)


    elif tool == "zip":

        memory_file = io.BytesIO()

        with zipfile.ZipFile(memory_file, "w") as zf:
            for file in files:
                zf.writestr(file.filename, file.read())

        memory_file.seek(0)

        return send_file(
            memory_file,
            download_name="files.zip",
            as_attachment=True
        )


    return "Invalid tool selected"
