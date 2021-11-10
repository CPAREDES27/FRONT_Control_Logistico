sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"com/tasa/tolvas/descargatolvas/model/models"
], function (UriParameters, UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper, Device, Core, models) {
	"use strict";

	let navigationWithContext = {

    };
    
    var LayoutType = library.LayoutType;

	return UIComponent.extend("com.tasa.tolvas.descargatolvas.Component", {

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

            let oModel = new JSONModel();
			this.setModel(oModel);

			let oRouter = this.getRouter();
			oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
			// enable routing
			oRouter.initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		},

		getNavigationPropertyForNavigationWithContext: function(sEntityNameSet, targetPageName) {
			var entityNavigations = navigationWithContext[sEntityNameSet];
			return entityNavigations == null ? null : entityNavigations[targetPageName];
        },
        
		/**
		 * Returns an instance of the semantic helper
		 * @returns {sap.f.FlexibleColumnLayoutSemanticHelper} An instance of the semantic helper
		 */
		getHelper: function () {
			// let oFCL = this.getRootControl().byId("fcl"),
			// 	oParams = UriParameters.fromQuery(location.search),
			// 	oSettings = {
			// 		defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
			// 		defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
			// 		mode: oParams.get("mode"),
			// 		maxColumnsCount: oParams.get("max")
			// 	};
            // return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
            
            return this._getFcl().then(function(oFCL) {
				var oSettings = {
					defaultTwoColumnLayoutType: LayoutType.TwoColumnsBeginExpanded ,
					defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded
				};
				return (FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings));
			});
		},

		_getFcl: function () {
			return new Promise(function(resolve, reject) {
				var oFCL = sap.ui.getCore().byId("__xmlview1--fcl");//this.getRootControl().byId('fcl');
				if (!oFCL) {
					// this.getRootControl().attachAfterInit(function(oEvent) {
					this.getRootControl().attachAfterInit(function(oEvent) {
						// resolve(oEvent.getSource().byId('fcl'));
						resolve(sap.ui.getCore().byId("__xmlview1--fcl"));
					}, this);
					return;
				}
				resolve(oFCL);

			}.bind(this));
		},
        
		_onBeforeRouteMatched: function(oEvent) {
			this.sLayout = oEvent.getParameters().arguments.layout
                
            this.bus = Core.getEventBus();
            this.bus.subscribe("flexible", "Master", this.loadLayoutModel, this);			
        },
        
        loadLayoutModel: function(){
            let oModel = this.getModel(), //this.getOwnerComponent().getModel();
				sLayout = this.sLayout,
                oNextUIState;
			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				// oNextUIState = this.getHelper().getNextUIState(0);//this.getOwnerComponent().getHelper().getNextUIState(0);
                // sLayout = oNextUIState.layout;
                this.getHelper().then(function(oHelper) {
					oNextUIState = oHelper.getNextUIState(0);
					oModel.setProperty("/layout", oNextUIState.layout);
				});
				return;
			}
			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
        }
	});
});
