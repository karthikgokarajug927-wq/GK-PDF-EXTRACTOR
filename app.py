stored_files=[]

@app.route("/download/<int:file_id>")
def download_file(file_id):

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

    return send_file(
        io.BytesIO(zip_buffer.getvalue()),
        download_name="extracted_pdfs.zip",
        as_attachment=True
    )
