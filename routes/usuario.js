var express = require('express');
var bcrypt = require('bcrypt');

var mdAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');

var app = express();




//========================================================
// Obtener todos los usuarios
//========================================================
app.get('/', (req, res, next) => {

    var desde = Number(req.query.desde) || 0;

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, data) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: "Error obteniendo usuarios",
                        errors: err
                    });
                }

                Usuario.count({}, (err, count) => {

                    res.status(200).json({
                        ok: true,
                        data,
                        count
                    });
                });
            });
});


//========================================================
// Crear un nuevo usuario
//========================================================
app.post('/', (req, res) => {

    var body = req.body;

    new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            img: body.img,
            role: body.role
        })
        .save((err, data) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error al crear usuario",
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                data
            });
        })
});


//========================================================
// Actualizar usuario
//========================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar usuario",
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: `El usuario con el id ${id} no existe`,
                errors: err
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, data) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error al editar usuario",
                    errors: err
                });
            }

            data.password = ':)'

            res.status(200).json({
                ok: true,
                data
            });

        });
    });
});


//========================================================
// Borrar usuario por id
//========================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, data) => {

        if (!data) {
            return res.status(400).json({
                ok: false,
                msg: `El usuario con el id ${id} no existe`,
                errors: err
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al borrar usuario",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            data
        });

    });
});




module.exports = app;