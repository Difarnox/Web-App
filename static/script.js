// Fungsi untuk membersihkan form 
function clearForm() {
    document.getElementById('tahun_prediksi').value = '';
    document.getElementById('a').value = '';
    document.getElementById('c').value = '';
    document.getElementById('m').value = '';
    document.getElementById('zo').value = '';
}

// Fungsi untuk mereset tabel hasil simulasi Monte Carlo
function resetSimulationTable() {
    const simulationTable = document.getElementById('simulation-table');
    const simulationTableBody = simulationTable.querySelector('tbody');
    simulationTableBody.innerHTML = ''; // Menghapus semua baris di dalam tabel simulasi
}

// Fungsi untuk menambahkan event listener pada tombol reset
document.getElementById('reset-button').addEventListener('click', function() {
    clearForm(); // Menghapus nilai input di form
    resetSimulationTable(); // Menghapus hasil simulasi dari tabel
});

// Fungsi untuk mengedit data
function editData(id, tahun, jumlahGerai, penambahanGerai) {
    // Mengisi form dengan data yang ada
    document.getElementById('tahun').value = tahun;
    document.getElementById('jumlah_gerai').value = jumlahGerai;
    document.getElementById('penambahan_gerai').value = penambahanGerai;

    // Menampilkan tombol update dan tombol cancel edit
    document.getElementById('update-btn').style.display = 'inline-block';
    document.getElementById('cancel-edit').style.display = 'inline-block';

    // Menyembunyikan tombol tambah data
    document.querySelector("form button[type='submit']").style.display = 'none';
    
    // Menyimpan ID untuk pengeditan
    window.editingId = id;
}

function cancelEdit() {
    // Mengembalikan ke keadaan semula
    document.getElementById('tahun').value = '';
    document.getElementById('jumlah_gerai').value = '';
    document.getElementById('penambahan_gerai').value = '';

    document.getElementById('update-btn').style.display = 'none';
    document.getElementById('cancel-edit').style.display = 'none';
    document.querySelector("form button[type='submit']").style.display = 'inline-block';

    // Menghapus ID yang disimpan
    window.editingId = null;
}

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
                // Update tabel secara dinamis
                updateTableRow(window.editingId, data.data);
                // Setelah update berhasil, sembunyikan tombol update dan tampilkan tombol submit lagi
                cancelEdit();
            } else {
                alert("Terjadi kesalahan saat memperbarui data.");
            }
        });
    }
}

// Fungsi untuk memperbarui baris tabel setelah data berhasil diperbarui
function updateTableRow(id, updatedData) {
    // Temukan baris tabel berdasarkan ID
    const row = document.querySelector(`tr[data-id='${id}']`);
    
    if (row) {
        // Update nilai-nilai di dalam tabel sesuai dengan data yang diperbarui
        row.querySelector('.tahun').textContent = updatedData.tahun;
        row.querySelector('.jumlah_gerai').textContent = updatedData.jumlah_gerai;
        row.querySelector('.penambahan_gerai').textContent = updatedData.penambahan_gerai;
    }
}

// Fungsi untuk menghapus data
function deleteData(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        window.location.href = '/delete_data/' + id;  // Gantilah URL ini sesuai dengan rute penghapusan data di server
    }
}

// Fungsi untuk memformat angka ke format ribuan
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Terapkan fungsi ke semua kolom angka di tabel
document.querySelectorAll('.table td.number').forEach(cell => {
    cell.textContent = formatNumber(cell.textContent);
});


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

// Menambahkan validasi untuk input angka positif
document.querySelector('form').addEventListener('submit', function(event) {
    const tahunInput = document.getElementById('tahun');
    const jumlahGeraiInput = document.getElementById('jumlah_gerai');
    const penambahanGeraiInput = document.getElementById('penambahan_gerai');
    
    if (tahunInput.value <= 0 || jumlahGeraiInput.value <= 0 || penambahanGeraiInput.value <= 0) {
        alert("Semua input harus berupa angka positif dan tidak boleh kosong.");
        event.preventDefault(); // Mencegah pengiriman form jika ada input yang invalid
    }
});
