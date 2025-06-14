const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


const upload = multer({ dest: 'uploads/' });


router.post('/reconhecer', upload.single('imagem'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ erro: 'Imagem não enviada.' });
    }

    const form = new FormData();
    form.append('imagem', fs.createReadStream(req.file.path));

    try {
        const response = await axios.post('http://localhost:5000/reconhecer', form, {
            headers: form.getHeaders()
        });

        fs.unlinkSync(req.file.path);

        return res.json(response.data);
    } catch (err) {
        console.error('Erro ao comunicar com Flask:', err.message);
        return res.status(500).json({ erro: 'Erro interno ao reconhecer rosto.' });
    }
});

module.exports = router;

