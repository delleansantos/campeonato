'use strict';

(function($, angular) {
	
	var app = angular.module('Campeonato',['ui.router','ngStorage']);



	app.config(function($stateProvider, $urlRouterProvider,$locationProvider) {
	  //
	  // For any unmatched url, redirect to /state1
	  //
	  $urlRouterProvider.otherwise("/login");

	  // Now set up the states
	  $stateProvider
	  	.state('cadastro', {
	      url: "/cadastro",
	      templateUrl: "/views/cadastro.html",
	      controller: "cadastroController",
	      controllerAs: "cadCtrl",
	      data: {
	        requireLogin: false
	      }
	    })
	    .state('login', {
	      url: "/login",
	      templateUrl: "/views/login.html",
	      controller: "loginController",
	      controllerAs: "loginCtrl",
	      data: {
	        requireLogin: false
	      }
	    })
	   .state('inicio', {
	      url: "/inicio",
	      views: {
	      	'off-canvas':{
	      		templateUrl:  "/views/off-canvas.html"
	      	},
	      	'': {
	      		templateUrl: "/views/inicio.html",
	      		controller: 'initController',
	      		controllerAs: "initCtrl",
	      	},
	      	'menu-top@inicio': {
	      		templateUrl: "/views/menu-top.html"
	      	}
	      },
	      data: {
	        requireLogin: true
	      }
	    })
	   .state('editProfile', {
	      url: "/edit-profile",
	      views: {
	      	'off-canvas':{
	      		templateUrl:  "/views/off-canvas.html"
	      	},
	      	'': {
	      		templateUrl: "/views/edit-profile.html",
	      		controller: 'initController',
	      		controllerAs: "initCtrl",
	      	},
	      	'menu-top@editProfile': {
	      		templateUrl: "/views/menu-top.html"
	      	}
	      },
	      data: {
	        requireLogin: true
	      }
	    });

		$locationProvider.html5Mode(true);

	});


	app.run(function ($rootScope ,$localStorage, $state, $http) {

	  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
	    var requireLogin 	= toState.data.requireLogin;
	    var validToken 		= $localStorage.userToken || false;



	    if (requireLogin && validToken){

	    	$http.defaults.headers.common['x-access-token'] = validToken;

	    } else {

	    	if (requireLogin) {

	    		if (!validToken) {

	    			
	    			$state.go('login');
	    			event.preventDefault();
	    		};


	    	};

	    };

	  });

	});

	
	app.factory('loginService',['$http','$localStorage', '$location', '$state', function($http,$localStorage,$location,$state){
		var api = { loginUrl: '/api/authenticate' };


		return {

			logar: function(data, success, error){
				$http.post(api.loginUrl, data).success(function(data){

					if (!data.erro){

						$localStorage.userToken = data.token;
						$http.defaults.headers.common['x-access-token'] = $localStorage.userToken;

					};

					success(data);

				}).error(error);
			},

			deslogar: function(){

				$localStorage.$reset();

			}


		}

	}]);


	app.controller('cadastroController',['$http','$state', function($http,$state){

		this.user = {};

		this.cadastrar = function(){

			$http.post('/api/cadastro',this.user).success(function(data){

				if (data.erro){

				} else {

					$state.go('login');

				};

			})

		}

	}])

	app.controller('loginController',['loginService', '$state', function(loginService,$state){

		var ctrl = this;

		this.user = { };
		this.erros = [];

		this.logar = function(){

			loginService.logar(this.user,function(data){
				if (!data.erro){

					$state.go('inicio');

				} else {

					ctrl.erros = [];
					ctrl.erros.push(data.msg);

				};


			});

		}


	}]);

	app.controller('initController',['loginService','$http', '$state', function(loginService,$http,$state){

		var ctrl = this;

		this.user = {};
		this.heros = [];

		this.deslogar = function(){

			loginService.deslogar();
			$state.go('login');

		}

		$http.get('/api/user').success(function(data){

			if (!data.erro){

				ctrl.user = data;


			} else {

				//VER O LANCE DE EXCLUIR O CARA MAS ELE CONTINUAR COM O TOKEN!

			};

		});

		//LeagueComponente

		ctrl.league = {

			api: {
				key: '87f3bc92-3118-43de-97ee-9ea3c1007b7d',
				url: {

					getChamp: '/api/champs',
					getSummoner: '/api/summoner/',
					heroImgPath: 'http://ddragon.leagueoflegends.com/cdn/5.2.1/img/champion/'
				}

			},

			heros: [],
			rotas: [ 'Top', 'Mid', 'Jungle', 'Bot' ],
			getSummonerInfo: function(){

				$http.get(ctrl.league.api.url.getSummoner + ctrl.league.summonerName ).success(function(data){

					console.log(data);

					ctrl.league.summoner = data;
					//ctrl.league.summoner[ctrl.league.summonerName.toLowerCase()].id;


				});


			}

		};

		$http.get(ctrl.league.api.url.getChamp).success(function(data){

			ctrl.heros = data;

		});

		this.salvarRota = function(){

			if (!this.user.rotas){

				this.user.rotas = [];

			};

			this.user.rotas.push({ hero: this.league.summonerHero.name, rota: this.league.summonerLane });

		}

		this.getHeroSrc = function(nome){

				var retorno;

				angular.forEach(ctrl.heros.data,function(hero){

					if (hero.name == nome){

						retorno = ctrl.league.api.url.heroImgPath + hero.image.full;
					};
		
				})

				return retorno;

			}

	    $('#menu-offcanvas-button').click(function(){
			$('.left.sidebar').sidebar('toggle');
		});


	}]);

}(jQuery, angular))