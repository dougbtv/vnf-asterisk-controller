/* global vacApp  */
vacApp.directive('navbar', function(){

  return {
    restrict: 'E',
    scope: {
      loggedin: '=loggedin',
    },
    templateUrl: 'views/navbar.html',
    controller: ['$scope','$http','$attrs','$location', function ($scope,$http,$attrs,$location) {

      $scope.messages = [];
      
      $scope.navClass = function (page) {
  
        // Get the route.
        var currentRoute = $location.path().substring(1) || 'home';

        // Set the onPage if it's wrong.
        if (currentRoute !== $scope.onPage) {
          $scope.onPage = currentRoute;
        }

        
        return page === currentRoute ? 'active' : '';
      };

      $scope.secondsAgo = function(indate) {

        return moment(indate).fromNow();

      };

      
    }],
  };

});