'use strict';

/**
 * @ngdoc function
 * @name vnfAsteriskControllerApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the vnfAsteriskControllerApp
 */

vacApp.controller('AboutCtrl', ['$scope', '$location', '$http', '$routeParams', function($scope,$location,$http,$routeParams) {

    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.foo = "bar!!!";

    console.log("about controller");
}]);
