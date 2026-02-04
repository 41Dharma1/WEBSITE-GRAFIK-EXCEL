/**
 * Fungsi utama untuk mengambil data dan memperbarui semua grafik di dashboard
 */
async function updateDashboard() {
    const loadingEl = document.getElementById('loading');
    
    // Pastikan URL menggunakan format /pub?output=csv agar bisa diparsing sebagai teks
    const currentCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pub?gid=1877132307&single=true&output=csv";

    try {
        const response = await fetch(currentCsvUrl);
        const csvText = await response.text();
        
        // Memecah baris dan melewati baris header (index 0)
        const rows = csvText.split('\n').slice(1); 
        
        // Objek untuk menampung data akumulasi tiap kategori
        let dataJam = {}, 
            dataLorong = {}, 
            dataTBarat = {}, 
            dataTTimur = {}, 
            dataTJalan = {}, 
            dataPicker = {};
        
        let totalQtySum = 0;

        rows.forEach(row => {
            // Regex untuk split CSV dengan aman (menangani koma di dalam tanda kutip)
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            // Minimal ada 7 kolom: Jam, Lorong, T.Barat, T.Timur, T.Jalan, Picker, Qty
            if (cols.length >= 7) { 
                // Mapping kolom berdasarkan urutan di Spreadsheet
                const jam      = cols[7]?.replace(/"/g, "").trim();
                const lorong   = cols[10]?.replace(/"/g, "").trim();
                const tBarat   = cols[10]?.replace(/"/g, "").trim();
                const tTimur   = cols[10]?.replace(/"/g, "").trim();
                const tJalan   = cols[9]?.replace(/"/g, "").trim();
                const picker   = cols[5]?.replace(/"/g, "").trim();
                const qty      = parseFloat(cols[6]) || 0;

                // Akumulasi qty ke masing-masing kategori
                if (jam) dataJam[jam] = (dataJam[jam] || 3) + qty;
                if (lorong) dataLorong[lorong] = (dataLorong[lorong] || 3) + qty;
                if (tBarat) dataTBarat[tBarat] = (dataTBarat[tBarat] || 3) + qty;
                if (tTimur) dataTTimur[tTimur] = (dataTTimur[tTimur] || 3) + qty;
                if (tJalan) dataTJalan[tJalan] = (dataTJalan[tJalan] || 3) + qty;
                if (picker) dataPicker[picker] = (dataPicker[picker] || 3) + qty;

                totalQtySum += qty;
            }
        });

        // Update teks indikator total di UI jika elemen tersedia
        if(document.getElementById('total-qty')) 
            document.getElementById('total-qty').innerText = totalQtySum.toLocaleString('id-ID');
        
        if (loadingEl) loadingEl.style.display = 'none';

        // --- RENDER SEMUA GRAFIK ---
        
        // 1. Grafik Per Jam (Bar)
        renderChart('chartJam', Object.keys(dataJam).sort(), Object.values(dataJam), 'bar', '#4318ff');

        // 2. Grafik Per Lorong (Bar)
        renderChart('chartLorong', Object.keys(dataLorong).sort(), Object.values(dataLorong), 'bar', '#2a9d8f');

        // 3. Grafik Transit Barat (Bar)
        renderChart('chartTBarat', Object.keys(dataTBarat).sort(), Object.values(dataTBarat), 'bar', '#e76f51');

        // 4. Grafik Transit Timur (Bar)
        renderChart('chartTTimur', Object.keys(dataTTimur).sort(), Object.values(dataTTimur), 'bar', '#264653');

        // 5. Grafik Transit Jalan (Bar)
        renderChart('chartTJalan', Object.keys(dataTJalan).sort(), Object.values(dataTJalan), 'bar', '#f4a261');

        // 6. Grafik Picker (Pie/Doughnut)
        renderChart('chartPicker', Object.keys(dataPicker), Object.values(dataPicker), 'pie');

    } catch (error) {
        console.error("Error Fetch Data:", error);
        if (loadingEl) loadingEl.innerText = "Gagal Memuat Data Sheet!";
    }
}

/**
 * Fungsi reusable untuk merender grafik menggunakan Chart.js
 * @param {string} canvasId - ID elemen canvas di HTML
 * @param {Array} labels - Array label untuk sumbu X
 * @param {Array} values - Array angka untuk sumbu Y
 * @param {string} type - Tipe chart ('bar', 'pie', 'line', dll)
 * @param {string} color - Warna utama grafik (untuk bar)
 */
function renderChart(canvasId, labels, values, type, color = '#4318ff') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Hancurkan chart lama jika sudah ada (mencegah tumpah tindih saat refresh)
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    const ctx = canvas.getContext('2d');
    
    // Palet warna untuk Pie Chart agar tiap potongan berbeda warna
    const pieColors = ['#4318ff', '#2ec4b6', '#ff9f1c', '#e71d36', '#9b5de5', '#fb5607', '#3a86ff'];

    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Qty',
                data: values,
                backgroundColor: type === 'pie' ? pieColors : color,
                borderRadius: type === 'bar' ? 8 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: type === 'pie', // Legend hanya tampil untuk Pie Chart
                    position: 'bottom'
                } 
            },
            scales: type === 'bar' ? {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            } : {}
        }
    });
}

// Jalankan fungsi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', updateDashboard);
