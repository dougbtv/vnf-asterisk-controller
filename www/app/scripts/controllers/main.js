'use strict';

/**
 * @ngdoc function
 * @name vnfAsteriskControllerApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the vnfAsteriskControllerApp
 */


vacApp.controller('MainCtrl', ['$scope', '$location', '$http', '$routeParams', function($scope,$location,$http,$routeParams) {

  console.log($location.path());

  this.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];

  console.log("main controller");
  
}]);
