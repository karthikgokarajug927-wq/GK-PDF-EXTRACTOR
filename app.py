from flask import Flask, request, render_template_string, send_file
import zipfile
import io

app = Flask(__name__)

stored_files = []

HOME_HTML = """
<!DOCTYPE html>
<html>
<head>

<title>ZIP to PDF Extractor</title>

<style>

body{
background:#0f0f0f;
color:white;
font-family:Arial;
text-align:center;
padding:40px;
}

.container{
max-width:750px;
margin:auto;
background:#1a1a1a;
padding:40px;
border-radius:14px;
box-shadow:0 0 25px rgba(0,0,0,0.6);
}

h1{
margin-bottom:10px;
}

p{
color:#aaa;
}

.drop-zone{
margin-top:25px;
border:2px dashed #555;
padding:40px;
border-radius:10px;
cursor:pointer;
}

.drop-zone.dragover{
border-color:#fff;
background:#222;
}

input{
display:none;
}

button{
margin-top:20px;
background:white;
color:black;
padding:12px 20px;
border:none;
border-radius:8px;
font-size:16px;
cursor:pointer;
}

button:hover{
background:#ddd;
}

.progress{
margin-top:20px;
width:100%;
background:#333;
border-radius:8px;
overflow:hidden;
display:none;
}

.bar{
height:10px;
width:0%;
background:#4caf50;
}

.file-count{
margin-top:10px;
color:#ccc;
}

</style>

</head>

<body>

<div class="container">

<h1>Extract PDFs from ZIP</h1>
<p>Upload ZIP files and extract only PDF documents.</p>

<form id="uploadForm" method="POST" enctype="multipart/form-data">

<label class="drop-zone" id="dropZone">

Drag & Drop ZIP files here  
<br><br>
or click to select

<input type="file" name="files" id="fileInput" multiple accept=".zip">

</label>

<div class="file-count" id="fileCount"></div>

<div class="progress" id="progress">
<div class="bar" id="bar"></div>
</div>

<button type="submit">Extract PDFs</button>

</form>

</div>

<script>

const dropZone = document.getElementById("dropZone")
const fileInput = document.getElementById("fileInput")
const fileCount = document.getElementById("fileCount")
const progress = document.getElementById("progress")
const bar = document.getElementById("bar")

dropZone.addEventListener("click", () => fileInput.click())

fileInput.addEventListener("change", () => {
fileCount.innerText = fileInput.files.length + " ZIP file(s) selected"
})

dropZone.addEventListener("dragover", e=>{
e.preventDefault()
dropZone.classList.add("dragover")
})

dropZone.addEventListener("dragleave", ()=>{
dropZone.classList.remove("dragover")
})

dropZone.addEventListener("drop", e=>{
e.preventDefault()
fileInput.files = e.dataTransfer.files
fileCount.innerText = fileInput.files.length + " ZIP file(s) selected"
})

document.getElementById("uploadForm").addEventListener("submit", ()=>{
progress.style.display="block"
let width=0
let interval=setInterval(()=>{
width+=10
bar.style.width=width+"%"
if(width>=100) clearInterval(interval)
},150)
})

</script>

</body>
</html>
"""

RESULT_HTML = """
<!DOCTYPE html>
<html>
<head>

<title>Extracted PDFs</title>

<style>

body{
background:#0f0f0f;
color:white;
font-family:Arial;
padding:40px;
}

.container{
max-width:850px;
margin:auto;
}

h2{
margin-bottom:20px;
}

table{
width:100%;
border-collapse:collapse;
}

td{
padding:12px;
border-bottom:1px solid #333;
}

button{
background:white;
color:black;
border:none;
padding:8px 14px;
border-radius:6px;
cursor:pointer;
}

button:hover{
background:#ddd;
}

.download-all{
margin-top:30px;
}

a{
text-decoration:none;
}

</style>

</head>

<body>

<div class="container">

<h2>Extracted PDF Files</h2>

<table>

{% for name,data in files %}

<tr>

<td>{{name}}</td>

<td>

<a href="/download/{{loop.index0}}">
<button>Download</button>
</a>

</td>

</tr>

{% endfor %}

</table>

<div class="download-all">

<form method="POST" action="/download_all">

<button>⬇ Download All PDFs</button>

</form>

</div>

</div>

</body>
</html>
"""

@app.route("/", methods=["GET","POST"])
def home():

    global stored_files

    if request.method == "POST":

        uploaded_files = request.files.getlist("files")

        stored_files=[]
        names=set()

        for file in uploaded_files:

            try:

                with zipfile.ZipFile(file,"r") as zip_ref:

                    for item in zip_ref.namelist():

                        if item.lower().endswith(".pdf"):

                            if item not in names:

                                data=zip_ref.read(item)
                                stored_files.append((item,data))
                                names.add(item)

            except:
                pass

        return render_template_string(RESULT_HTML, files=stored_files)

    return render_template_string(HOME_HTML)

@app.route("/download/<int:file_id>")
def download(file_id):

    name,data=stored_files[file_id]

    return send_file(
        io.BytesIO(data),
        download_name=name,
        as_attachment=True
    )

@app.route("/download_all",methods=["POST"])
def download_all():

    zip_buffer=io.BytesIO()

    with zipfile.ZipFile(zip_buffer,"w") as zip_file:

        for name,data in stored_files:
            zip_file.writestr(name,data)

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        download_name="extracted_pdfs.zip",
        as_attachment=True
    )

if __name__ == "__main__":
    app.run(debug=True)
