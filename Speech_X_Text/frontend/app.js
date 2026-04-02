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
    
    // NOTE: This URL will need to be updated to your Render/HuggingFace deployment URL 
    // once the backend is deployed. For local testing, it connects to localhost.
    const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
        ? "http://127.0.0.1:8000/transcribe" 
        : "https://base-pd3b.onrender.com/transcribe";

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

    function handleFileSelect(file) {
        if (!file.type.startsWith("audio/")) {
            alert("Please upload a valid audio file.");
            return;
        }
        selectedFile = file;
        
        // Update UI to show selected file
        dropZone.innerHTML = `
            <i data-lucide="file-audio" class="upload-icon" style="color:var(--accent)"></i>
            <h2 style="color:white; font-size: 1.2rem;">${file.name}</h2>
            <p class="text-accent" style="cursor:pointer" onclick="document.getElementById('audio-upload').click(); event.stopPropagation();">Change File</p>
        `;
        lucide.createIcons();
        transcribeBtn.disabled = false;
    }

    // Handle Transcription Request
    transcribeBtn.addEventListener("click", async () => {
        if (!selectedFile) return;

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
                body: formData
            });

            if (!response.ok) throw new Error("Transcription server failed. Make sure backend is running.");

            const data = await response.json();
            
            // Show Result
            transcriptionText.innerHTML = data.text.replace(/\n/g, "<br>");
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
