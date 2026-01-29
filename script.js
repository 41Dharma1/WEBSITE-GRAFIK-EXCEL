const sheetId = '1i_9Weeg_TxntAmTJ8nlAHAns8n8OslAG-ePWxCZvdiY';
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

async function updateDashboard() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const loadingEl = document.getElementById('loading');

    try {
        const response = await fetch(csvUrl);
        const data = await response.text();
        const rows = data.split('\n').slice(1);
        
        let locationsMap = {};
        let totalQtySum = 0;

        rows.forEach(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (cols.length < 6) return;

            const alat = cols[2]?.replace(/"/g, "").trim();      // Kolom C: Jenis Alat
            const picker = cols[3]?.replace(/"/g, "").trim();    // Kolom D: Picker
            const qty = parseFloat(cols[4]) || 0;                // Kolom E: Qty
            const lokasi = cols[5]?.replace(/"/g, "").trim();    // Kolom F: Lokasi Transit
            const jam = cols[1]?.split(" ")[1]?.split(":")[0];   // Kolom B: Jam (ambil jamnya saja)

            let include = false;
            let key = lokasi;

            // Logika Filter Per Halaman
            if (page === "index.html" && alat === "PALLET MOVER") include = true;
            
            if (page === "picking_perjam.html" && alat === "PALLET MOVER") {
                include = true; key = jam + ":00";
            }
            
            if (page === "Pick-in_perlorong.html" && alat === "PALLET MOVER") {
                // Asumsi nama lokasi mengandung info lorong (misal: L01, L02)
                include = true; 
            }

            if (page === "pick-in_pertransit_(sisi_timur).html" && lokasi.toLowerCase().includes("timur")) include = true;
            if (page === "pick-in_pertransit_(sisi_barat).html" && lokasi.toLowerCase().includes("barat")) include = true;
            if (page === "pick-in_transit_jalan.html" && lokasi.toLowerCase().includes("jalan")) include = true;
            
            if (page === "pick-in_perpicker.html" && alat === "PALLET MOVER") {
                include = true; key = picker;
            }

            if (include) {
                locationsMap[key] = (locationsMap[key] || 0) + qty;
                totalQtySum += qty;
            }
        });

        document.getElementById('total-qty').innerText = totalQtySum.toLocaleString('id-ID');
        document.getElementById('total-loc').innerText = Object.keys(locationsMap).length;
        if (loadingEl) loadingEl.style.display = 'none';

        const labels = Object.keys(locationsMap).sort();
        const values = labels.map(k => locationsMap[k]);

        // Tentukan Tipe Grafik
        const chartType = (page === "pick-in_perpicker.html") ? 'pie' : 'bar';
        renderChart(labels, values, chartType);

    } catch (error) {
        console.error(error);
        if (loadingEl) loadingEl.innerText = "Gagal Memuat!";
    }
}

function renderChart(labels, values, type) {
    const ctx = document.getElementById('mainBarChart').getContext('2d');
    const chartExist = Chart.getChart("mainBarChart");
    if (chartExist) chartExist.destroy();

    new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Qty',
                data: values,
                backgroundColor: type === 'pie' ? 
                    ['#4318ff', '#6ad2ff', '#31e1ad', '#ffb547', '#ff5b5b'] : '#4318ff',
                borderRadius: type === 'bar' ? 10 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: type === 'pie' } }
        }
    });
}

document.addEventListener('DOMContentLoaded', updateDashboard);
