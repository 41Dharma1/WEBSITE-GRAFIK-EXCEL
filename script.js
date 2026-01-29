// Gunakan ID yang benar dari Google Sheets Anda
const sheetId = '1i_9Weeg_TxntAmTJ8nlAHAns8n8OslAG-ePWxCZvdiY';
const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pubhtml?gid=0&single=true`;

async function updateDashboard() {
    const loadingEl = document.getElementById('loading');
    const totalQtyEl = document.getElementById('total-qty');
    const totalLocEl = document.getElementById('total-loc');

    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Gagal akses spreadsheet');
        
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

        // Update elemen teks jika elemen ditemukan (mencegah error null)
        if (totalQtyEl) totalQtyEl.innerText = totalQtySum.toLocaleString('id-ID');
        if (totalLocEl) totalLocEl.innerText = Object.keys(locationsMap).length;
        if (loadingEl) loadingEl.style.display = 'none';

        const sortedKeys = Object.keys(locationsMap).sort();
        const values = sortedKeys.map(key => locationsMap[key]);
        renderChart(sortedKeys, values);

    } catch (error) {
        console.error('Error:', error);
        if (loadingEl) {
            loadingEl.innerText = 'Gagal memuat data!';
            loadingEl.style.backgroundColor = '#ff4d4d';
        }
    }
}

function renderChart(labels, values) {
    const canvas = document.getElementById('mainBarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantity',
                data: values,
                backgroundColor: '#0061ff',
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// Menunggu DOM selesai dimuat sebelum menjalankan script
document.addEventListener('DOMContentLoaded', updateDashboard);
