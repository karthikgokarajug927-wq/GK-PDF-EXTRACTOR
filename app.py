from flask import Flask, render_template_string, request, send_file
import zipfile
import io
import base64
import uuid
import os
from PyPDF2 import PdfMerger
from pdf2docx import Converter
from docx import Document
from reportlab.pdfgen import canvas

app = Flask(__name__)

stored_pdfs=[]

HTML = """
<!DOCTYPE html>
<html>
<head>

<title>GKZIPDF Tools</title>

<style>

body{
margin:0;
font-family:Arial;
background:#0e0e0e;
color:white;
}

header{
padding:20px 60px;
background:black;
font-size:22px;
font-weight:bold;
}

.hero{
text-align:center;
padding:60px;
}

.hero h1{
font-size:42px;
}

.tools{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
gap:25px;
padding:40px 80px;
}

.card{
background:#1c1c1c;
padding:25px;
border-radius:10px;
}

input{
margin:10px 0;
width:100%;
}

button{
background:white;
color:black;
border:none;
padding:10px 15px;
border-radius:6px;
cursor:pointer;
font-weight:bold;
}

button:hover{
background:#ddd;
}

</style>

</head>

<body>

<header>📄 GKZIPDF</header>

<div class="hero">

<h1>Smart PDF Tools</h1>

<p>Merge, Convert, Compress and Extract PDFs easily</p>

</div>

<div class="tools">

<div class="card">

<h3>Merge PDF</h3>

<form method="POST" enctype="multipart/form-data">

<input type="hidden" name="tool" value="merge">

<input type="file" name="files" multiple required>

<button>Merge</button>

</form>

</div>

<div class="card">

<h3>Compress PDF</h3>

<form method="POST" enctype="multipart/form-data">

<input type="hidden" name="tool" value="compress">

<input type="file" name="files" multiple required>

<button>Compress</button>

</form>

</div>

<div class="card">

<h3>PDF → Word</h3>

<form method="POST" enctype="multipart/form-data">

<input type="hidden" name="tool" value="pdf2word">

<input type="file" name="files" multiple required>

<button>Convert</button>

</form>

</div>

<div class="card">

<h3>Word → PDF</h3>

<form method="POST" enctype="multipart/form-data">

<input type="hidden" name="tool" value="word2pdf">

<input type="file" name="files" multiple required>

<button>Convert</button>

</form>

</div>

<div class="card">

<h3>ZIP → Extract PDFs</h3>

<form method="POST" enctype="multipart/form-data">

<input type="hidden" name="tool" value="zipextract">

<input type="file" name="files" multiple required>

<button>Extract</button>

</form>

</div>

</div>

</body>
</html>
"""

RESULT_HTML="""
<!DOCTYPE html>
<html>
<head>
<title>Extracted PDFs</title>
</head>

<body style="font-family:Arial;background:#111;color:white;padding:40px">

<h2>Extracted PDF Files</h2>

{% for name,data in files %}

<p>

{{name}}

<a download="{{name}}" href="data:application/pdf;base64,{{data}}">
<button>Download</button>
</a>

</p>

{% endfor %}

<hr>

<form method="POST" action="/download_all">

{% for name,data in files %}
<input type="hidden" name="names" value="{{name}}">
<input type="hidden" name="datas" value="{{data}}">
{% endfor %}

<button>Download All PDFs as ZIP</button>

</form>

</body>
</html>
"""

@app.route("/", methods=["GET","POST"])
def home():

    if request.method=="POST":

        tool=request.form["tool"]
        files=request.files.getlist("files")

        if tool=="merge":

            merger=PdfMerger()

            for f in files:
                merger.append(f)

            output=io.BytesIO()
            merger.write(output)
            merger.close()

            output.seek(0)

            return send_file(output,download_name="merged.pdf",as_attachment=True)

        if tool=="compress":

            merger=PdfMerger()

            for f in files:
                merger.append(f)

            output=io.BytesIO()
            merger.write(output)
            merger.close()

            output.seek(0)

            return send_file(output,download_name="compressed.pdf",as_attachment=True)

        if tool=="pdf2word":

            zip_buffer=io.BytesIO()

            with zipfile.ZipFile(zip_buffer,"w") as zip_file:

                for f in files:

                    unique=str(uuid.uuid4())
                    temp_pdf=f"temp_{unique}.pdf"
                    temp_docx=f"temp_{unique}.docx"

                    with open(temp_pdf,"wb") as t:
                        t.write(f.read())

                    cv=Converter(temp_pdf)
                    cv.convert(temp_docx)
                    cv.close()

                    with open(temp_docx,"rb") as d:
                        zip_file.writestr(f.filename.replace(".pdf",".docx"),d.read())

                    os.remove(temp_pdf)
                    os.remove(temp_docx)

            zip_buffer.seek(0)

            return send_file(zip_buffer,download_name="converted_docs.zip",as_attachment=True)

        if tool=="word2pdf":

            zip_buffer=io.BytesIO()

            with zipfile.ZipFile(zip_buffer,"w") as zip_file:

                for f in files:

                    document=Document(f)

                    output=io.BytesIO()

                    c=canvas.Canvas(output)

                    y=800

                    for para in document.paragraphs:
                        c.drawString(50,y,para.text)
                        y-=20

                    c.save()

                    output.seek(0)

                    zip_file.writestr(f.filename.replace(".docx",".pdf"),output.read())

            zip_buffer.seek(0)

            return send_file(zip_buffer,download_name="converted_pdfs.zip",as_attachment=True)

        if tool=="zipextract":

            extracted=[]
            names=set()

            for uploaded_file in files:

                with zipfile.ZipFile(uploaded_file,"r") as zip_ref:

                    for file in zip_ref.namelist():

                        if file.lower().endswith(".pdf"):

                            if file not in names:

                                data=zip_ref.read(file)

                                encoded=base64.b64encode(data).decode()

                                extracted.append((file,encoded))

                                names.add(file)

            return render_template_string(RESULT_HTML,files=extracted)

    return render_template_string(HTML)

@app.route("/download_all",methods=["POST"])
def download_all():

    names=request.form.getlist("names")
    datas=request.form.getlist("datas")

    zip_buffer=io.BytesIO()

    with zipfile.ZipFile(zip_buffer,"w") as zip_file:

        for name,data in zip(names,datas):

            pdf=base64.b64decode(data)

            zip_file.writestr(name,pdf)

    zip_buffer.seek(0)

    return send_file(zip_buffer,download_name="extracted_pdfs.zip",as_attachment=True)

if __name__=="__main__":
    app.run()
