import streamlit as st
import pytesseract
import cv2
import numpy as np
from PIL import Image
import io
import time

# ── Page config ────────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="DOCSCAN — OCR Scanner",
    page_icon="⬡",
    layout="wide",
)

# ── Custom CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Space Mono', monospace;
    background-color: #0a0a0a;
    color: #e8e8e8;
}

.stApp { background-color: #0a0a0a; }

h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.8rem; }

.block-container { padding: 2rem 3rem; }

section[data-testid="stFileUploadDropzone"] {
    background: #111 !important;
    border: 1px solid #222 !important;
    border-radius: 2px !important;
}

.stButton > button {
    width: 100%;
    background: transparent;
    border: 1px solid #00ff88;
    color: #00ff88;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding: 0.8rem;
    border-radius: 1px;
    transition: all 0.2s;
}
.stButton > button:hover {
    background: #00ff88;
    color: #000;
}

.stat-card {
    border: 1px solid #222;
    background: #111;
    padding: 14px 18px;
    border-radius: 1px;
    text-align: center;
}
.stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #00ff88;
    line-height: 1;
}
.stat-label {
    font-size: 0.6rem;
    letter-spacing: 3px;
    color: #555;
    text-transform: uppercase;
    margin-top: 4px;
}

.output-box {
    border: 1px solid #222;
    background: #111;
    border-radius: 1px;
    padding: 20px;
    min-height: 300px;
    font-family: 'Space Mono', monospace;
    font-size: 0.8rem;
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
    color: #e8e8e8;
}

.badge {
    display: inline-block;
    padding: 3px 10px;
    border: 1px solid #222;
    font-size: 0.6rem;
    letter-spacing: 2px;
    color: #555;
    border-radius: 1px;
    margin-right: 6px;
}

.section-label {
    font-size: 0.6rem;
    letter-spacing: 3px;
    color: #555;
    text-transform: uppercase;
    border-bottom: 1px solid #222;
    padding-bottom: 8px;
    margin-bottom: 16px;
}

.info-msg {
    padding: 10px 14px;
    border: 1px solid #00ccff44;
    background: #00ccff08;
    color: #00ccff;
    font-size: 0.7rem;
    letter-spacing: 1px;
    border-radius: 1px;
}

.error-msg {
    padding: 10px 14px;
    border: 1px solid #ff6b3566;
    background: #ff6b3510;
    color: #ff6b35;
    font-size: 0.7rem;
    letter-spacing: 1px;
    border-radius: 1px;
}

