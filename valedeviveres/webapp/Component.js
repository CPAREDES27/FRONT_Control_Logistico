sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"tasa/com/valedeviveres/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	var navigationWithContext = {

	};

	return UIComponent.extend("tasa.com.valedeviveres.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
        },
        /*
        createContent: function() {
			var app = new sap.m.App({
				id: "App"
			});
			var appType = "App";
			var appBackgroundColor = "#FFFFFF";
			if (appType === "App" && appBackgroundColor) {
				app.setBackgroundColor(appBackgroundColor);
			}

			return app;
		},
*/
		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
		}

	});
});
