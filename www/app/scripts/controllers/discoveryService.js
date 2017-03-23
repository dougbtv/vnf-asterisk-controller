vacApp.service('discoveryService', function($http){
   this.add = function(a) {
      return a + 100;
   }

  this.discover = function(callback) {

    // Ok, run discover all.
    $http.get(env.api_url + '/discover')
      .then(function(data){

        // console.log("discoverAll data",data);
        callback(null,data.data);

      },function(data){

        console.log("ERROR: Had trouble with discoverAll from API");
        callback("Had trouble with discoverAll from API");

      });

  }

  var discover = this.discover;

  this.gettrunk = function(uuid,trunkname,callback) {

    // Ok, run discover all.
    $http.get(env.api_url + '/gettrunk/' + uuid + '/' + trunkname)
      .then(function(data){

        // console.log("gettrunk data",data);
        callback(null,data.data);

      },function(data){

        console.log("ERROR: Had trouble with gettrunk from API");
        callback("Had trouble with gettrunk from API");

      });

  }

  var gettrunk = this.gettrunk;

  this.discoverAll = function(callback) {

    discover(function(err,data){

      if (!err) {
  
        // Ok, what we're going to do is get all the trunks herein.
        // So let's cycle through those and add 'em.

        if (data.length) {

          var instancedetail = [];

          data.forEach(function(instance){
    
            // console.log("!trace data",instance);
            var trunkdetail = [];

            if (instance.trunks.length) {

              // Ok, there's some trunks in here.
              instance.trunks.forEach(function(trunk){

                gettrunk(instance.uuid,trunk,function(err,trunkinfo){

                  if (!err && trunkinfo) {
                    trunkdetail.push(trunkinfo);
                  }

                });

              }); // end foreach trunk

            }

            instance.trunks = trunkdetail;

            instancedetail.push(instance);

          }); // end foreach instance

          // console.log("instancedetail result",instancedetail);
          callback(null,instancedetail);

        } else {
          callback("discoveryService_error_nodata_discoverall");
        }

      } else {
        callback(err);
      }

    });

  }

});