var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require('../models/hospital');

var app = express();


//========================================================
// Obtener todos los hospitales
//========================================================
app.get('/', (req, res) => {

    var desde = Number(req.query.desde) || 0;

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .exec(
            (err, data) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: "Error obteniendo hospitales",
                        errors: err
                    });
                }

                Hospital.count({}, (err, count) => {

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

    new Hospital({
            nombre: body.nombre,
            img: body.img,
            usuario: body.usuario
        })
        .save((err, data) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error al crear hospital",
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
// Actualizar hospital
//========================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar hospital",
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                msg: `El hospital con el id ${id} no existe`,
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = body.usuario;

        hospital.save((err, data) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: "Error al editar hospital",
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
// Borrar hospital por id
//========================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, data) => {

        if (!data) {
            return res.status(400).json({
                ok: false,
                msg: `El hospital con el id ${id} no existe`,
                errors: err
            });
        }

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al borrar hospital",
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