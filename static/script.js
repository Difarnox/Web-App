document.addEventListener('DOMContentLoaded', function() {
    // Ambil elemen ikon menu, ikon close, navbar, dan header
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const navbar = document.getElementById('navbar');
    const header = document.querySelector('header');
    
    // Elemen form dan tabel
    const dataForm = document.getElementById('dataForm');
    const dataTable = document.getElementById('data-table');
    
    // Fungsi untuk mengatur tampilan tombol berdasarkan ukuran layar
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

    // Fungsi untuk memformat angka
    function formatNumber(num) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
        }).format(num);
    }

    // Format semua elemen dengan kelas "format-number"
    const elements = document.querySelectorAll('.format-number');
    elements.forEach(el => {
        const num = parseFloat(el.textContent);
        if (!isNaN(num)) {
            el.textContent = formatNumber(num);
        }
    });

    // Fungsi untuk menghapus teks yang diketik di form
    window.clearForm = function() {
        dataForm.reset();
    }

    // Fungsi untuk membatalkan edit dan kembali ke mode tambah data
    window.cancelEdit = function() {
        document.getElementById('dataForm').reset();
        document.getElementById('submit-button').textContent = "Tambahkan Data";
    }
    
    // Fungsi untuk menampilkan form edit dengan data yang ada
    window.editData = function(id, tahun, jumlahGerai, penambahanGerai) {
        document.getElementById('tahun').value = tahun;
        document.getElementById('jumlah_gerai').value = jumlahGerai;
        document.getElementById('penambahan_gerai').value = penambahanGerai;
        document.getElementsByName('id')[0].value = id;
        document.getElementById('submit-button').textContent = "Edit Data";
    }

    // Panggil fungsi adjustNavbar saat halaman dimuat
    adjustNavbar();

    // Panggil fungsi handleScroll saat halaman di-scroll
    handleScroll();

    // Tambahkan event listener pada ikon menu untuk menampilkan menu bar
    menuIcon.addEventListener('click', function() {
        navbar.classList.add('active');
        header.classList.add('active');
        navbar.querySelector('ul').style.display = 'flex';
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
        header.classList.remove('transparent');
    });

    // Tambahkan event listener pada ikon close untuk menyembunyikan menu bar
    closeIcon.addEventListener('click', function() {
        navbar.classList.remove('active');
        header.classList.remove('active');
        navbar.querySelector('ul').style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    });

    // Tambahkan event listener pada jendela resize untuk mengubah tampilan menu dan tombol
    window.addEventListener('resize', adjustNavbar);

    // Tambahkan event listener pada scroll untuk mengubah gaya header
    window.addEventListener('scroll', handleScroll);
});
