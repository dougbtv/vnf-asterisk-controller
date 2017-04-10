vacApp.service('rolesService', function($http){

  // our enum roles, constant.
  this.ROLES = ['tandem','playback'];

  this.ROLE_DESCRIPTIONS = {
    'tandem': "Tandem",
    'playback': "Playback",
  };

  // to get the routes from the api

  this.getRoutes = function(callback) {

    // Ok, run discover all.
    $http.get(env.api_url + '/get_routing')
      .then(function(data){

        // console.log("discoverAll data",data);
        callback(null,data.data);

      },function(data){

        console.log("ERROR: Had trouble with get_routes from API");
        callback("Had trouble with get_routes from API");

      });

  }

});