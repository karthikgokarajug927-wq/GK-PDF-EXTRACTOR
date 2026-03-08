from flask import Flask, render_template_string, request, send_file
import zipfile
import io
from PyPDF2 import PdfMerger
from pdf2docx import Converter
from docx import Document
from reportlab.pdfgen import canvas

app = Flask(__name__)

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

.card h3{
margin-bottom:10px;
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

@app.route("/", methods=["GET","POST"])
def home():

    if request.method == "POST":

        tool=request.form["tool"]
        files=request.files.getlist("files")

        if tool=="merge":

            merger=PdfMerger()

            for f in files:
                merger.append(f)

            output="/tmp/merged.pdf"
            merger.write(output)
            merger.close()

            return send_file(output,as_attachment=True)

        if tool=="compress":

            merger=PdfMerger()

            for f in files:
                merger.append(f)

            output="/tmp/compressed.pdf"
            merger.write(output)
            merger.close()

            return send_file(output,as_attachment=True)

        if tool=="pdf2word":

            zip_buffer=io.BytesIO()

            with zipfile.ZipFile(zip_buffer,"w") as zip_file:

                for f in files:

                    temp="/tmp/temp.pdf"

                    with open(temp,"wb") as t:
                        t.write(f.read())

                    output="/tmp/converted.docx"

                    cv=Converter(temp)
                    cv.convert(output)
                    cv.close()

                    with open(output,"rb") as d:
                        zip_file.writestr(f.filename.replace(".pdf",".docx"),d.read())

            return send_file(
                io.BytesIO(zip_buffer.getvalue()),
                download_name="converted_docs.zip",
                as_attachment=True
            )

        if tool=="word2pdf":

            zip_buffer=io.BytesIO()

            with zipfile.ZipFile(zip_buffer,"w") as zip_file:

                for f in files:

                    document=Document(f)

                    output="/tmp/out.pdf"

                    c=canvas.Canvas(output)

                    y=800

                    for para in document.paragraphs:
                        c.drawString(50,y,para.text)
                        y-=20

                    c.save()

                    with open(output,"rb") as d:
                        zip_file.writestr(f.filename.replace(".docx",".pdf"),d.read())

            return send_file(
                io.BytesIO(zip_buffer.getvalue()),
                download_name="converted_pdfs.zip",
                as_attachment=True
            )

        if tool=="zipextract":

            all_pdfs=[]
            names=set()

            for uploaded_file in files:

                with zipfile.ZipFile(uploaded_file,"r") as zip_ref:

                    for file in zip_ref.namelist():

                        if file.lower().endswith(".pdf"):

                            if file not in names:

                                data=zip_ref.read(file)

                                all_pdfs.append((file,data))

                                names.add(file)

            zip_buffer=io.BytesIO()

            with zipfile.ZipFile(zip_buffer,"w") as zip_file:

                for name,data in all_pdfs:
                    zip_file.writestr(name,data)

            return send_file(
                io.BytesIO(zip_buffer.getvalue()),
                download_name="extracted_pdfs.zip",
                as_attachment=True
            )

    return render_template_string(HTML)

if __name__=="__main__":
    app.run()
