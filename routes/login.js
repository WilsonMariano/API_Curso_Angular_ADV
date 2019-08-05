var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

var app = express();


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, data) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar usuario",
                errors: err
            });
        }

        if (!data) {
            return res.status(400).json({
                ok: false,
                msg: "Credenciales incorrectas - email",
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, data.password)) {
            return res.status(400).json({
                ok: false,
                msg: "Credenciales incorrectas - password",
                errors: err
            });
        }

        // Crear un token
        data.password = ':)';
        var token = jwt.sign({ usuario: data }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            data,
            token,
            id: data._id
        });
    });

});



module.exports = app;