var express = require('express');
var fileUpload = require('express-fileupload');

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

        res.status(200).json({
            ok: true,
            msg: 'Archivo subido'
        });
    });
});



module.exports = app;