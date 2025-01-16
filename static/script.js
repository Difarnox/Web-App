// Fungsi untuk menambahkan pemisah ribuan dengan titik
function formatNumberWithDots(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Fungsi untuk menyesuaikan tampilan menu navigasi berdasarkan ukuran layar
document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const navbar = document.getElementById('navbar');
    const header = document.querySelector('header');

    // Fungsi untuk menyesuaikan tampilan navbar
    function adjustNavbar() {
        if (window.innerWidth > 768) {
            navbar.classList.remove('active');
            header.classList.remove('active');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'none';
            navbar.querySelector('ul').style.display = 'flex';
        } else {
            navbar.querySelector('ul').style.display = 'none';
            if (!navbar.classList.contains('active')) {
                menuIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            } else {
                closeIcon.style.display = 'block';
                menuIcon.style.display = 'none';
            }
        }
    }

    // Fungsi untuk menampilkan menu saat menu icon diklik
    menuIcon.addEventListener('click', function() {
        navbar.classList.add('active');
        header.classList.add('active');
        navbar.querySelector('ul').style.display = 'flex';
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        header.classList.remove('transparent');
    });

    // Fungsi untuk menutup menu saat close icon diklik
    closeIcon.addEventListener('click', function() {
        navbar.classList.remove('active');
        header.classList.remove('active');
        navbar.querySelector('ul').style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    });

    // Panggil fungsi adjustNavbar saat halaman dimuat
    adjustNavbar();

    // Panggil fungsi handleScroll saat halaman di-scroll
    window.addEventListener('resize', adjustNavbar);
});

// Fungsi untuk mereset form
document.getElementById('reset-button').addEventListener('click', function() {
    resetForm(); // Menghapus nilai input di form
});

// Fungsi untuk menghitung hasil Monte Carlo
document.getElementById('hitung-button').addEventListener('click', function() {
    // Ambil nilai dari form input
    const tahunPrediksi = parseInt(document.getElementById('tahun_prediksi').value);
    const a = parseInt(document.getElementById('a').value);
    const c = parseInt(document.getElementById('c').value);
    const m = parseInt(document.getElementById('m').value);
    const zo = parseInt(document.getElementById('zo').value);

    if (isNaN(tahunPrediksi) || isNaN(a) || isNaN(c) || isNaN(m) || isNaN(zo)) {
        alert("Semua input harus berupa angka.");
        return;
    }

    // Kirim data ke server untuk menghitung Monte Carlo
    fetch('/perhitungan_monte_carlo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'tahun_prediksi': tahunPrediksi,
            'a': a,
            'c': c,
            'm': m,
            'zo': zo
        })
    })
    .then(response => response.json())
    .then(data => {
        // Menampilkan hasil simulasi di tabel
        displaySimulationResults(data.hasil_simulasi);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Fungsi untuk menampilkan hasil perhitungan Monte Carlo
function displaySimulationResults(hasilSimulasi) {
    const tableBody = document.querySelector('.hasil-simulasi tbody');
    tableBody.innerHTML = ''; // Kosongkan tabel sebelum menambahkan data baru

    hasilSimulasi.forEach(row => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${row.tahun}</td>
            <td>${row.bilangan_acak.toFixed(4)}</td> <!-- Membulatkan bilangan acak ke 4 angka belakang koma -->
            <td>${row.penambahan_gerai}</td>
            <td>${formatNumberWithDots(row.jumlah_gerai)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Fungsi untuk clear form
function clearForm() {
    document.getElementById('tahun_prediksi').value = '';
    document.getElementById('a').value = '';
    document.getElementById('c').value = '';
    document.getElementById('m').value = '';
    document.getElementById('zo').value = '';
}

// Fungsi untuk mereset tabel hasil simulasi
function resetSimulasi() {
    // Menghapus isi tabel hasil simulasi
    const hasilSimulasiTable = document.querySelector('#hasil-simulasi-container table tbody');
    hasilSimulasiTable.innerHTML = '';

    // Menyembunyikan tabel hasil simulasi
    document.querySelector('#hasil-simulasi-container').style.display = 'none';

    // Menampilkan deskripsi hasil simulasi
    document.querySelector('#hasil-deskripsi').style.display = 'block';
}
