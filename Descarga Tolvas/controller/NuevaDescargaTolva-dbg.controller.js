sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
//  "./BusquedaDeIngresoDescargaManuals", 
//  "./BusquedaDeDescargaTolvas",
//	"./utilities",
	"sap/ui/core/routing/History"
], function(
    BaseController,
    MessageBox,
//    BusquedaDeIngresoDescargaManuals,
//    BusquedaDeDescargaTolvas,
//    Utilities,
    History) {
	"use strict";

	return BaseController.extend("com.tasa.tolvas.descargatolvas.controller.NuevaDescargaTolva", {
		handleRouteMatched: function(oEvent) {
			var sAppId = "App60f18d59421c8929c54cd9bf";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype" && prop.includes("Set")) {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}

		},
		_onInputValueHelpRequest: function(oEvent) {

			var sDialogName = "BusquedaDeIngresoDescargaManuals";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new BusquedaDeIngresoDescargaManuals(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		_onInputValueHelpRequest1: function(oEvent) {

			var sDialogName = "BusquedaDeDescargaTolvas";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new BusquedaDeDescargaTolvas(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("NuevaDescargaTolva").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function() {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function() {
								this.oRouter.navTo("DescargaTolvas", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

		}
	});
}, /* bExport= */ true);
