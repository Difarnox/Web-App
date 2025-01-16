import random
from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)

# Variabel global untuk menyimpan data historis selama sesi aplikasi
data_historis = []
hasil_simulasi = []

# Fungsi untuk perhitungan Monte Carlo
def hitung_monte_carlo(tahun_prediksi, a, c, m, zo, data_historis):
    if not data_historis:
        return [], []

    # Menyusun distribusi probabilitas
    total_gerai = sum([int(item['penambahan_gerai']) for item in data_historis])
    distribusi_probabilitas = []
    probabilitas_kumulatif = 0

    for idx, item in enumerate(data_historis):
        probabilitas = int(item['penambahan_gerai']) / total_gerai
        probabilitas_kumulatif += probabilitas
        distribusi_probabilitas.append({
            "id": idx + 1,  # Menambahkan ID berdasarkan urutan
            "tahun": item['tahun'],
            "penambahan_gerai": item['penambahan_gerai'],
            "probabilitas": f"{probabilitas:.4f}",
            "probabilitas_kumulatif": f"{probabilitas_kumulatif:.4f}",
            "interval": f"{probabilitas_kumulatif - probabilitas:.4f} - {probabilitas_kumulatif:.4f}"
        })
    
    # Simulasi Monte Carlo
    hasil_simulasi = []  # Tidak perlu menggunakan variabel global
    z = zo
    jumlah_gerai_sekarang = int(data_historis[-1]['jumlah_gerai'])

    for idx, tahun in enumerate(range(tahun_prediksi)):
        bilangan_acak = random.random()
        for data in distribusi_probabilitas:
            if float(data['interval'].split(" - ")[0]) <= bilangan_acak < float(data['interval'].split(" - ")[1]):
                penambahan_gerai = int(data['penambahan_gerai'])
                break
        z = (a * z + c) % m
        jumlah_gerai_sekarang += penambahan_gerai
        hasil_simulasi.append({
            "id": idx + 1,  # Menambahkan ID berdasarkan urutan simulasi
            "tahun": tahun + 2025,
            "bilangan_acak": bilangan_acak,
            "penambahan_gerai": penambahan_gerai,
            "jumlah_gerai": jumlah_gerai_sekarang
        })

    return distribusi_probabilitas, hasil_simulasi

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/data_historis', methods=['GET', 'POST'])
def data_historis_route():
    distribusi_probabilitas = []
    
    if request.method == 'POST':
        tahun = int(request.form['tahun'])
        jumlah_gerai = int(request.form['jumlah_gerai'])
        penambahan_gerai = int(request.form['penambahan_gerai'])
        new_data = {
            'id': len(data_historis) + 1,
            'tahun': tahun,
            'jumlah_gerai': jumlah_gerai,
            'penambahan_gerai': penambahan_gerai
        }
        data_historis.append(new_data)

        # Hitung distribusi probabilitas dan simpan hasilnya
        distribusi_probabilitas, _ = hitung_monte_carlo(1, 1, 1, 1, 1, data_historis)

        return redirect(url_for('data_historis_route'))

    distribusi_probabilitas, _ = hitung_monte_carlo(1, 1, 1, 1, 1, data_historis)

    return render_template('data_historis.html', 
                           data_historis=data_historis, 
                           distribusi_probabilitas=distribusi_probabilitas, 
                           hasil_simulasi=[])

@app.route('/perhitungan_monte_carlo', methods=['POST'])
def perhitungan_monte_carlo():
    # Ambil data dari form input
    tahun_prediksi = int(request.form['tahun_prediksi'])
    a = int(request.form['a'])
    c = int(request.form['c'])
    m = int(request.form['m'])
    zo = int(request.form['zo'])

    # Hitung distribusi probabilitas dan hasil simulasi
    distribusi_probabilitas, hasil_simulasi = hitung_monte_carlo(tahun_prediksi, a, c, m, zo, data_historis)

    # Kirimkan data ke template
    return render_template('data_historis.html',
                           data_historis=data_historis, 
                           distribusi_probabilitas=distribusi_probabilitas, 
                           hasil_simulasi=hasil_simulasi)

@app.route('/update_data/<int:id>', methods=['POST'])
def update_data(id):
    data = request.get_json()

    tahun = data.get('tahun')
    jumlah_gerai = data.get('jumlah_gerai')
    penambahan_gerai = data.get('penambahan_gerai')

    if not (tahun and jumlah_gerai and penambahan_gerai):
        return jsonify({"error": "Data tidak valid"}), 400

    for item in data_historis:
        if item['id'] == id:
            item['tahun'] = tahun
            item['jumlah_gerai'] = jumlah_gerai
            item['penambahan_gerai'] = penambahan_gerai
            return jsonify({
                "message": "Data berhasil diperbarui",
                "data": item
            })

    return jsonify({"error": "Data tidak ditemukan"}), 404

@app.route('/delete_data/<int:id>', methods=['POST'])
def delete_data(id):
    global data_historis
    data_historis = [item for item in data_historis if item['id'] != id]
    return redirect(url_for('data_historis_route'))

if __name__ == "__main__":
    app.run(debug=True)