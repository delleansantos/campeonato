var Irelia = require('irelia');
var irelia = new Irelia({
    secure: true,
    host: 'br.api.pvp.net',
    path: '/api/lol/',
    key: '87f3bc92-3118-43de-97ee-9ea3c1007b7d',
    debug: true
});

module.exports = function(express, app, User, jwt){

	var apiRoutes = express.Router();

	// route to show a random message (GET http://localhost:8080/api/)
	apiRoutes.get('/', function(req, res) {
	  res.json({ msg: 'Api rolando 100%!' });
	});

	apiRoutes.post('/cadastro', function(req, res) {

		var newUser = new User({

			name: req.body.nome,
			nick: req.body.nick,
			email: req.body.email,
			password: req.body.password

		})

		newUser.save(function(err){
			if(err){


				var msgErro = [];

				console.log(err);

				if (err.name == 'ValidationError'){

					for(x in err.errors){

						
						//ValidatorError
						msgErro.push( err.errors[x].path + " " + err.errors[x].value + " já existe!" ); 

					}

				};

				console.log(msgErro);
				res.json({  msg: msgErro, erro: true });

			} else {

				res.json({ msg: 'Cadastro realizado com sucesso!', erro: false });
			};

		})

	});

	apiRoutes.post('/authenticate', function(req, res) {


	console.log(req.body);

	var email 	= req.body.email;
	var password = req.body.password;


		if (email && password){


			// find the user
			  User.findOne({
			    email: email
			  }, function(err, user) { 

			    if (err) throw err;

			    if (!user) {
			      res.json({ erro: true, msg: 'Authentication failed. User not found.' });
			    } else if (user) {


			    user.comparePassword(password, function(err, isMatch) {
		            if (err) throw err;


			          // check if password matches
				      if (!isMatch) {
				        res.json({ erro: true, msg: 'Authentication failed. Wrong password.' });
				      } else {

				        // if user is found and password is right
				        // create a token
				        var token = jwt.sign({

				        	name : user.name,
				        	userAgent: req.headers['user-agent']

				        }, app.get('superSecret'), {
				          expiresInMinutes: 1440 // expires in 24 hours
				        });

				        //SALVA O TOKEN NO BANCO
				        user.lastToken = token;
				        user.save(function(err) {
		    				if (err) throw err;

						})

				        // return the information including token as JSON
				        res.json({
				          erro: false,
				          msg: 'Autenticação realizada com sucesso!',
				          token: token
				        });

				      } 


		        });

			    }

			  });


		} else {

			res.json({ erro: true, msg: 'authenticate Fail' });

		};

	 

	});

	apiRoutes.use(function(req, res, next) {

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.params.token ||req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
	      if (err)
	        return res.json({ success: false, message: 'Failed to authenticate token.' });    
	      else
	        // if everything is good, save to request for use in other routes

	    	if (decoded.userAgent === req.headers['user-agent']){

	    		//VERIFICA SE O TOKEN É O IGUAL AO
		    	 User.findOne({ name: decoded.name }, function(err, user) {

		    	 	if (err) throw err;


		    	 	if (user){

		    	 		if (user.lastToken === token) {

		    	 			req.decoded = decoded;

		    	 			next();

		    	 		} else {


		    	 			return res.json({ success: false, message: 'Failed to authenticate token. Token zuado!' });

		    	 		};

		    	 	} else {

		    	 		return res.json({ erro: true, msg: 'Usuário não encontrado!' });

		    	 	};


		    	 });  


	    	} else {

	    		return res.json({ success: false, message: 'Failed to authenticate token. UA-ERRO-CODE: 01' });

	    	};

	    });

	  } else {

	    // if there is no token
	    // return an error
	    return res.json({ success: false, message: 'No token provided.' });
	    
	  }

	});


	// route to return all users (GET http://localhost:8080/api/users)
	apiRoutes.get('/user', function(req, res) {
	 	User.findOne({ name: req.decoded.name }, function(err, user) {
	 			if (err) throw err;

	 		res.json(user);
	 	});
	});

	apiRoutes.get('/summoner/:name', function(req, res) {
	  	
		irelia.getSummonerByName('br', req.params.name, function (err, data){
		    
		    if (err) throw err;

		    res.json(data);

		});

	});

	apiRoutes.get('/champs', function(req, res) {
	  	
		irelia.getChampionsData('5.2.1', 'pt_BR',function (err, data){
		    
		    if (err) throw err;

		    res.json(data);

		});

	});



	return apiRoutes;
}