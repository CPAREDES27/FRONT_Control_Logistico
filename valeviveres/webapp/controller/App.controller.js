sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.tasa.valeviveres.controller.App", {

		onInit : function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy : true,
				delay : 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().dataLoaded().
				then(fnSetAppNotBusy);
			// this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			let oModel = this.getModel();
			oModel.setProperty("/data",[
				{
					vale:"0000029904",
					emb:"TASA 12 JC",
					armd:"TECNOLOGICA DE ALIMENTOS S.A",
					almc:"CALLAO",
					estado:"Válido"
				},
				{
					vale:"0000029905",
					emb:"TASA 12 JC",
					armd:"CHIMBOTE NORTE",
					almc:"CALLAO",
					estado:"Válido"
				},
				{
					vale:"0000029906",
					emb:"TASA 43 JC1",
					armd:"TECNOLOGICA DE ALIMENTOS S.A",
					almc:"CALLAO",
					estado:"Válido"
				}
			])
		}
	});

});