module.exports = function(express){

	var siteApi = express.Router();

	siteApi.get('/login',function(req, res) {

		res.render('pages/index',{ erros:[]});

	});

	return siteApi;
}