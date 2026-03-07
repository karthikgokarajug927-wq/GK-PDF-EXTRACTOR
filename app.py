import streamlit as st
import zipfile
import io

st.set_page_config(
    page_title="GK ZIP to PDF Extractor",
    page_icon="📦",
    layout="wide"
)

st.title("📦 GK ZIP to PDF Extractor")
st.caption("Upload a ZIP file and download all PDFs inside")

st.divider()

uploaded_file = st.file_uploader(
    "Upload ZIP file",
    type="zip"
)

if uploaded_file:

    with zipfile.ZipFile(uploaded_file, "r") as zip_ref:

        pdf_files = [file for file in zip_ref.namelist() if file.lower().endswith(".pdf")]

        if pdf_files:

            st.success(f"Found {len(pdf_files)} PDF files")

            for pdf in pdf_files:

                pdf_bytes = zip_ref.read(pdf)

                st.download_button(
                    label=f"⬇ Download {pdf}",
                    data=pdf_bytes,
                    file_name=pdf,
                    mime="application/pdf"
                )

        else:
            st.error("No PDF files found in the ZIP")

st.divider()

st.caption("GK Tools 🚀")
