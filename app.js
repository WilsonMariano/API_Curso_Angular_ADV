// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoute = require('./routes/usuario');
var loginRoute = require('./routes/login');
var hospitalRoute = require('./routes/hospital');
var medicoRoute = require('./routes/medico');
var busquedaRoute = require('./routes/busqueda');
var uploadRoute = require('./routes/upload');
var imageRoute = require('./routes/imagenes');


// Inicializar variables
var app = express();


// Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())




// Conexión a la DB
var options = { useNewUrlParser: true };
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', options, (err, res) => {

    if (err) throw err;
    else console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');


});


// Rutas
app.use('/', appRoutes);
app.use('/usuario', usuarioRoute);
app.use('/login', loginRoute);
app.use('/hospital', hospitalRoute);
app.use('/medico', medicoRoute);
app.use('/busqueda', busquedaRoute);
app.use('/upload', uploadRoute);
app.use('/img', imageRoute);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});