import streamlit as st
import pdfplumber
import pandas as pd
import zipfile
import io
import time

st.set_page_config(
    page_title="GK PDF Extractor Pro",
    page_icon="📄",
    layout="wide"
)

st.title("📄 GK PDF Extractor Pro")
st.caption("Extract text and tables from PDFs instantly")

st.divider()

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Supported", "PDF / ZIP")

with col2:
    st.metric("Outputs", "Excel / CSV")

with col3:
    st.metric("Extraction", "Text + Tables")

with col4:
    st.metric("Mode", "Auto")

st.divider()

uploaded_files = st.file_uploader(
    "📂 Upload PDF files or ZIP",
    type=["pdf","zip"],
    accept_multiple_files=True
)

text_data = []
table_data = []

def process_pdf(file, filename):

    with pdfplumber.open(file) as pdf:

        text = ""

        for page in pdf.pages:

            text += page.extract_text() or ""

            tables = page.extract_tables()

            for table in tables:
                df = pd.DataFrame(table)
                df["Source File"] = filename
                table_data.append(df)

        text_data.append({
            "File Name": filename,
            "Extracted Text": text
        })

if uploaded_files:

    progress = st.progress(0)
    status = st.empty()

    total_files = len(uploaded_files)
    count = 0

    for uploaded in uploaded_files:

        if uploaded.name.endswith(".zip"):

            with zipfile.ZipFile(uploaded) as z:

                pdf_files = [f for f in z.namelist() if f.endswith(".pdf")]

                for pdf in pdf_files:

                    status.write(f"Processing {pdf}")

                    with z.open(pdf) as file:
                        process_pdf(file, pdf)

        else:

            status.write(f"Processing {uploaded.name}")
            process_pdf(uploaded, uploaded.name)

        count += 1
        progress.progress(count / total_files)
        time.sleep(0.2)

    text_df = pd.DataFrame(text_data)

    st.success(f"✅ Processed {len(text_data)} PDFs")

    st.subheader("Extracted Text")
    st.dataframe(text_df, use_container_width=True)

    if table_data:

        tables_df = pd.concat(table_data)

        st.subheader("Extracted Tables")
        st.dataframe(tables_df, use_container_width=True)

    excel_buffer = io.BytesIO()

    with pd.ExcelWriter(excel_buffer, engine="openpyxl") as writer:

        text_df.to_excel(writer, sheet_name="Text", index=False)

        if table_data:
            tables_df.to_excel(writer, sheet_name="Tables", index=False)

    csv_buffer = text_df.to_csv(index=False).encode()

    col1, col2 = st.columns(2)

    with col1:
        st.download_button(
            "⬇ Download Excel",
            data=excel_buffer.getvalue(),
            file_name="gk_pdf_extraction.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    with col2:
        st.download_button(
            "⬇ Download CSV",
            data=csv_buffer,
            file_name="gk_pdf_text.csv",
            mime="text/csv"
        )

st.divider()

st.caption("GK Tools • PDF Automation Suite 🚀")
