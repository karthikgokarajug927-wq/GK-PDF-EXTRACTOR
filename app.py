import streamlit as st
import zipfile
import io
import pandas as pd

st.set_page_config(page_title="GK ZIP to PDF Extractor", page_icon="📦", layout="wide")

st.title("📦 GK ZIP to PDF Extractor")
st.caption("Upload one or multiple ZIP files and extract all PDF files instantly")

uploaded_files = st.file_uploader(
    "Upload ZIP files",
    type="zip",
    accept_multiple_files=True
)

all_pdfs = []
pdf_names = set()
zip_summary = []

if uploaded_files:

    progress = st.progress(0)
    total = len(uploaded_files)

    for i, uploaded_file in enumerate(uploaded_files):

        count = 0

        try:
            with zipfile.ZipFile(uploaded_file, 'r') as zip_ref:

                for file in zip_ref.namelist():

                    if file.lower().endswith(".pdf"):

                        if file not in pdf_names:   # remove duplicates
                            pdf_data = zip_ref.read(file)
                            all_pdfs.append((file, pdf_data))
                            pdf_names.add(file)

                        count += 1

        except:
            st.error(f"Error reading {uploaded_file.name}")

        zip_summary.append({
            "ZIP File": uploaded_file.name,
            "PDF Files Found": count
        })

        progress.progress((i + 1) / total)

if uploaded_files:

    st.subheader("📊 ZIP File Summary")
    st.dataframe(pd.DataFrame(zip_summary), use_container_width=True)

if all_pdfs:

    st.success(f"✅ {len(all_pdfs)} Unique PDF files extracted")

    pdf_table = pd.DataFrame({
        "PDF File Name": [name for name, _ in all_pdfs]
    })

    st.subheader("📄 Extracted PDFs")
    st.dataframe(pdf_table, use_container_width=True)

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w") as zip_file:
        for name, data in all_pdfs:
            zip_file.writestr(name, data)

    st.download_button(
        label="⬇ Download All PDFs",
        data=zip_buffer.getvalue(),
        file_name="extracted_pdfs.zip",
        mime="application/zip"
    )

else:
    if uploaded_files:
        st.warning("No PDF files found in uploaded ZIP files.")
