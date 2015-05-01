module.exports = function(express){

	var siteApi = express.Router();

	siteApi.get('/cadastro',function(req, res) {

		res.render('pages/cadastro',{ erros:[]});

	});

	siteApi.get('/login',function(req, res){

		res.render('pages/login');

	});

	siteApi.get('/profile',function(req, res){

		res.render('pages/profile');

	});

	return siteApi;
}