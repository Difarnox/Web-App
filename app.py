import random
import json
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Fungsi untuk membaca data historis dari file JSON
def baca_data_historis():
    try:
        with open('data.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []

# Fungsi untuk perhitungan Monte Carlo
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
            "id": idx + 1,
            "tahun": item['tahun'],
            "penambahan_gerai": item['penambahan_gerai'],
            "probabilitas": f"{probabilitas:.4f}",
            "probabilitas_kumulatif": f"{probabilitas_kumulatif:.4f}",
            "interval": f"{probabilitas_kumulatif - probabilitas:.4f} - {probabilitas_kumulatif:.4f}"
        })
    
    # Simulasi Monte Carlo
    hasil_simulasi = []
    z = zo
    jumlah_gerai_sekarang = int(data_historis[-1]['jumlah_gerai'])

    for idx, tahun in enumerate(range(tahun_prediksi)):
        bilangan_acak = round(random.random(), 4)  # Membulatkan bilangan acak hingga 4 angka di belakang koma
        for data in distribusi_probabilitas:
            if float(data['interval'].split(" - ")[0]) <= bilangan_acak < float(data['interval'].split(" - ")[1]):
                penambahan_gerai = int(data['penambahan_gerai'])
                break
        z = (a * z + c) % m
        jumlah_gerai_sekarang += penambahan_gerai
        hasil_simulasi.append({
            "id": idx + 1,
            "tahun": 2025 + idx + 1,  # Memastikan tahun dimulai dari 2026
            "bilangan_acak": bilangan_acak,
            "penambahan_gerai": penambahan_gerai,
            "jumlah_gerai": jumlah_gerai_sekarang
        })

    return distribusi_probabilitas, hasil_simulasi

# Fungsi untuk format angka dengan titik pemisah ribuan
def format_number_with_dots(value):
    return '{:,.0f}'.format(value).replace(',', '.')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/Simulasi_Monte_Carlo', methods=['GET'])
def data_historis_route():
    data_historis = baca_data_historis()
    distribusi_probabilitas, _ = hitung_monte_carlo(1, 1, 1, 1, 1, data_historis)

    return render_template('Simulasi_Monte_Carlo.html',
                           data_historis=data_historis,
                           distribusi_probabilitas=distribusi_probabilitas,
                           hasil_simulasi=[],
                           format_number_with_dots=format_number_with_dots)

@app.route('/perhitungan_monte_carlo', methods=['POST'])
def perhitungan_monte_carlo():
    try:
        data_historis = baca_data_historis()
        tahun_prediksi = int(request.form['tahun_prediksi'])
        a = int(request.form['a'])
        c = int(request.form['c'])
        m = int(request.form['m'])
        zo = int(request.form['zo'])

        distribusi_probabilitas, hasil_simulasi = hitung_monte_carlo(tahun_prediksi, a, c, m, zo, data_historis)

        return render_template('Simulasi_Monte_Carlo.html',
                               data_historis=data_historis,
                               distribusi_probabilitas=distribusi_probabilitas,
                               hasil_simulasi=hasil_simulasi,
                               format_number_with_dots=format_number_with_dots)
    except Exception as e:
        print(e)
        return 'Error occurred during Monte Carlo calculation', 500

if __name__ == "__main__":
    app.run(debug=True)
