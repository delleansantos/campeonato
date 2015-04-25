module.exports = function(express, app, User, jwt){

	var apiRoutes = express.Router();

	// route to show a random message (GET http://localhost:8080/api/)
	apiRoutes.get('/', function(req, res) {
	  res.json({ message: 'Welcome to the coolest API on earth!' });
	});

	apiRoutes.post('/cadastro', function(req, res) {

		var newUser = new User({

			name: req.body.nome,
			nick: req.body.nick,
			email: req.body.email,
			password: req.body.senha

		})

		newUser.save(function(err){
			if(err){


				var msgErro = [];

				if (err.name == 'ValidationError'){

					for(x in err.errors){

						msgErro.push( err.errors[x].path + " " + err.errors[x].value + " já existe!" ); 

					}

				};

				console.log(msgErro);
				res.render('pages/index', { erros:  msgErro });

			} else {

				res.redirect('back');

			};

		})

	});

	apiRoutes.post('/authenticate', function(req, res) {

	  // find the user
	  User.findOne({
	    name: req.body.name
	  }, function(err, user) {

	    if (err) throw err;

	    if (!user) {
	      res.json({ success: false, message: 'Authentication failed. User not found.' });
	    } else if (user) {


	    user.comparePassword(req.body.password, function(err, isMatch) {
            if (err) throw err;


	          // check if password matches
		      if (!isMatch) {
		        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
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
		          success: true,
		          message: 'Enjoy your token!',
		          token: token
		        });
		      } 


        });

	    }

	  });
	});

	apiRoutes.use(function(req, res, next) {

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

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
	apiRoutes.get('/users', function(req, res) {
	  User.find({}, function(err, users) {
	    res.json(users);
	  });
	});



	return apiRoutes;
}