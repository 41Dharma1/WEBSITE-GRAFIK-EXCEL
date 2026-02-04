async function updateDashboard() {
    const loadingEl = document.getElementById('loading');
    // Gunakan format /pub?output=csv agar bisa dibaca sebagai teks
    const currentCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pub?gid=1877132307&single=true&output=csv";

    try {
        const response = await fetch(currentCsvUrl);
        const csvText = await response.text();
        
        // Memecah baris, bersihkan string kosong, dan lewati header
        const rows = csvText.split('\n').filter(row => row.trim() !== "").slice(1); 
        
        let dataJam = {}, dataLorong = {}, dataTBarat = {}, 
            dataTTimur = {}, dataTJalan = {}, dataPicker = {};
        
        let totalQtySum = 0;

        rows.forEach(row => {
            // Split kolom secara aman
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (cols.length >= 10) { 
                // Mapping Berdasarkan File CSV Anda
                const picker = cols[5]?.replace(/"/g, "").trim();
                const qty    = parseFloat(cols[6]) || 0;
                const jam    = cols[7]?.replace(/"/g, "").trim();
                const jalan  = cols[9]?.replace(/"/g, "").trim();
                const lokasi = cols[10]?.replace(/"/g, "").trim();

                // Logika Akumulasi
                if (jam) dataJam[jam] = (dataJam[jam] || 0) + qty;
                if (picker) dataPicker[picker] = (dataPicker[picker] || 0) + qty;
                if (jalan) dataTJalan[jalan] = (dataTJalan[jalan] || 0) + qty;

                // Memisahkan Lokasi untuk Lorong vs Transit (Asumsi berdasarkan prefix nama lokasi)
                if (lokasi) {
                    dataLorong[lokasi] = (dataLorong[lokasi] || 0) + qty;
                    
                    // Contoh logika pemisahan Barat/Timur (Sesuaikan jika ada kriteria spesifik)
                    if (lokasi.includes("TR-W") || lokasi.startsWith("A")) {
                        dataTBarat[lokasi] = (dataTBarat[lokasi] || 0) + qty;
                    } else {
                        dataTTimur[lokasi] = (dataTTimur[lokasi] || 0) + qty;
                    }
                }

                totalQtySum += qty;
            }
        });

        // Update UI Total
        if(document.getElementById('total-qty')) 
            document.getElementById('total-qty').innerText = totalQtySum.toLocaleString('id-ID');
        
        if (loadingEl) loadingEl.style.display = 'none';

        // Render Semua Grafik
        renderChart('chartJam', Object.keys(dataJam).sort(), Object.values(dataJam), 'bar', '#4318ff');
        renderChart('chartLorong', Object.keys(dataLorong).sort(), Object.values(dataLorong), 'bar', '#2a9d8f');
        renderChart('chartTBarat', Object.keys(dataTBarat).sort(), Object.values(dataTBarat), 'bar', '#e76f51');
        renderChart('chartTTimur', Object.keys(dataTTimur).sort(), Object.values(dataTTimur), 'bar', '#264653');
        renderChart('chartTJalan', Object.keys(dataTJalan).sort(), Object.values(dataTJalan), 'bar', '#f4a261');
        renderChart('chartPicker', Object.keys(dataPicker), Object.values(dataPicker), 'pie');

    } catch (error) {
        console.error("Error:", error);
        if (loadingEl) loadingEl.innerText = "Gagal memproses data.";
    }
}

function renderChart(canvasId, labels, values, type, color = '#4318ff') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();

    const ctx = canvas.getContext('2d');
    const pieColors = ['#4318ff', '#2ec4b6', '#ff9f1c', '#e71d36', '#9b5de5', '#fb5607', '#3a86ff'];

    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Qty',
                data: values,
                backgroundColor: type === 'pie' ? pieColors : color,
                borderRadius: type === 'bar' ? 6 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: type === 'pie', position: 'bottom' } 
            },
            scales: type === 'bar' ? {
                y: { beginAtZero: true }
            } : {}
        }
    });
}

document.addEventListener('DOMContentLoaded', updateDashboard);
