var mongoose = require('mongoose');


var hospitalSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: mongoose.SchemaTypes.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });


module.exports = mongoose.model('Hospital', hospitalSchema);