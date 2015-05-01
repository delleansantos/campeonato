var mongoose            = require('mongoose');
var uniqueValidator     = require('mongoose-unique-validator');
var Schema              = mongoose.Schema;

var bcrypt 				= require('bcrypt'),
    SALT_WORK_FACTOR 	= 10;

var UsuarioSchema = new Schema({ 

    name: { type: String, required: true  },
    nick: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: '' },
    rotas: [{posicao: { type: String, required: true  }, heros: [String]}],
    grupos: [{ nome: { type: String, required: true  }, adm: Boolean  }],
    password: { type: String, required: true }, 
    criadoEm: { type: Date, default: Date.now },
    lastToken: { type: String, default: ''},
    emailToken: { type: String, default: ''}

});

UsuarioSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UsuarioSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UsuarioSchema.plugin(uniqueValidator);

module.exports = mongoose.model('usuario', UsuarioSchema);;