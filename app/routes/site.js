module.exports = function(express){

	var siteApi = express.Router();

	siteApi.get('/cadastro',function(req, res) {

		res.render('pages/index',{ erros:[]});

	});

	siteApi.get('/login',function(req, res){

		res.render('pages/login');

	});

	return siteApi;
}