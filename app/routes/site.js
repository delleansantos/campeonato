

module.exports = function(express){

	var siteApi = express.Router();

	siteApi.get('*',function (req, res) {
		res.render('pages/index');
	});

	return siteApi;
}