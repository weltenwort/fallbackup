'use strict';

var angular = require('angular');
var angular_ui_router = require("angular-ui-router");

var m = module.exports = angular.module('fallbackup', [
    angular_ui_router.name,
]);

m.config(function() {});

m.run(function($state) {
    //$state.transitionTo('campaign.map.fullView', {
        //campaignId: 1,
        //mapId: 1
    //});
});
