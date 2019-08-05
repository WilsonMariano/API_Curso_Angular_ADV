var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();



//========================================================
// Busqueda por coleccion
//========================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                msg: 'Los tipos de busqueda son usuarios, medicos y hospitales'
            });
            break;
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            data
        });
    });
});


//========================================================
// Busqueda general
//========================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        })
        .catch(err => {

            res.status(400).json({
                ok: false,
                err
            });
        });
});


function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, data) => {
                if (err) reject('Error al buscar hospitales: ', err);
                else resolve(data);
            });
    });
}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, data) => {
                if (err) reject('Error al buscar medicos : ', err);
                else resolve(data);
            });
    });
}

function buscarUsuarios(regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, data) => {
                if (err) reject('Error al buscar usuarios : ', err);
                else resolve(data);
            });
    });
}

module.exports = app;