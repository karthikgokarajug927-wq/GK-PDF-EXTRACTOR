from flask import Flask, render_template_string, request, send_file
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

<title>GKZIPDF - Smart PDF Tools</title>

<style>

body{
margin:0;
font-family:Arial;
background:#0f0f0f;
color:white;
}

header{
padding:20px 60px;
display:flex;
justify-content:space-between;
align-items:center;
background:#000;
}

.logo{
font-size:22px;
font-weight:bold;
}

.hero{
text-align:center;
padding:80px 20px;
}

.hero h1{
font-size:48px;
margin-bottom:10px;
}

.hero p{
color:#aaa;
font-size:18px;
}

.tools{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:20px;
padding:40px 80px;
}

.card{
background:#1a1a1a;
padding:25px;
border-radius:10px;
text-align:center;
}

.card h3{
margin-bottom:15px;
}

.card input{
margin:10px 0;
}

button{
background:white;
color:black;
border:none;
padding:10px 18px;
border-radius:6px;
cursor:pointer;
font-weight:bold;
}

button:hover{
background:#ddd;
}

footer{
text-align:center;
padding:30px;
color:#777;
}

</style>

</head>

<body>

<header>
<div class="logo">📄 GKZIPDF</div>
</header>

<div class="hero">

<h1>All PDF Tools in One Place</h1>

<p>
Merge, Compress, Convert and Create PDFs easily.
Fast, secure and completely free.
</p>

</div>

<div class="tools">

<div class="card">
<h3>Merge PDF</h3>
<form method="POST" enctype="multipart/form-data">
<input type="hidden" name="tool" value="merge">
<input type="file" name="files" multiple required>
<br>
<button>Process</button>
</form>
</div>

<div class="card">
<h3>Compress PDF</h3>
<form method="POST" enctype="multipart/form-data">
<input type="hidden" name="tool" value="compress">
<input type="file" name="files" required>
<br>
<button>Process</button>
</form>
</div>

<div class="card">
<h3>PDF → Word</h3>
<form method="POST" enctype="multipart/form-data">
<input type="hidden" name="tool" value="pdf2word">
<input type="file" name="files" required>
<br>
<button>Process</button>
</form>
</div>

<div class="card">
<h3>Word → PDF</h3>
<form method="POST" enctype="multipart/form-data">
<input type="hidden" name="tool" value="word2pdf">
<input type="file" name="files" required>
<br>
<button>Process</button>
</form>
</div>

<div class="card">
<h3>ZIP Images → PDF</h3>
<form method="POST" enctype="multipart/form-data">
<input type="hidden" name="tool" value="zip2pdf">
<input type="file" name="files" required>
<br>
<button>Process</button>
</form>
</div>

</div>

<footer>

GKZIPDF © 2026 — Free Online PDF Tools

</footer>

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

            output="/tmp/merged.pdf"
            merger.write(output)
            merger.close()

            return send_file(output,as_attachment=True)

        if tool=="compress":

            input_pdf=files[0]

            temp="/tmp/temp.pdf"
            output="/tmp/compressed.pdf"

            with open(temp,"wb") as f:
                f.write(input_pdf.read())

            merger=PdfMerger()
            merger.append(temp)
            merger.write(output)
            merger.close()

            return send_file(output,as_attachment=True)

        if tool=="pdf2word":

            input_pdf=files[0]

            temp="/tmp/temp.pdf"
            output="/tmp/converted.docx"

            with open(temp,"wb") as f:
                f.write(input_pdf.read())

            cv=Converter(temp)
            cv.convert(output)
            cv.close()

            return send_file(output,as_attachment=True)

        if tool=="word2pdf":

            file=files[0]
            document=Document(file)

            output="/tmp/converted.pdf"

            c=canvas.Canvas(output)

            y=800

            for para in document.paragraphs:
                c.drawString(50,y,para.text)
                y-=20

            c.save()

            return send_file(output,as_attachment=True)

        if tool=="zip2pdf":

            file=files[0]

            with zipfile.ZipFile(file,"r") as zip_ref:

                images=[]

                for name in zip_ref.namelist():

                    if name.lower().endswith((".png",".jpg",".jpeg")):

                        data=zip_ref.read(name)

                        img=Image.open(io.BytesIO(data)).convert("RGB")

                        images.append(img)

                output="/tmp/images.pdf"

                if images:
                    images[0].save(output,save_all=True,append_images=images[1:])
                    return send_file(output,as_attachment=True)

    return render_template_string(HTML)

if __name__=="__main__":
    app.run()
