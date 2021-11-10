sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	//    "./BusquedaDeEmpresas", 
	//    "./BusquedaDeCentros", 
	//    "./BusquedaDeDescargaTolvas", 
	//    "./BusquedaDeUbicacionTecnica", 
	//    "./BusquedaDeEquipamientos", 
	//    "./BusquedaDeEquipos",
	"./utilities",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/core/BusyIndicator"
], function (BaseController,
	MessageBox,
	//    BusquedaDeEmpresas, 
	//    BusquedaDeCentros, 
	//    BusquedaDeDescargaTolvas, 
	//    BusquedaDeUbicacionTecnica, 
	//    BusquedaDeEquipamientos, 
	//    BusquedaDeEquipos, 
	Utilities,
	JSONModel,
	History,
	BusyIndicator
) {
	"use strict";

	return BaseController.extend("com.tasa.tolvas.registrotolvas.controller.EdicionRegistroTolva", {
		handleRouteMatched: function (oEvent) {
			// var sAppId = "App60f18d59421c8929c54cd9bf";

			// var oParams = {};

			// if (oEvent.mParameters.data.context) {
			// 	this.sContext = oEvent.mParameters.data.context;
			// } else {
			// 	if (this.getOwnerComponent().getComponentData()) {
			// 		var patternConvert = function(oParam) {
			// 			if (Object.keys(oParam).length !== 0) {
			// 				for (var prop in oParam) {
			// 					if (prop !== "sourcePrototype" && prop.includes("Set")) {
			// 						return prop + "(" + oParam[prop][0] + ")";
			// 					}
			// 				}
			// 			}
			// 		};
			// 		this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
			// 	}
			// }
			// var oPath;
			// if (this.sContext) {
			// 	oPath = {
			// 		path: "/" + this.sContext,
			// 		parameters: oParams
			// 	};
			// 	this.getView().bindObject(oPath);
			// }

			let data = this.getOwnerComponent().getModel("passModel").getProperty("/data");
			this.getView().setModel(new JSONModel(data), "EditRegistroTolvasModel");
		},
		// _onInputValueHelpRequest: function(oEvent) {

		// 	var sDialogName = "BusquedaDeEmpresas";
		// 	this.mDialogs = this.mDialogs || {};
		// 	var oDialog = this.mDialogs[sDialogName];
		// 	if (!oDialog) {
		// 		oDialog = new BusquedaDeEmpresas(this.getView());
		// 		this.mDialogs[sDialogName] = oDialog;

		// 		// For navigation.
		// 		oDialog.setRouter(this.oRouter);
		// 	}

		// 	var context = oEvent.getSource().getBindingContext();
		// 	oDialog._oControl.setBindingContext(context);

		// 	oDialog.open();

		// },
		// _onButtonPress: function(oEvent) {

		// 	var sDialogName = "";
		// 	this.mDialogs = this.mDialogs || {};
		// 	var oDialog = this.mDialogs[sDialogName];
		// 	if (!oDialog) {
		// 		oDialog = new(this.getView());
		// 		this.mDialogs[sDialogName] = oDialog;

		// 		// For navigation.
		// 		oDialog.setRouter(this.oRouter);
		// 	}

		// 	var context = oEvent.getSource().getBindingContext();
		// 	oDialog._oControl.setBindingContext(context);

		// 	oDialog.open();

		// },
		// _onButtonPress1: function(oEvent) {

		// 	var sDialogName = "";
		// 	this.mDialogs = this.mDialogs || {};
		// 	var oDialog = this.mDialogs[sDialogName];
		// 	if (!oDialog) {
		// 		oDialog = new(this.getView());
		// 		this.mDialogs[sDialogName] = oDialog;

		// 		// For navigation.
		// 		oDialog.setRouter(this.oRouter);
		// 	}

		// 	var context = oEvent.getSource().getBindingContext();
		// 	oDialog._oControl.setBindingContext(context);

		// 	oDialog.open();

		// },
		// _onInputValueHelpRequest5: function(oEvent) {

		// 	var sDialogName = "BusquedaDeEquipos";
		// 	this.mDialogs = this.mDialogs || {};
		// 	var oDialog = this.mDialogs[sDialogName];
		// 	if (!oDialog) {
		// 		oDialog = new BusquedaDeEquipos(this.getView());
		// 		this.mDialogs[sDialogName] = oDialog;

		// 		// For navigation.
		// 		oDialog.setRouter(this.oRouter);
		// 	}

		// 	var context = oEvent.getSource().getBindingContext();
		// 	oDialog._oControl.setBindingContext(context);

		// 	oDialog.open();

		// },
		_onButtonPress2: function (oEvent) {

			var sDialogName = "";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			if (!oDialog) {
				oDialog = new (this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var context = oEvent.getSource().getBindingContext();
			oDialog._oControl.setBindingContext(context);

			oDialog.open();

		},

		onPressSave: function (oEvent) {
			let oModel = this.getView().getModel("EditRegistroTolvasModel");
			let sCodEmb = oModel.getProperty("/CDEMB");
			let sNumDescarga = oModel.getProperty("/NRDES");
			
			let oReq = [
				{
					"cmopt": `NRDES = '${sNumDescarga}'`,
					"cmset": `CDEMB = '${sCodEmb}'`,
					"nmtab": "ZFLDES"
				}
			];
			Utilities.updateFieldTableRFC(oReq)
				.then(resp => {
					MessageBox.success("Se actualizaron los datos correctamente", {
						title: "Exito",                                     // default
						onClose: function () {
							BusyIndicator.show(0);
							this.sendMailNotif();
						}.bind(this),                                      // default
						styleClass: "",                                     // default
						actions: sap.m.MessageBox.Action.OK,                // default
						emphasizedAction: MessageBox.Action.OK,             // default
						initialFocus: MessageBox.Action.OK,                 // default
						textDirection: sap.ui.core.TextDirection.Inherit    // default
					});
				});

		},

		sendMailNotif: function(){
			let oModel = this.getView().getModel("EditRegistroTolvasModel");
			console.log(oModel);
			var planta = oModel.getProperty("/CDPTA");
			var centro = oModel.getProperty("/WERKS") + " ";
			var numDesc =  oModel.getProperty("/NRDES") + " ";
			var nombEmba = oModel.getProperty("/NMEMB") + " ";
			var matricula = oModel.getProperty("/MREMB") + " ";
			var cbodEmba = oModel.getProperty("/CPPMS");
			var fechIniDesc = oModel.getProperty("/FIDES") + " ";
			var fechFinDesc = oModel.getProperty("/FFDES") + " ";
			var tmpCbod = "";
			if(cbodEmba){
				if(!isNaN(cbodEmba)){
					if(cbodEmba > 0){
						tmpCbod = cbodEmba + " ";
					}else{
						tmpCbod = "0 ";
					}
				}else{
					tmpCbod = "0 ";
				}
			}else{
				tmpCbod = "0 ";
			}
			var pescDesc = oModel.getProperty("/CNPDS");
			var tmpPescDesc = "";
			if(pescDesc){
				if(!isNaN(pescDesc)){
					if(pescDesc > 0){
						tmpPescDesc = pescDesc + " ";
					}else{
						tmpPescDesc = "0 ";
					}
				}else{
					tmpPescDesc = "0 ";
				}
			}else{
				tmpPescDesc = "0 ";
			}

			var tmpData = [centro, numDesc, nombEmba, matricula, tmpCbod, fechIniDesc, fechFinDesc,tmpPescDesc];
			var data = [tmpData.join("%")];
			Utilities.enviarNotificacion(planta, data)
				.then(data => {
					console.log("Email: ", data);
					BusyIndicator.hide();
				});
			this.oRouter.navTo("RouteMain");
		},

		onCancelEditRegTolvas: function(){
			this.oRouter.navTo("RouteMain");
		},

		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TargetEdicionRegistroTolva").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function () {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function () {
								this.oRouter.navTo("", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

		},

		onAbrirAyudaEmbarcacion: function () {
			this.getDialog().open();
		},

		onSelectEmba: function (evt) {
			var objeto = evt.getSource().getBindingContext("CombosModel").getObject();
				if(objeto){
					var cdemb = objeto.CDEMB;
					var nmemb = objeto.NMEMB;
					var mremb = objeto.MREMB;
					var oModel = this.getView().getModel("EditRegistroTolvasModel");
					console.log(oModel);
					oModel.setProperty("/CDEMB", cdemb);
					oModel.setProperty("/NMEMB", nmemb);
					oModel.setProperty("/MREMB", mremb);
					this.getDialog().close();
				}
		},

		onSearchEmbarcacion: function () {
			BusyIndicator.show(0);
			var oModel = this.getOwnerComponent().getModel("CombosModel");
			var idEmbarcacion = sap.ui.getCore().byId("idEmba").getValue();
			var idEmbarcacionDesc = sap.ui.getCore().byId("idNombEmba").getValue();
			var idMatricula = sap.ui.getCore().byId("idMatricula").getValue();
			var idRuc = sap.ui.getCore().byId("idRucArmador").getValue();
			var idArmador = sap.ui.getCore().byId("idDescArmador").getValue();
			var idPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
			var options = [];
			var options2 = [];
			let embarcaciones = [];
			options.push({
				"cantidad": "20",
				"control": "COMBOBOX",
				"key": "ESEMB",
				"valueHigh": "",
				"valueLow": "O"
			})
			if (idEmbarcacion) {
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacion

				});
			}
			if (idEmbarcacionDesc) {
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacionDesc

				});
			}
			if (idMatricula) {
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "MREMB",
					"valueHigh": "",
					"valueLow": idMatricula
				})
			}
			if (idPropiedad) {
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "INPRP",
					"valueHigh": "",
					"valueLow": idPropiedad
				})
			}
			if (idRuc) {
				options2.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": idRuc
				})
			}
			if (idArmador) {
				options2.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "NAME1",
					"valueHigh": "",
					"valueLow": idArmador
				})
			}

			var body = {
				"option": [

				],
				"option2": [

				],
				"options": options,
				"options2": options2,
				"p_user": "BUSQEMB"
			};

			Utilities.obtenerEmbarcaciones(body)
				.then(data => {
					console.log("Embarcaciones: ", data);
					oModel.setProperty("/Embarcaciones", data);
					BusyIndicator.hide();
				});

		},

		onCerrarEmba: function () {
			this.getDialog().close();
		},

		getDialog: function () {
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("com.tasa.tolvas.registrotolvas.view.Embarcacion", this);
				this.getView().addDependent(this.oDialog);
			}
			return this.oDialog;
		},



	});
}, /* bExport= */ true);
