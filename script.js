const csvUrl = 'https://docs.google.com/spreadsheets/d/1i_9Weeg_TxntAmTJ8nlAHAns8n8OslAG-ePWxCZvdiY/export?format=csv&gid=0';

async function updateDashboard() {
    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        
        const rows = data.split('\n').slice(1);
        const locationsMap = {};
        let totalQtySum = 0;

        rows.forEach(row => {
            const columns = row.split(',');
            if (columns.length > 5) {
                const lokasi = columns[5].trim();
                const qty = parseFloat(columns[4]) || 0;

                if (lokasi) {
                    locationsMap[lokasi] = (locationsMap[lokasi] || 0) + qty;
                    totalQtySum += qty;
                }
            }
        });

        // Update Kartu Statistik
        const sortedKeys = Object.keys(locationsMap).sort();
        document.getElementById('total-qty').innerText = totalQtySum.toLocaleString('id-ID');
        document.getElementById('total-loc').innerText = sortedKeys.length;
        document.getElementById('last-update').innerText = new Date().toLocaleTimeString('id-ID');
        document.getElementById('current-date').innerText = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const values = sortedKeys.map(key => locationsMap[key]);
        renderChart(sortedKeys, values);

    } catch (error) {
        console.error('Error:', error);
    }
}

function renderChart(labels, values) {
    const ctx = document.getElementById('mainBarChart').getContext('2d');
    
    // Gradien Warna
    const blueGradient = ctx.createLinearGradient(0, 0, 0, 400);
    blueGradient.addColorStop(0, '#0061ff');
    blueGradient.addColorStop(1, '#60efff');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantity',
                data: values,
                backgroundColor: blueGradient,
                borderRadius: 8,
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
                    grid: { drawBorder: false, color: '#f0f0f0' }
                },
                x: { 
                    grid: { display: false }
                }
            }
        }
    });
}

// Jalankan saat halaman dimuat
updateDashboard();
