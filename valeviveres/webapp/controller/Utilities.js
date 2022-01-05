sap.ui.define([
	"./utilities",
], function () {
	"use strict";

	// class providing static utility methods to retrieve entity default values.
    return {
        onLocation:function(){
			var oRouter = window.location.origin;
			console.log(oRouter)
			var service="";
			if(oRouter.indexOf("localhost") !== -1){
				service='https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
			}
			if(oRouter.indexOf("tasadev")!== -1){
				service='https://cf-nodejs-cheerful-bat-js.cfapps.us10.hana.ondemand.com/api/'
			}
			if(oRouter.indexOf("tasaprd")!==-1){
				service='https://cf-nodejs-prd.cfapps.us10.hana.ondemand.com/api/'
			}
			if(oRouter.indexOf("tasaqas")!==-1){
				service='https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/'
			}
			console.log(service);
			return service;
		},
    }
	
});