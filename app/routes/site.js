

module.exports = function(express){

	var siteApi = express.Router();

	siteApi.get('/login',function (req, res) {
		res.render('pages/login');
	});

	siteApi.get('/cadastro',function (req, res) {
		res.render('pages/cadastro');
	});

	siteApi.get('/primeiro-passo',function (req, res) {
		res.render('pages/primeiro-game');
	});

	siteApi.get('*',function (req, res) {
		res.render('pages/404');
	});

	return siteApi;
}