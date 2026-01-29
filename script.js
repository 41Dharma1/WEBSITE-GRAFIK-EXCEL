// URL Export CSV dari Google Sheets Anda
const csvUrl = 'https://docs.google.com/spreadsheets/d/1i_9Weeg_TxntAmTJ8nlAHAns8n8OslAG-ePWxCZvdiY/export?format=csv&gid=0';

async function fetchData() {
    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        
        // Memecah baris CSV (Lewati baris header pertama)
        const rows = data.split('\n').slice(1); 
        const locations = {};

        rows.forEach(row => {
            // Memisahkan kolom berdasarkan koma
            const columns = row.split(',');
            
            // Berdasarkan struktur file Anda:
            // Kolom index 4 (E) = QUANTITY
            // Kolom index 5 (F) = LOKASI TRANSIT
            if (columns.length > 5) {
                const lokasi = columns[5].trim(); 
                const quantity = parseFloat(columns[4]) || 0; 

                if (lokasi) {
                    // Penjumlahan quantity per lokasi
                    locations[lokasi] = (locations[lokasi] || 0) + quantity;
                }
            }
        });

        const labels = Object.keys(locations);
        const values = Object.values(locations);

        // Sembunyikan loading jika data berhasil dimuat
        document.getElementById('loading').style.display = 'none';
        
        renderChart(labels, values);
    } catch (error) {
        console.error('Gagal memuat data:', error);
        document.getElementById('loading').innerText = 'Gagal memuat data Periksa internet dan izin Publish to Web di Google Sheets serta refresh ulang.';
    }
}

function renderChart(labels, values) {
    const ctx = document.getElementById('canvasChart').getContext('2d');
    
    // Membuat gradien warna untuk batang grafik
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#4318ff');
    gradient.addColorStop(1, 'rgba(67, 24, 255, 0.1)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Quantity',
                data: values,
                backgroundColor: gradient,
                borderRadius: 10,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' },
                    ticks: { color: '#a3aed0' }
                },
                x: { 
                    grid: { display: false },
                    ticks: { color: '#a3aed0' }
                }
            }
        }
    });
}

// Jalankan fungsi saat halaman dimuat
fetchData();