.warn-msg {
    padding: 10px 14px;
    border: 1px solid #ffcc0066;
    background: #ffcc0010;
    color: #ffcc00;
    font-size: 0.7rem;
    letter-spacing: 1px;
    border-radius: 1px;
}
</style>
""", unsafe_allow_html=True)


# ── Preprocessing helpers ──────────────────────────────────────────────────────

def preprocess_image(pil_img: Image.Image, mode: str) -> np.ndarray:
    """Apply OpenCV preprocessing based on selected mode."""
    img = np.array(pil_img.convert("RGB"))
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    if mode == "Auto (Default)":
        # Adaptive threshold — works well for most docs
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        processed = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 31, 11
        )

    elif mode == "High Contrast (Printed)":
        # Otsu binarization — great for clean printed text
        blur = cv2.GaussianBlur(gray, (3, 3), 0)
        _, processed = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    elif mode == "Handwritten Notes":
        # Lighter processing — preserve pen strokes
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        processed = cv2.adaptiveThreshold(
            blur, 255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY, 15, 8
        )

    elif mode == "Low Light / Faded":
        # CLAHE contrast enhancement first
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        _, processed = cv2.threshold(
            enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )

    elif mode == "ID Card / Dense Layout":
        # Sharpen edges before threshold
        kernel = np.array([[-1,-1,-1],[-1,9,-1],[-1,-1,-1]])
        sharpened = cv2.filter2D(gray, -1, kernel)
        _, processed = cv2.threshold(
            sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )

    else:
        processed = gray

    return processed


def run_ocr(processed_img: np.ndarray, lang: str, psm: int) -> str:
    """Run Tesseract OCR and return extracted text."""
    config = f"--oem 3 --psm {psm}"
    text = pytesseract.image_to_string(processed_img, lang=lang, config=config)
    return text.strip()


def get_word_data(processed_img: np.ndarray, lang: str, psm: int):
    """Get per-word confidence data from Tesseract."""
    config = f"--oem 3 --psm {psm}"
    return pytesseract.image_to_data(
        processed_img, lang=lang, config=config,
        output_type=pytesseract.Output.DICT
    )


# ── Sidebar ────────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown("### ⬡ Settings")
    st.markdown("---")

    st.markdown("**Preprocessing Mode**")
    preprocess_mode = st.selectbox(
        "preprocess_mode",
        ["Auto (Default)", "High Contrast (Printed)", "Handwritten Notes",
         "Low Light / Faded", "ID Card / Dense Layout"],
        label_visibility="collapsed"
    )

    st.markdown("**OCR Language**")
    lang_map = {
        "English": "eng",
        "Hindi": "hin",
        "Telugu": "tel",
        "French": "fra",
        "German": "deu",
        "Spanish": "spa",
        "Chinese (Simplified)": "chi_sim",
    }
    lang_label = st.selectbox("lang", list(lang_map.keys()), label_visibility="collapsed")
    lang = lang_map[lang_label]

    st.markdown("**Page Segmentation Mode**")
    psm_map = {
        "Auto (3) — General docs": 3,
        "Single block (6) — Paragraphs": 6,
        "Single line (7)": 7,
        "Single word (8)": 8,
        "Sparse text (11) — IDs, forms": 11,
        "Raw line (13)": 13,
    }
    psm_label = st.selectbox("psm", list(psm_map.keys()), label_visibility="collapsed")
    psm = psm_map[psm_label]

    show_preprocessed = st.checkbox("Show preprocessed image", value=False)
    show_confidence   = st.checkbox("Show word confidence heatmap", value=False)

    st.markdown("---")
    st.markdown(
        '<div style="font-size:0.6rem;letter-spacing:2px;color:#555;">DOCSCAN v1.0 · Tesseract + OpenCV</div>',
        unsafe_allow_html=True
    )


# ── Header ─────────────────────────────────────────────────────────────────────

st.markdown(
    '<div style="font-size:0.6rem;letter-spacing:4px;color:#00ff88;margin-bottom:4px;">// OPTICAL CHARACTER RECOGNITION</div>',
    unsafe_allow_html=True
)
st.markdown("# DOC**SCAN**")
st.markdown(
    '<div style="margin-bottom:2rem;">'
    '<span class="badge">TESSERACT</span>'
    '<span class="badge">OPENCV</span>'
    '<span class="badge">STREAMLIT</span>'
    '</div>',
    unsafe_allow_html=True
)


# ── Main layout ────────────────────────────────────────────────────────────────

col_left, col_right = st.columns([1, 1], gap="large")

with col_left:
    st.markdown('<div class="section-label">01 — Upload Document</div>', unsafe_allow_html=True)

    uploaded = st.file_uploader(
        "Upload image",
        type=["jpg", "jpeg", "png", "bmp", "tiff", "webp"],
        label_visibility="collapsed"
    )

    if uploaded:
        pil_img = Image.open(uploaded)
        st.image(pil_img, use_container_width=True)

        w, h = pil_img.size
        size_kb = uploaded.size / 1024
        st.markdown(
            f'<div style="font-size:0.65rem;color:#555;margin-top:6px;">'
            f'{uploaded.name} · {w}×{h}px · {size_kb:.1f} KB</div>',
            unsafe_allow_html=True
        )

        if show_preprocessed:
            st.markdown('<div class="section-label" style="margin-top:16px;">Preprocessed Preview</div>', unsafe_allow_html=True)
            processed_preview = preprocess_image(pil_img, preprocess_mode)
            st.image(processed_preview, use_container_width=True, clamp=True)

    scan_clicked = st.button("→ Extract Text", disabled=(uploaded is None))


with col_right:
    st.markdown('<div class="section-label">02 — Extracted Text</div>', unsafe_allow_html=True)

    if "ocr_text" not in st.session_state:
        st.session_state.ocr_text = ""
    if "ocr_conf"  not in st.session_state:
        st.session_state.ocr_conf  = None
    if "ocr_words" not in st.session_state:
        st.session_state.ocr_words = None

    # Run OCR
    if scan_clicked and uploaded:
        with st.spinner("Scanning document..."):
            try:
                pil_img   = Image.open(uploaded)
                processed = preprocess_image(pil_img, preprocess_mode)
                text      = run_ocr(processed, lang, psm)
                word_data = get_word_data(processed, lang, psm)

                st.session_state.ocr_text  = text
                st.session_state.ocr_words = word_data

                confs = [c for c in word_data["conf"] if c != -1]
                st.session_state.ocr_conf = int(np.mean(confs)) if confs else 0

            except pytesseract.TesseractNotFoundError:
                st.markdown(
                    '<div class="error-msg">⚠ Tesseract not found. '
                    'Install it: <code>sudo apt install tesseract-ocr</code> '
                    '(Linux) or <code>brew install tesseract</code> (Mac)</div>',
                    unsafe_allow_html=True
                )
            except Exception as e:
                st.markdown(
                    f'<div class="error-msg">⚠ OCR Error: {e}</div>',
                    unsafe_allow_html=True
                )

    # Display result
    text = st.session_state.ocr_text

    if text:
        words = text.split()
        chars = len(text)
        lines = text.count("\n") + 1
        conf  = st.session_state.ocr_conf

        # Stats row
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.markdown(f'<div class="stat-card"><div class="stat-val">{len(words)}</div><div class="stat-label">Words</div></div>', unsafe_allow_html=True)
        with c2:
            st.markdown(f'<div class="stat-card"><div class="stat-val">{chars}</div><div class="stat-label">Chars</div></div>', unsafe_allow_html=True)
        with c3:
            st.markdown(f'<div class="stat-card"><div class="stat-val">{lines}</div><div class="stat-label">Lines</div></div>', unsafe_allow_html=True)
        with c4:
            conf_color = "#00ff88" if conf >= 70 else "#ffcc00" if conf >= 40 else "#ff6b35"
            st.markdown(
                f'<div class="stat-card"><div class="stat-val" style="color:{conf_color};">{conf}%</div>'
                f'<div class="stat-label">Confidence</div></div>',
                unsafe_allow_html=True
            )

        st.markdown("<br>", unsafe_allow_html=True)

        # Confidence hint
        if conf < 40:
            st.markdown('<div class="warn-msg">⚠ Low confidence. Try a different preprocessing mode or higher resolution image.</div>', unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)

        # Text output
        st.markdown(f'<div class="output-box">{text}</div>', unsafe_allow_html=True)

        # Download + copy
        st.markdown("<br>", unsafe_allow_html=True)
        dl_col, _ = st.columns([1, 1])
        with dl_col:
            st.download_button(
                label="↓ Download as .txt",
                data=text.encode("utf-8"),
                file_name="extracted_text.txt",
                mime="text/plain",
            )

        # Confidence heatmap
        if show_confidence and st.session_state.ocr_words:
            st.markdown('<div class="section-label" style="margin-top:20px;">Word Confidence Heatmap</div>', unsafe_allow_html=True)
            word_data = st.session_state.ocr_words
            lines_html = []
            prev_line  = -1
            line_parts = []

            for i, word in enumerate(word_data["text"]):
                if word_data["conf"][i] == -1:
                    continue
                c    = word_data["conf"][i]
                ln   = word_data["line_num"][i]
                if ln != prev_line and line_parts:
                    lines_html.append(" ".join(line_parts))
                    line_parts = []
                prev_line = ln
                color = (
                    "#00ff88" if c >= 70 else
                    "#ffcc00" if c >= 40 else
                    "#ff6b35"
                )
                line_parts.append(
                    f'<span style="color:{color};font-size:0.75rem;" title="conf: {c}%">{word}</span>'
                )

            if line_parts:
                lines_html.append(" ".join(line_parts))

            heat_html = "<br>".join(lines_html)
            st.markdown(
                f'<div class="output-box" style="font-family:Space Mono,monospace;">{heat_html}</div>',
                unsafe_allow_html=True
            )
            st.markdown(
                '<div style="font-size:0.6rem;color:#555;margin-top:6px;">'
                '<span style="color:#00ff88;">■</span> ≥70%  '
                '<span style="color:#ffcc00;">■</span> 40–69%  '
                '<span style="color:#ff6b35;">■</span> &lt;40%</div>',
                unsafe_allow_html=True
            )

    else:
        st.markdown(
            '<div class="output-box" style="display:flex;align-items:center;justify-content:center;color:#333;">'
            '<span style="letter-spacing:3px;font-size:0.7rem;">AWAITING SCAN</span>'
            '</div>',
            unsafe_allow_html=True
        )
