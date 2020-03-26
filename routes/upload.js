var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();


// default options
app.use(fileUpload());



app.put('/:tipo/:id', function(req, res) {

    var tipo = req.params.tipo;
    var id = req.params.id;




    // Tipos de colecciones validas
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            msg: "El tipo de colección no es válido"
        });
    }


    if (!req.files) {

        return res.status(400).json({
            ok: false,
            msg: "Debe subir alguna imagen"
        });

    }

    // Obtener nombre del archivo
    var archivo = req.files.img;
    var nombreCortado = archivo.name.split('.');
    var ext = nombreCortado[nombreCortado.length - 1];


    // Extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];


    if (extensionesValidas.indexOf(ext) < 0) {

        return res.status(400).json({
            ok: false,
            msg: "Extensión no válida"
        });
    }


    // Nombre de archivo
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ ext }`;


    //Mover archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {

            return res.status(500).json({
                ok: false,
                msg: "Error al mover el archivo",
                err
            });
        }

        eliminarImgVieja(tipo, id, nombreArchivo, res);
    });
});



function eliminarImgVieja(tipo, id, nombreArchivo, res) {

    var Schema;

    switch (tipo) {
        case 'usuarios':
            Schema = Usuario;
            break;
        case 'medicos':
            Schema = Medico;
            break;
        case 'hospitales':
            Schema = Hospital;
            break;
    }

    Schema.findById(id, (err, data) => {

        //Si no existe registro con ese id
        if (!data) {
            return res.status(400).json({
                ok: false,
                msg: "El objeto no existe"
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: "Error al buscar el objeto"
            });
        }

        var pathViejo = `./uploads/${tipo}/${data.img}`;

        //Si existe la imagen la elimina
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, (err) => {

                if (err) {

                    return res.status(500).json({
                        ok: false,
                        msg: "Error al borrar la imagen",
                        err
                    });
                }
            });
        }

        //Guardo el nuevo nombre de archivo
        data.img = nombreArchivo;

        data.save((err, objetoActualizado) => {

            if (tipo === 'usuarios')
                objetoActualizado.password = ':)';

            return res.status(200).json({
                ok: true,
                msg: 'Archivo subido',
                data: objetoActualizado
            });
        });
    });
}



module.exports = app;