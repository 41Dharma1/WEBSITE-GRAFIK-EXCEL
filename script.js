// Gunakan sheetId secara konsisten
const sheetId = '1i_9Weeg_TxntAmTJ8nlAHAns8n8OslAG-ePWxCZvdiY';
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

async function fetchData() {
    const loadingEl = document.getElementById('loading');
    
    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        
        // Logika pengolahan data Anda di sini...
        // (Gunakan kode filter per halaman yang saya berikan sebelumnya)

        if (loadingEl) loadingEl.style.display = 'none'; // Memperbaiki error Gambar 3
        
    } catch (error) {
        console.error("Gagal memuat data:", error);
        if (loadingEl) loadingEl.innerText = "Gagal Memuat Data!";
    }
}
