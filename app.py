import streamlit as st
import zipfile
import io

st.set_page_config(
    page_title="GK ZIP to PDF Extractor",
    page_icon="📦",
    layout="wide"
)

st.title("📦 GK ZIP to PDF Extractor")
st.caption("Upload one or multiple ZIP files and extract all PDF files")

st.divider()

uploaded_files = st.file_uploader(
    "Upload ZIP files",
    type="zip",
    accept_multiple_files=True
)

all_pdfs = {}

if uploaded_files:

    for uploaded_file in uploaded_files:

        with zipfile.ZipFile(uploaded_file, "r") as zip_ref:

            pdf_files = [file for file in zip_ref.namelist() if file.lower().endswith(".pdf")]

            for pdf in pdf_files:

                pdf_bytes = zip_ref.read(pdf)
                all_pdfs[pdf] = pdf_bytes

    if all_pdfs:

        st.success(f"Found {len(all_pdfs)} PDF files")

        # Create ZIP containing all PDFs
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, "w") as new_zip:
            for pdf_name, pdf_bytes in all_pdfs.items():
                new_zip.writestr(pdf_name, pdf_bytes)

        st.subheader("Download All PDFs")

        st.download_button(
            label="⬇ Download All PDFs as ZIP",
            data=zip_buffer.getvalue(),
            file_name="all_extracted_pdfs.zip",
            mime="application/zip"
        )

        st.divider()

        st.subheader("Download Individual PDFs")

        for pdf_name, pdf_bytes in all_pdfs.items():

            st.download_button(
                label=f"⬇ Download {pdf_name}",
                data=pdf_bytes,
                file_name=pdf_name,
                mime="application/pdf"
            )

    else:
        st.error("No PDF files found in uploaded ZIP files")

st.divider()

st.caption("GK Tools 🚀")
