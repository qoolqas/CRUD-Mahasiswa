const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;
const multer = require('multer')
const cors = require('cors');
const path = require('path')
// set body parser
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));


// script upload

app.use(express.static("./public"))
//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});




// create data / insert data
app.post('/api/mahasiswa', upload.single('foto'), (req, res) => {


    const data = { ...req.body };
    const id = req.body.id;
    const title = req.body.title;
    const description = req.body.description;
    const type = req.body.type;
    const created_at = req.body.created_at;


    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO mahasiswa (id,title,description,type,created_at) values (?,?,?,?,?);';

        // jalankan query
        koneksi.query(querySql, [id, title, description,type,created_at], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }

            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto = imgsrc;
        // buat variabel penampung data dan query sql
        const data = { ...req.body };
        const querySql = 'INSERT INTO mahasiswa (id,title,description,type,created_at,foto) values (?,?,?,?,?,?);';

        // jalankan query
        koneksi.query(querySql, [id, title, description,type,created_at, foto], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }

            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    }
});




// read data / get data
app.get('/api/mahasiswa', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM mahasiswa';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/mahasiswa/:id', (req, res) => {
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM mahasiswa WHERE id = ?';
    const title = req.body.title;
    const description = req.body.description;
    const type = req.body.type;
    const created_at = req.body.created_at;

    console.log(querySearch, data)

    const queryUpdate = 'UPDATE mahasiswa SET title=?,description=?,type=?,created_at=? WHERE id = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [title,description,type,created_at, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/mahasiswa/:id', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM mahasiswa WHERE id = ?';
    const queryDelete = 'DELETE FROM mahasiswa WHERE id = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.id, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));
