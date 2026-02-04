async function updateDashboard() {
    const loadingEl = document.getElementById('loading');
    const path = window.location.pathname;
    const page = path.split("/").pop() || "./index.html";
    
    // 1. KONFIGURASI HALAMAN (Sesuaikan GID & Indeks Kolom)
    const pageConfig = {
        "./index.html": { 
            gid: "1877132307", type: "bar", colLabel: 1, colQty: 10, title: "Total Qty" 
        },
        "picking_perjam.html": { 
            gid: "549934827", type: "bar", colLabel: 7  , colQty: 19, title: "Pick-in Per Jam" 
        },
        "Pick-in_perlorong.html": { 
            gid: "GID_LORONG", type: "bar", colLabel: 11, colQty: 11, title: "Pick-in Per Lorong" 
        },
        "pick-in_perpicker.html": { 
            gid: "GID_PICKER", type: "pie", colLabel: 6, colQty: 7, title: "Pick-in Per Picker" 
        },
        "pick-in_pertransit_(sisi_barat).html": { 
            gid: "GID_BARAT", type: "bar", colLabel: 10, colQty: 7, title: "Transit Barat" 
        },
        "pick-in_pertransit_(sisi_timur).html": { 
            gid: "GID_TIMUR", type: "bar", colLabel: 7, colQty: 1, title: "Transit Timur" 
        },
        "pick-in_transit_jalan.html": { 
            gid: "GID_JALAN", type: "bar", colLabel: 7, colQty: 17 title: "Transit Jalan" 
        }
    };

    const config = pageConfig[page];
    if (!config) return;

    const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pub?gid=${config.gid}&single=true&output=csv`;

    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "").slice(1); 
        
        let dataMap = {};
        let totalQtySum = 0;

        // 2. LOGIKA FOREACH YANG BISA DI-EDIT PER GRAFIK
        rows.forEach(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            // Mengambil kolom berdasarkan konfigurasi colLabel dan colQty
            let label = cols[config.colLabel]?.replace(/"/g, "").trim(); 
            let qty = parseFloat(cols[config.colQty]?.replace(/[^\d.-]/g, "")) || 0; 

            if (label) {
                // Jika ingin filter data tertentu (misal: abaikan label "Total")
                if (label.toLowerCase() !== "total") { 
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

        // Sort data (opsional: agar urutan jam/lorong rapi)
        const labels = Object.keys(dataMap);
        const values = labels.map(l => dataMap[l]);

        renderChart(labels, values, config.type, config.title);

    } catch (error) {
        console.error("Error:", error);
        if (loadingEl) loadingEl.innerText = "Gagal Memuat Data!";
    }
}

function renderChart(labels, values, type, title) {
    const canvas = document.getElementById('mainChart');
    if (!canvas) return;

    const existingChart = Chart.getChart(canvas.id);
    if (existingChart) existingChart.destroy();

    const ctx = canvas.getContext('2d');
    
    // Warna otomatis untuk Pie Chart (agar berwarna-warni seperti di gambar)
    const pieColors = ['#4318ff', '#6ad2ff', '#31c48d', '#ffb547', '#ff5b5b', '#2b3674', '#707eae'];

    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: type === 'pie' ? pieColors : '#4318ff',
                borderRadius: type === 'bar' ? 5 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: type === 'pie', position: 'bottom' },
                // Menampilkan angka di atas bar (datalabels plugin jika terpasang)
            },
            scales: type === 'bar' ? {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
            } : {}
        }
    });
}

document.addEventListener('DOMContentLoaded', updateDashboard);
