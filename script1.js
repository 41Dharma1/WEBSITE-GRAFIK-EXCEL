async function updateDashboard() {
    const loadingEl = document.getElementById('loading');
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    
    // Tentukan URL CSV berdasarkan halaman yang sedang dibuka
    let currentCsvUrl = "";

    // Link 1: gid=1877132307
    if (page === "index.html") {
        currentCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pub?gid=1877132307&single=true&output=csv";
    } 
    // Link 2: gid=549934827 (Misalnya untuk Picking Per Jam)
    else if (page === "picking_perjam.html") {
        currentCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pub?gid=549934827&single=true&output=csv";
    }

    try {
        const response = await fetch(currentCsvUrl);
        const csvText = await response.text();
        
        // Memecah baris (lewati header)
        const rows = csvText.split('\n').slice(1); 
        
        let dataMap = {};
        let totalQtySum = 0;

        rows.forEach(row => {
            // Split kolom dengan aman
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (cols.length >= 2) {
                // Asumsi: Kolom pertama (index 0) adalah Label, Kolom kedua (index 1) adalah Qty
                const label = cols[0]?.replace(/"/g, "").trim(); 
                const qty = parseFloat(cols[1]) || 0; 

                if (label && label !== "") {
                    dataMap[label] = (dataMap[label] || 0) + qty;
                    totalQtySum += qty;
                }
            }
        });

        // Update UI Stat Cards
        if(document.getElementById('total-qty')) 
            document.getElementById('total-qty').innerText = totalQtySum.toLocaleString('id-ID');
        if(document.getElementById('total-loc')) 
            document.getElementById('total-loc').innerText = Object.keys(dataMap).length;
        
        if (loadingEl) loadingEl.style.display = 'none';

        // Sort data agar rapi (misal urutan jam atau alfabet lokasi)
        const labels = Object.keys(dataMap).sort();
        const values = labels.map(l => dataMap[l]);

        // Render Grafik
        renderChart(labels, values, 'bar');

    } catch (error) {
        console.error("Error Fetch Data:", error);
        if (loadingEl) loadingEl.innerText = "Gagal Memuat Data Sheet!";
    }
}

function renderChart(labels, values, type) {
    const canvas = document.getElementById('mainBarChart');
    if (!canvas) return;

    const existingChart = Chart.getChart("mainBarChart");
    if (existingChart) existingChart.destroy();

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Quantity',
                data: values,
                backgroundColor: '#4318ff',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                x: { grid: { display: false } }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', updateDashboard);
