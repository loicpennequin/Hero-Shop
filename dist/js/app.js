angular.module('shop', ['ui.router', 'ngAnimate', 'ngMessages'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
      .state('home', {
        url: "/",
        component: 'home'
      })
      .state('heroes', {
        url: '/heroes',
        component: 'category',
        resolve: {
          message: function() {
            return "Welcome to the Heroes section";
          },
          name : ()=>"Heroes",
          articles : function(ArticlesService) {
            return ArticlesService.heroes()
          }
        }
      })
      .state('items', {
        url: '/items',
        component: 'category',
        resolve: {
          message: function() {
            return "Welcome to the Items section";
          },
          name : ()=>"Items",
          articles : function(ArticlesService) {
            return ArticlesService.items()
          }
        }
      })
      .state('cart', {
        url: "/cart",
        component: 'cart'
      })
      .state('profile', {
        url: "/profile",
        component: 'profile'
      })
    }
  );

angular.module('shop')
  .service('ArticlesService', function($http) {
    return {
      heroes: function() {
        return $http.get('dist/data/articles.json').then((response)=>response.data.heroes)
      },
      items: function() {
        return $http.get('dist/data/articles.json').then((response)=>response.data.items)
      }
    };
  });

angular.module('shop')
  .service('UserService', function() {
    this.user;
    return {
      getUser : ()=>this.user,
      setUser : (data)=>{
          this.user = data;
          return this.user
      },
      addToCart : (item)=>{
        if(this.user.cart.indexOf(item) === -1){
          this.user.cart.push(item);
          return this.user;
        }
      },
      removeArticle : (item)=>{
        let index = this.user.cart.findIndex((i)=>i.name === item.name);
        this.user.cart.splice(index, 1);
        return this.user;
      },
      buy : ()=>{
        this.user.cart.forEach((article)=>{
          this.user.inventory.push(article);
          this.user.gold -= article.price;
        })
        this.user.cart = [];
        return this.user;
      }
    };
  });

angular.module('shop')
  .component('cart', {
    templateUrl: 'views/components/cart/cart.html',
    controller: CartController,
    controllerAs : 'cart'
  });

  function CartController(UserService, $location) {
    let vm = this;
    vm.message = 'Welcome to your cart !';
    vm.user;
    vm.purchaseSuccess = false;

    vm.$onInit = function(){
      vm.user = UserService.getUser();
      if(!vm.user){
        $location.path('/');
      }
    }

    vm.buy = function(){
      vm.user = UserService.buy();
      vm.purchaseSuccess = true;
    }

    vm.removeArticle = function(article){
      vm.user = UserService.removeArticle(article);
    }

    vm.getTotal = function(){
      if(vm.user){
        let total = 0;
        vm.user.cart.forEach((article)=>{
          total += parseInt(article.price)
        });
        return total
      }
    }

    vm.remainingGold = function(){
      return parseInt(vm.user.gold) - parseInt(vm.getTotal())
    }
  }

angular.module('shop')
  .component('home', {
    templateUrl: 'views/components/home/home.html',
    controller: HomeController,
    controllerAs : 'home'
  });

  function HomeController(UserService) {
    let vm = this;
    vm.message = 'Welcome to the Hero Shop !';
    vm.user;

    vm.$onInit = activate;

    function activate() {
      vm.user = UserService.getUser();
    }
  }

angular.module('shop')
  .component('message', {
    bindings: {
      from: '<',
      msg: '<'
    },
    templateUrl: 'views/components/message/message.html',
    controller: MessageController,
    controllerAs : 'message'
  });

  function MessageController() {
    let vm = this;
  }

angular.module('shop')
  .component('category', {
    templateUrl: 'views/components/category/category.html',
    bindings: {
      message: '<',
      name: '<',
      articles: '<'
    },
    controller: CategoryController,
    controllerAs : 'category'
  });

  function CategoryController(UserService) {
    let vm = this;
    vm.user = {};

    vm.$onInit = function(){
      vm.user = UserService.getUser();

      vm.articleOrder = 'name';
    };

    vm.hasLoggedIn = function(){
      vm.user = UserService.getUser();
    }

    vm.addToCart = function(item){
      vm.user = UserService.addToCart(item);
    }

    vm.userHasArticle = function(a){
      if(vm.user){
        return (vm.user.cart.findIndex((item)=>item.name === a.name) !== -1 ||
                vm.user.inventory.findIndex((item)=>item.name === a.name) !== -1 )
      }
    }

  }

angular.module('shop')
  .component('navbar', {
    bindings: {
      loggedIn: '<',
      user: '<',
      hasLoggedIn: '&'
    },
    templateUrl: 'views/components/navbar/navbar.html',
    controller: NavbarController,
    controllerAs : 'navbar'
  });

  function NavbarController(UserService, $location) {
    let vm = this;
    vm.displayLogin;
    vm.credentials = {};

    vm.$onInit = activate;

    vm.toggleLogin = function(){
      vm.displayLogin = !vm.displayLogin;
    }

    vm.signIn = function(cred){
      this.user = UserService.setUser({
        username : cred.username,
        gold : 10000,
        cart : [],
        inventory : []
      })
      vm.hasLoggedIn();
      $location.path('/profile')
    }

    function activate() {
      vm.displayLogin = false;
      vm.showWarning = false;
    }
  }

angular.module('shop')
  .component('profile', {
    templateUrl: 'views/components/profile/profile.html',
    controller: ProfileController,
    controllerAs : 'profile'
  });

  function ProfileController(UserService, $location) {
    let vm = this;
    vm.message;
    vm.user;
    vm.activeTab = 'account'

    vm.$onInit = function() {
      vm.user = UserService.getUser();
      if(!vm.user){
        $location.path('/');
      }else{
        vm.message = `Welcome to your profile, ${vm.user.username} !`;
      }
    }

    vm.setActiveTab = function(tab){
      vm.activeTab = tab;
      console.log(vm.activeTab);
    }
  }
