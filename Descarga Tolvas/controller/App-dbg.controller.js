sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";
	return Controller.extend("com.tasa.tolvas.descargatolvas.controller.App", {
		onInit: function () {
			// this.oRouter = this.getOwnerComponent().getRouter();
			// this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			// this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		},
        
		// onRouteMatched: function (oEvent) {
		// 	var sRouteName = oEvent.getParameter("name"),
		// 		oArguments = oEvent.getParameter("arguments");

		// 	// this._updateUIElements();

		// 	// Save the current route name
		// 	this.currentRouteName = sRouteName;
		// 	this.currentProduct = oArguments.product;
		// 	this.currentSupplier = oArguments.supplier;
        // },
        
		// onBeforeRouteMatched: function(oEvent) {
        //     console.log("antes router")
		// 	// var oModel = this.getOwnerComponent().getModel();
		// 	// var sLayout = oEvent.getParameters().arguments.layout;
		// 	// // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
		// 	// if (!sLayout) {
		// 	// 	var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
		// 	// 	sLayout = oNextUIState.layout;
		// 	// }
		// 	// // Update the layout of the FlexibleColumnLayout
		// 	// if (sLayout) {
		// 	// 	oModel.setProperty("/layout", sLayout);
		// 	// }
		// }
	});
});