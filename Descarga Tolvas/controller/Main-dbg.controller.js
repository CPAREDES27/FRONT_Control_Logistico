sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
//	"./BusquedaDeIngresoDescargaManuals",
	"./utilities",
	"sap/ui/core/Core",
    "sap/ui/core/routing/History",
	'./formatter',
    "sap/ui/model/json/JSONModel"
],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function(
    BaseController, 
    MessageBox, 
//	BusquedaDeIngresoDescargaManuals, 
    Utilities,
    Core,
    History,
    Formatter,
    JSONModel) {
    "use strict";

    return BaseController.extend("com.tasa.tolvas.descargatolvas.controller.Main", {
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
            
            
            let oModel = new JSONModel(sap.ui.require.toUrl("com/tasa/tolvas/descargatolvas/mock/formFiltrosRegistro.json"));
            this.getView().setModel(oModel, "FormSearchModel");
            // this._onButtonSearchPress();
		},
		// _onInputValueHelpRequest: function(oEvent) {

		// 	var sDialogName = "BusquedaDeIngresoDescargaManuals";
		// 	this.mDialogs = this.mDialogs || {};
		// 	var oDialog = this.mDialogs[sDialogName];
		// 	if (!oDialog) {
		// 		oDialog = new BusquedaDeIngresoDescargaManuals(this.getView());
		// 		this.mDialogs[sDialogName] = oDialog;

		// 		// For navigation.
		// 		oDialog.setRouter(this.oRouter);
		// 	}

		// 	var context = oEvent.getSource().getBindingContext();
		// 	oDialog._oControl.setBindingContext(context);

		// 	oDialog.open();

		// },
		// _onButtonPress: function(oEvent) {
		// 	var oBindingContext = oEvent.getSource().getBindingContext();
		// 	return new Promise(function(fnResolve) {
		// 		this.doNavigate("NuevaDescargaTolva", oBindingContext, fnResolve, "");
		// 	}.bind(this)).catch(function(err) {
		// 		if (err !== undefined) {
		// 			MessageBox.error(err.message);
		// 		}
		// 	});
        // },

        _onButtonSearchPress: function(oEvent){
            let sTableName = "",
                iRowCount = 200,
                aField = null,
                aOption = null,
                sCentro = "TVEG",
                sFecha = "20210706",
                sOrder = "FHERR DESCENDING HRERR DESCENDING CMIN ASCENDING",
                oView = this.getView();

            sTableName = "ZV_FLOG";
            aField = [
                "CDMEN", "CMIN", "DSMEN", "TPROG", "MREMB", 
                "NMEMB", "NRDES", "FECCONMOV", "PESACUMOD", "DOC_MFBF", 
                "DOC_MB1B", "DOC_MIGO",	"NROLOTE", "NROPEDI", "FIDES", 
                "HIDES", "WERKS", "DSPTA", "CDSPC", "DSSPC"];
            aOption = [
                {
                    "wa": `INDTR = 'P'`
                },
                {
                    "wa": `AND CDTPC = 'I'`
                },
                {
                    "wa": `AND ESREG = 'S'`
                },
                {
                    "wa": `AND (TPROG = 'G' OR (TPROG = 'A' AND CMIN = 'E'))`
                },
                {
                    "wa": `AND (WERKS LIKE 'TCNO')`
                },
                {
                    "wa": `AND (FECCONMOV BETWEEN '20210401' AND '20210831')`
                }
            ];

            oView.getModel("FormSearchModel").setProperty("/busyIndicatorTableDescargaTolvas", true);
            Utilities.getDataFromReadTable(sTableName, aOption, aField, sOrder, iRowCount)
                .then(data => {
                    let oResp = data;
                    // let sBalanza = '';
                    // oResp2.forEach((element, index) => {
                    //     console.log(element);
                    //     if (index === 0){
                    //         sBalanza += element.INBAL;
                    //     } else {
                    //         sBalanza += ', ' + element.INBAL;
                    //     }
                    // })
                    oView.getModel("FormSearchModel").setProperty("/busyIndicatorTableDescargaTolvas", false);                    
                    oView.setModel( new JSONModel({
                        "data": oResp
                    }), "DescargaTolvaModel")
                });
        },

        onValidationError: function(oEvent){
            const oInput = oEvent.getSource();
            oInput.setValueState("Error");
            oInput.setValueStateText(oEvent.getParameter("message"));
        },

        onPressRow: function(oEvent) {
            // var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
            //     productPath = oEvent.getSource().getBindingContext("products").getPath(),
            //     product = productPath.split("/").slice(-1).pop();
                
            // this.oRouter.navTo("detail", {layout: oNextUIState.layout, product: product});
            let productPath = oEvent.getSource().getBindingContext("DescargaTolvaModel").getPath(),            
                oModel = this.getOwnerComponent().getModel(),
                oNextUIState;

            this.byId("PageDetailDescargaTolva").bindElement("DescargaTolvaModel>" + productPath);
            this.getOwnerComponent().getHelper().then(function(oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                oModel.setProperty("/layout", oNextUIState.layout);
            });
        },

        handleClose:function(oEvent) {
            let oModel = this.getOwnerComponent().getModel(),
                oNextUIState;
            this.getOwnerComponent().getHelper().then(function(oHelper) {
                oNextUIState = oHelper.getNextUIState(0);
                oModel.setProperty("/layout", oNextUIState.layout);
            });
        },

		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		// _onButtonPress1: function(oEvent) {

		// 	var oBindingContext = oEvent.getSource().getBindingContext();

		// 	return new Promise(function(fnResolve) {

		// 		this.doNavigate("NuevaDescargaTolva", oBindingContext, fnResolve, "");
		// 	}.bind(this)).catch(function(err) {
		// 		if (err !== undefined) {
		// 			MessageBox.error(err.message);
		// 		}
		// 	});

		// },
		onInit: function() {
            // console.log(this.createId("fcl"))
			this.oRouter = this.getOwnerComponent().getRouter();//sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getTarget("TargetMain").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            
			// this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
            // this.oRouter.getRoute("default").attachPatternMatched(this.handleRouteMatched, this);
            
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function() {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function() {
								this.oRouter.navTo("MasterPage1", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
            });

            
            // var oChildContainer = this.byId("myChildContainer");
			// this.getOwnerComponent().runAsOwner(function () {
			// 	sap.ui.component({
			// 		name: "com.tasa.tolvas.librarymarea", //Our child component
			// 		id: "MyChildComponent",
			// 		manifestFirst: true,
			// 		async: true
			// 	}).then(function (component) {
			// 		// set the component when it is successfully loaded
			// 		oChildContainer.setComponent(component);
			// 	}.bind(this));
			// }.bind(this));
            this.bus = Core.getEventBus();
            // this.getView().attachAfterInit(function(oEvent) {
            //     console.log("aqui")
            // }, this);
            this.loadComboClaseMensaje();
        },

        // afterInit: function(oEvent){
        //     // this.bus.publish("flexible", "Master");
            
        //         console.log("aqui")
        // }

        loadComboClaseMensaje: function(){
            Utilities.getDataFromDominios(["ZCLMIN"])
                .then( jQuery.proxy(data => {
                    this.getView().setModel(new JSONModel(data[0]), "ClaseMensajeModel")
                }, this) )
        },
        
        onAfterRendering: function() {
            console.log("onAfterRendering Main");
            this.bus.publish("flexible", "Master");
        },
	});
}, /* bExport= */ true);
