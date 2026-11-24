document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("audio-upload");
    const transcribeBtn = document.getElementById("transcribe-btn");
    const langSelect = document.getElementById("lang");
    const progressContainer = document.getElementById("progress-container");
    const resultBox = document.getElementById("result-box");
    const transcriptionText = document.getElementById("transcription-text");
    const copyBtn = document.getElementById("copy-btn");

    let selectedFile = null;

    // Local development (including opening index.html directly) targets localhost.
    // Deployed frontends must set window.NEUVOICE_API_URL before this script loads.
    const isLocal =
        window.location.protocol === "file:" ||
        ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
    const API_URL =
        window.NEUVOICE_API_URL ||
        (isLocal ? "http://127.0.0.1:8000/transcribe" : "");

    // Handle Drag & Drop
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // Handle Click Upload
    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function renderSelectedFile(file) {
        // Keep the hidden file input in the DOM; replace only the prompt elements.
        Array.from(dropZone.children).forEach((child) => {
            if (child !== fileInput) child.remove();
        });

        const icon = document.createElement("i");
        icon.dataset.lucide = "file-audio";
        icon.className = "upload-icon";
        icon.style.color = "var(--accent)";

        const heading = document.createElement("h2");
        heading.textContent = file.name;
        heading.style.color = "white";
        heading.style.fontSize = "1.2rem";

        const change = document.createElement("p");
        change.className = "text-accent";
        change.textContent = "Change File";
        change.style.cursor = "pointer";
        change.addEventListener("click", (event) => {
            event.stopPropagation();
            fileInput.click();
        });

        dropZone.append(icon, heading, change);
        lucide.createIcons();
    }

    function handleFileSelect(file) {
        if (!file.type.startsWith("audio/")) {
            alert("Please upload a valid audio file.");
            return;
        }
        selectedFile = file;
        renderSelectedFile(file);
        transcribeBtn.disabled = false;
    }

    // Handle Transcription Request
    transcribeBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

        if (!API_URL) {
            alert(
                "Backend URL is not configured. Set window.NEUVOICE_API_URL before app.js loads."
            );
            return;
        }

        // UI Reset
        resultBox.classList.add("hidden");
        progressContainer.classList.remove("hidden");
        transcribeBtn.disabled = true;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("language", langSelect.value);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Transcription server failed. Make sure backend is running.");
            }

            const data = await response.json();

            // textContent avoids interpreting transcribed text as HTML.
            transcriptionText.textContent = data.text;
            resultBox.classList.remove("hidden");
        } catch (error) {
            alert(error.message);
            console.error(error);
        } finally {
            progressContainer.classList.add("hidden");
            transcribeBtn.disabled = false;
        }
    });

    // Handle Copy
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(transcriptionText.innerText);
        const icon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i data-lucide="check" style="color:#10b981"></i>';
        lucide.createIcons();
        setTimeout(() => {
            copyBtn.innerHTML = icon;
        }, 2000);
    });
});
