'use strict';

/**
 * @ngdoc function
 * @name vnfAsteriskControllerApp.controller:discoveryController
 * @description
 * # discoveryController
 * Controller of the vnfAsteriskControllerApp
 */

vacApp.controller('discoveryController', ['$scope', '$location', '$http', '$routeParams','discoveryService',function($scope,$location,$http,$routeParams,discoveryService) {

  // console.log("discovery controller instantiated.");
  // console.log("ENV: " + env.api_url);

  discoveryService.discoverAll(function(err,result){

    if (!err) {
      $scope.instances = result;
    }

  });

}]);
