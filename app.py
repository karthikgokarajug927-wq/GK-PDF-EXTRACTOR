import streamlit as st
import zipfile
import io

st.title("ZIP to PDF Extractor")

uploaded_files = st.file_uploader("Upload ZIP files", type="zip", accept_multiple_files=True)

all_pdfs = []

if uploaded_files:
    for uploaded in uploaded_files:
        zip_bytes = io.BytesIO(uploaded.read())

        with zipfile.ZipFile(zip_bytes) as z:
            pdf_files = [f for f in z.namelist() if f.lower().endswith(".pdf")]

            if pdf_files:
                st.success(f"{uploaded.name} → {len(pdf_files)} PDFs found")

                for pdf in pdf_files:
                    data = z.read(pdf)

                    st.download_button(
                        label=f"Download {pdf}",
                        data=data,
                        file_name=pdf,
                        mime="application/pdf"
                    )