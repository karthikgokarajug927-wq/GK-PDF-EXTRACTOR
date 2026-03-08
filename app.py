from flask import Flask, render_template_string, request, send_file
import os
import zipfile
from PyPDF2 import PdfMerger
from pdf2docx import Converter
from docx import Document
from reportlab.pdfgen import canvas
from PIL import Image
import io

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head>
<title>GKZIPDF Tools</title>
<style>
body{font-family:Arial;background:#f4f4f4;text-align:center;padding:40px}
.container{background:white;padding:30px;border-radius:10px;width:400px;margin:auto}
select,input,button{margin:10px;padding:10px;width:90%}
</style>
</head>
<body>

<div class="container">
<h2>GKZIPDF Tools</h2>

<form method="POST" enctype="multipart/form-data">

<select name="tool">
<option value="merge">Merge PDF</option>
<option value="compress">Compress PDF</option>
<option value="pdf2word">PDF to Word</option>
<option value="word2pdf">Word to PDF</option>
<option value="zip2pdf">ZIP Images to PDF</option>
</select>

<input type="file" name="files" multiple required>

<button type="submit">Process</button>

</form>
</div>

</body>
</html>
"""

@app.route("/", methods=["GET","POST"])
def home():

    if request.method == "POST":

        tool = request.form["tool"]
        files = request.files.getlist("files")

        if tool == "merge":

            merger = PdfMerger()

            for f in files:
                merger.append(f)

            output = "merged.pdf"
            merger.write(output)
            merger.close()

            return send_file(output, as_attachment=True)

        elif tool == "compress":

            # simple compression (re-saving)
            input_pdf = files[0]
            output = "compressed.pdf"

            with open("temp.pdf","wb") as f:
                f.write(input_pdf.read())

            merger = PdfMerger()
            merger.append("temp.pdf")
            merger.write(output)
            merger.close()

            return send_file(output, as_attachment=True)

        elif tool == "pdf2word":

            input_pdf = files[0]

            with open("temp.pdf","wb") as f:
                f.write(input_pdf.read())

            output = "converted.docx"

            cv = Converter("temp.pdf")
            cv.convert(output)
            cv.close()

            return send_file(output, as_attachment=True)

        elif tool == "word2pdf":

            file = files[0]

            document = Document(file)

            output = "converted.pdf"
            c = canvas.Canvas(output)

            y = 800
            for para in document.paragraphs:
                c.drawString(50,y,para.text)
                y -= 20

            c.save()

            return send_file(output, as_attachment=True)

        elif tool == "zip2pdf":

            file = files[0]

            with zipfile.ZipFile(file,"r") as zip_ref:

                images = []
                for name in zip_ref.namelist():

                    data = zip_ref.read(name)
                    img = Image.open(io.BytesIO(data)).convert("RGB")
                    images.append(img)

                output = "images.pdf"

                images[0].save(output, save_all=True, append_images=images[1:])

            return send_file(output, as_attachment=True)

    return render_template_string(HTML)

if __name__ == "__main__":
    app.run()
