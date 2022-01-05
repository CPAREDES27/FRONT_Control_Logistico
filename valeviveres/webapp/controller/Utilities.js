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
		_getCurrentUser: async function(){

			let oUshell = sap.ushell,

			oUser={};

			if(oUshell){

				let oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");

				let sEmail = oUserInfo.getEmail().toUpperCase(),

				sName = sEmail.split("@")[0],

				sDominio= sEmail.split("@")[1];

				if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";

				oUser = {

					name:sName

				}

			}else{

				oUser = {

					name: "FGARCIA"

				}

			}



			this.usuario=oUser.name;

			console.log(this.usuario);

		},
    }
	
});