// // Gantilah URL ini dengan URL CSV dari Google Sheets Anda
// // Cara: File > Share > Publish to Web > Pilih Sheet > Pilih CSV > Publish
// const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjmjtHeut2HUwGNNG3yQ9V4q9o4Vjv77SJOGWEoZTY_zeo4kTJyVzhVhMIi--R2ZfllhxatcKYDpTQ/pubhtml?gid=826802225&single=true';

// async function updateDashboard() {
//     const loadingElement = document.getElementById('loading');
    
//     try {
//         const response = await fetch(spreadsheetUrl);
//         const dataText = await response.text();
        
//         // Mengubah CSV menjadi Array
//         const rows = dataText.split('\n').map(row => row.split(','));
        
//         // Asumsi data: Kolom A = Label/Nama, Kolom B = Quantity
//         // Lewati baris pertama (header) dengan slice(1)
//         const labels = [];
//         const values = [];
//         let totalQty = 0;

//         rows.slice(1).forEach(row => {
//             if (row[0] && row[1]) {
//                 labels.push(row[0].trim());
//                 const qty = parseFloat(row[1]) || 0;
//                 values.push(qty);
//                 totalQty += qty;
//             }
//         });

//         // 1. Update Stat Cards di HTML
//         document.getElementById('total-qty').innerText = totalQty.toLocaleString('id-ID');
//         document.getElementById('total-loc').innerText = labels.length;

//         // 2. Render Grafik
//         renderChart(labels, values);

//         // 3. Update Status
//         loadingElement.innerText = "LIVE (TERKONEKSI)";
//         loadingElement.className = "badge-live"; // Tambahkan CSS hijau jika ada
        
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         loadingElement.innerText = "GAGAL SINKRONISASI";
//         loadingElement.style.backgroundColor = "red";
//     }
// }

// let myChart; // Variabel untuk menyimpan instance chart agar tidak tumpang tindih

// function renderChart(labels, data) {
//     const ctx = document.getElementById('mainBarChart').getContext('2d');
    
//     // Jika chart sudah ada, hapus dulu sebelum buat baru (agar tidak bug saat hover)
//     if (myChart) {
//         myChart.destroy();
//     }

//     myChart = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Quantity Unloading',
//                 data: data,
//                 backgroundColor: 'rgba(52, 152, 219, 0.8)',
//                 borderColor: 'rgba(41, 128, 185, 1)',
//                 borderWidth: 1
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 y: { beginAtZero: true }
//             }
//         }
//     });
// }

// // Jalankan fungsi saat halaman dibuka
// updateDashboard();

// // Otomatis refresh setiap 5 menit
// setInterval(updateDashboard, 300000);