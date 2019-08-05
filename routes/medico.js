var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var Medico = require('../models/medico');

var app = express();


//========================================================
// Obtener todos los medicos
//========================================================
app.get('/', (req, res) => {

    var desde = Number(req.query.desde) || 0;

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, data) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: "Error obteniendo medicos",
                        errors: err
                    });
                }

                Medico.count({}, (err, count) => {

                    res.status(200).json({
                        ok: true,
                        data,
                        count
                    });
                });
            });
});


//========================================================
// Crear un nuevo hospital
//========================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    new Medico({
            nombre: body.nombre,
            img: body.img,
            usuario: body.usuario,
            hospital: body.hospital
        })
        .save((err, data) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error al crear medico",
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
// Actualizar medico
//========================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar medico",
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                msg: `El medico con el id ${id} no existe`,
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save((err, data) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error al editar medico",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                data
            });

        });
    });
});


//========================================================
// Borrar medico por id
//========================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, data) => {

        if (!data) {
            return res.status(400).json({
                ok: false,
                msg: `El medico con el id ${id} no existe`,
                errors: err
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al borrar medico",
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