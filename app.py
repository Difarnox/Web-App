from flask import Flask, render_template, request, redirect, url_for
import pymysql
import math

app = Flask(__name__)

# Koneksi ke database
db = pymysql.connect(
    host="localhost",
    user="root",
    password="",
    database="simulasi_monte_carlo"
)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/data_historis', methods=['GET', 'POST'])
def data_historis():
    cursor = db.cursor(pymysql.cursors.DictCursor)
    
    if request.method == 'POST':
        id_data = request.form.get('id')
        tahun = request.form['tahun']
        jumlah_gerai = request.form['jumlah_gerai']
        penambahan_gerai = request.form['penambahan_gerai']
        
        if id_data:  # Edit data
            cursor.execute(
                "UPDATE data_historis SET tahun=%s, jumlah_gerai=%s, penambahan_gerai=%s WHERE id=%s",
                (tahun, jumlah_gerai, penambahan_gerai, id_data),
            )
        else:  # Tambah data baru
            cursor.execute(
                "INSERT INTO data_historis (tahun, jumlah_gerai, penambahan_gerai) VALUES (%s, %s, %s)",
                (tahun, jumlah_gerai, penambahan_gerai),
            )
        db.commit()
        return redirect(url_for('data_historis'))
    
    cursor.execute("SELECT * FROM data_historis ORDER BY tahun ASC")
    data_historis = cursor.fetchall()
    return render_template('data_historis.html', data_historis=data_historis)

@app.route('/delete_data/<int:id>', methods=['GET'])
def delete_data(id):
    cursor = db.cursor()
    try:
        # Hapus data berdasarkan ID
        cursor.execute("DELETE FROM data_historis WHERE id = %s", (id,))
        db.commit()

        # Reset ID agar berurutan
        cursor.execute("SET @num := 0;")
        cursor.execute("UPDATE data_historis SET id = @num := (@num + 1);")
        cursor.execute("ALTER TABLE data_historis AUTO_INCREMENT = 1;")
        db.commit()
    except pymysql.MySQLError as e:
        db.rollback()  # Rollback jika terjadi error
        print(f"Error saat menghapus data: {e}")
    finally:
        cursor.close()  # Tutup cursor
    return redirect(url_for('data_historis'))

@app.route('/perhitungan_monte_carlo', methods=['GET', 'POST'])
def perhitungan_monte_carlo():
    cursor = db.cursor(pymysql.cursors.DictCursor)

    # Ambil data historis
    cursor.execute("SELECT * FROM data_historis ORDER BY tahun ASC")
    data_historis = cursor.fetchall()

    if not data_historis:
        return render_template('perhitungan_monte_carlo.html', error="Data historis tidak tersedia.")

    # Langkah 2: Hitung Probabilitas dan Probabilitas Kumulatif
    total_penambahan = sum(item['penambahan_gerai'] for item in data_historis)
    probabilitas = []
    probabilitas_kumulatif = []
    cumulative = 0

    for item in data_historis:
        prob = round(item['penambahan_gerai'] / total_penambahan, 3)  # Membulatkan probabilitas ke tiga desimal
        cumulative += prob
        probabilitas.append(prob)
        probabilitas_kumulatif.append(round(cumulative, 3))  # Membulatkan probabilitas kumulatif ke tiga desimal

    # Langkah 3: Tentukan Interval Bilangan Acak
    interval = []
    for i, prob_cum in enumerate(probabilitas_kumulatif):
        start = probabilitas_kumulatif[i-1] if i > 0 else 0
        end = prob_cum
        interval.append((start, end))

    # Simulasi Monte Carlo
    hasil_simulasi = []
    if request.method == 'POST':
        tahun_prediksi = int(request.form['tahun_prediksi'])
        a = int(request.form['a'])
        c = int(request.form['c'])
        m = int(request.form['m'])
        zo = int(request.form['zo'])
        z = zo

        jumlah_gerai_sebelumnya = data_historis[-1]['jumlah_gerai']
        for _ in range(tahun_prediksi):
            z = (a * z + c) % m
            rn = z / m
            for i, (start, end) in enumerate(interval):
                if start <= rn < end:
                    penambahan_gerai = data_historis[i]['penambahan_gerai']
                    jumlah_gerai = jumlah_gerai_sebelumnya + penambahan_gerai
                    hasil_simulasi.append({
                        "tahun": data_historis[-1]['tahun'] + len(hasil_simulasi) + 1,
                        "bilangan_acak": round(rn, 3),  # Membulatkan bilangan acak ke tiga desimal
                        "penambahan_gerai": penambahan_gerai,
                        "jumlah_gerai": jumlah_gerai
                    })
                    jumlah_gerai_sebelumnya = jumlah_gerai
                    break

    # Data untuk ditampilkan
    hasil_monte_carlo = [
        {
            "tahun": item['tahun'],
            "penambahan_gerai": item['penambahan_gerai'],
            "probabilitas": probabilitas[i],
            "probabilitas_kumulatif": probabilitas_kumulatif[i],
            "interval": f"{interval[i][0]} - {interval[i][1]}",
        }
        for i, item in enumerate(data_historis)
    ]

    return render_template(
        'perhitungan_monte_carlo.html',
        hasil_monte_carlo=hasil_monte_carlo,
        hasil_simulasi=hasil_simulasi
    )


@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run(debug=True)
