// Fungsi untuk mereset form
function resetForm() {
    document.getElementById('tahun').value = '';
    document.getElementById('jumlah_gerai').value = '';
    document.getElementById('penambahan_gerai').value = '';
}

// Fungsi untuk memformat angka dengan titik sebagai pemisah ribuan
function formatNumberWithDot(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

    // Fungsi untuk mengubah gaya header saat di-scroll
    function handleScroll() {
        if (window.scrollY > 0 && !navbar.classList.contains('active')) {
            header.classList.add('transparent');
        } else {
            header.classList.remove('transparent');
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
    handleScroll();

    // Tambahkan event listener pada jendela resize untuk mengubah tampilan menu dan tombol
    window.addEventListener('resize', adjustNavbar);

    // Tambahkan event listener pada scroll untuk mengubah gaya header
    window.addEventListener('scroll', handleScroll);
});

// Fungsi untuk memvalidasi dan mengirim form perhitungan Monte Carlo
function validateAndSubmitForm() {
    // Cek apakah ada data historis di tabel
    const dataHistorisTable = document.querySelector('table tbody');
    if (dataHistorisTable.rows.length === 0) {
        alert('Silakan tambahkan data historis terlebih dahulu.');
        return; // Tidak melanjutkan penghitungan
    }

    // Cek apakah semua input perhitungan Monte Carlo sudah diisi
    const tahunPrediksi = document.getElementById('tahun_prediksi').value;
    const a = document.getElementById('a').value;
    const c = document.getElementById('c').value;
    const m = document.getElementById('m').value;
    const zo = document.getElementById('zo').value;

    // Jika ada input yang kosong, tampilkan alert dan hentikan proses
    if (!tahunPrediksi || !a || !c || !m || !zo) {
        alert('Semua input untuk perhitungan Monte Carlo harus diisi.');
        return;
    }

    // Jika semua input valid, lanjutkan dengan submit
    document.getElementById('monte-carlo-form').submit();
    document.getElementById('hasil-deskripsi').style.display = 'none'; // Sembunyikan deskripsi jika simulasi dimulai
}

// Fungsi untuk mereset tabel hasil simulasi Monte Carlo
function resetSimulationResults() {
    const hasilContainer = document.getElementById('hasil-simulasi-container');
    hasilContainer.style.display = 'none'; // Menyembunyikan tabel
    document.getElementById('hasil-deskripsi').style.display = 'block'; // Menampilkan deskripsi kembali
}

// Fungsi untuk mereset form
document.getElementById('reset-button').addEventListener('click', function() {
    resetForm(); // Menghapus nilai input di form
    resetSimulationResults(); // Menghapus hasil simulasi dari tabel
});

// Fungsi untuk mengedit data historis
function editData(id, tahun, jumlahGerai, penambahanGerai) {
    // Mengisi form dengan data yang ada
    document.getElementById('tahun').value = tahun;
    document.getElementById('jumlah_gerai').value = jumlahGerai;
    document.getElementById('penambahan_gerai').value = penambahanGerai;

    // Ubah URL form untuk mengirimkan update ke server
    const form = document.querySelector('form');
    form.action = `/update_data/${id}`;

    // Tampilkan tombol update dan cancel edit
    document.getElementById('update-btn').style.display = 'inline-block';
    document.getElementById('cancel-edit').style.display = 'inline-block';

    // Sembunyikan tombol tambah data
    document.querySelector("form button[type='submit']").style.display = 'none';

    // Simpan ID untuk pengeditan
    window.editingId = id;
}

// Fungsi untuk membatalkan edit
function cancelEdit() {
    resetForm(); // Reset form ke keadaan semula

    // Kembalikan form action ke rute default untuk menambah data
    const form = document.querySelector('form');
    form.action = '/data_historis';

    // Menyembunyikan tombol update dan cancel edit, serta menampilkan tombol submit
    document.getElementById('update-btn').style.display = 'none';
    document.getElementById('cancel-edit').style.display = 'none';
    document.querySelector("form button[type='submit']").style.display = 'inline-block';

    // Hapus ID yang sedang diedit
    window.editingId = null;
}

// Fungsi untuk memperbarui baris tabel setelah data berhasil diperbarui
function updateTableRow(id, updatedData) {
    const row = document.querySelector(`tr[data-id='${id}']`);
    
    if (row) {
        row.querySelector('.tahun').textContent = updatedData.tahun;
        row.querySelector('.jumlah_gerai').textContent = updatedData.jumlah_gerai;
        row.querySelector('.penambahan_gerai').textContent = updatedData.penambahan_gerai;

        // Format angka dengan titik ribuan
        row.querySelectorAll('.number').forEach(function(cell) {
            var number = parseFloat(cell.textContent);
            if (!isNaN(number)) {
                cell.textContent = formatNumberWithDot(number);
            }
        });
    }
}

// Fungsi untuk memperbarui tabel distribusi probabilitas setelah data diperbarui
function updateDistributionTable(id, updatedData) {
    const row = document.querySelector(`#distribution-table tr[data-id='${id}']`);
    
    if (row) {
        row.querySelector('.penambahan_gerai').textContent = updatedData.penambahan_gerai;

        // Format angka dengan titik ribuan
        row.querySelectorAll('.number').forEach(function(cell) {
            var number = parseFloat(cell.textContent);
            if (!isNaN(number)) {
                cell.textContent = formatNumberWithDot(number);
            }
        });
    }
}

// Fungsi untuk menangani update data di server
function updateData() {
    const tahun = document.getElementById('tahun').value;
    const jumlahGerai = document.getElementById('jumlah_gerai').value;
    const penambahanGerai = document.getElementById('penambahan_gerai').value;

    if (window.editingId && tahun && jumlahGerai && penambahanGerai) {
        fetch(`/update_data/${window.editingId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tahun: tahun,
                jumlah_gerai: jumlahGerai,
                penambahan_gerai: penambahanGerai,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Perbarui baris tabel historis
                updateTableRow(window.editingId, data.data);

                // Perbarui tabel distribusi probabilitas
                updateDistributionTable(window.editingId, data.data);
                
                // Setelah data berhasil diperbarui, reset form dan sembunyikan tombol
                cancelEdit();
            } else {
                alert("Terjadi kesalahan saat memperbarui data.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memperbarui data.');
        });
    }
}
