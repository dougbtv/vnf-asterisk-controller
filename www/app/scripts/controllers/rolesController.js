'use strict';

/**
 * @ngdoc function
 * @name vnfAsteriskControllerApp.controller:discoveryController
 * @description
 * # discoveryController
 * Controller of the vnfAsteriskControllerApp
 */

vacApp.controller('rolesController', ['$scope', '$location', '$http', '$routeParams','rolesService',function($scope,$location,$http,$routeParams,rolesService) {

  // Set some constants
  $scope.ROLES = rolesService.ROLES;
  $scope.ROLE_DESCRIPTIONS = rolesService.ROLE_DESCRIPTIONS;

  console.log("roles controller instantiated.");
  // console.log("ENV: " + env.api_url);

  rolesService.getRoutes(function(err,result){
    if (!err) {
      $scope.instances = result;
      // console.log("!trace routes result",result);
    }
  });

}]);
