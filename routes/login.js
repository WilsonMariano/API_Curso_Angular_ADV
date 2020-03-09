var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

var app = express();

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


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


// Google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        imagen: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                msj: 'Token inválido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar usuario",
                errors: err
            });
        }

        if (usuarioDB) {

            if (!usuarioDB.google) {

                return res.status(400).json({
                    ok: false,
                    msg: "Debe de usar su autentificación normal"
                });

            } else {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id
                });

            }

        } else {

            // El usuario no existe
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.imagen;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        msg: "Error al buscar usuario",
                        errors: err
                    });

                }

                if (usuarioDB) {

                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token,
                        id: usuarioDB._id
                    });
                }
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     msg: 'ok',
    //     googleUser: googleUser
    // });
});



module.exports = app;