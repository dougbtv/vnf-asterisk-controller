'use strict';

/**
 * @ngdoc overview
 * @name vnfAsteriskControllerApp
 * @description
 * # vnfAsteriskControllerApp
 *
 * Main module of the application.
 */
var vacApp = angular
  .module('vnfAsteriskControllerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider,$locationProvider) {

    $locationProvider.hashPrefix("");

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/discovery', {
        templateUrl: 'views/discovery.html',
        controller: 'discoveryController',
        controllerAs: 'discovery'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
