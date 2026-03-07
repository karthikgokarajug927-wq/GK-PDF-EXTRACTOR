import streamlit as st
import zipfile
import io

st.set_page_config(
    page_title="GK ZIP to PDF Extractor",
    page_icon="📦",
    layout="wide"
)

st.title("📦 GK ZIP to PDF Extractor")
st.caption("Upload a ZIP file and extract all PDF files")

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

            st.subheader("Download Individual PDFs")

            pdf_data = {}

            for pdf in pdf_files:

                pdf_bytes = zip_ref.read(pdf)
                pdf_data[pdf] = pdf_bytes

                st.download_button(
                    label=f"⬇ Download {pdf}",
                    data=pdf_bytes,
                    file_name=pdf,
                    mime="application/pdf"
                )

            st.divider()
            st.subheader("Download All PDFs Together")

            zip_buffer = io.BytesIO()

            with zipfile.ZipFile(zip_buffer, "w") as new_zip:
                for pdf_name, pdf_bytes in pdf_data.items():
                    new_zip.writestr(pdf_name, pdf_bytes)

            st.download_button(
                label="⬇ Download All PDFs as ZIP",
                data=zip_buffer.getvalue(),
                file_name="extracted_pdfs.zip",
                mime="application/zip"
            )

        else:
            st.error("No PDF files found in this ZIP file.")

st.divider()

st.caption("GK Tools 🚀")
