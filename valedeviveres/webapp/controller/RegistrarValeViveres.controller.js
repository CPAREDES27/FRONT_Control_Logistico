sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("tasa.com.valedeviveres.controller.BaseController", {
			onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    this.oRouter.getTarget("RegistrarValeViveres").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
                //this.getView().getModel("modelValeViveres").setProperty("/SearchTemporada", {});
                //this.getView().getModel("modelValeViveres").setProperty("/SearchProveedor", {});
                //this.getView().getModel("modelValeViveres").setProperty("/ValeVCab", {});
                //this.getView().getModel("modelValeViveres").setProperty("/Suministros", {});
                //this.CargaTemporada(); 
                //this.CargaProveedor();
                //this.ObtenerTempNoAfect();
            },

            handleRouteMatched: function(oEvent) {
                var sAppId = "App6162382ab6194a3617e34917";

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

            ObtenerTempNoAfect: function () {

                var self = this;
                var numfilas = 1;
                var table = "ZFLCNS";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ValeVCab/TempNoAfecta";
                var options = [];
                options.push({ cantidad: "40", control: "", "key": "CDCNS", valueHigh: "", valueLow: 28 });
                self.ejecutarReadTable(table, options, user, numfilas, model, property, function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].VAL01);
                })
            },

            ObtenerSumTemporada: function (temporada) {

                var self = this;
                var numfilas = 1;
                var table = "ZFLTPO";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ValeVCab/Suministro";
                var options = [];
                options.push({ cantidad: "40", control: "", "key": "CDTPO", valueHigh: "", valueLow: temporada });
                self.ejecutarReadTable(table, options, user, numfilas, model, property, function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].CDSUM);
                })
            },

            ObtenerdurTravesiaMax: function (temporada) {

                var self = this;
                var numfilas = 1;
                var table = "ZFLTPO";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ValeVCab/DurTravesiaMax";
                var options = [];
                options.push({ cantidad: "40", control: "", "key": "CDTPO", valueHigh: "", valueLow: temporada });
                self.ejecutarReadTable(table, options, user, numfilas, model, property, function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].DXMAR);
                })
            },

            ObtenerPlanta: function (temporada) {

                var self = this;
                var numfilas = 1;
                var table = "ZFLTPO";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ValeVCab/Planta";
                var options = [];
                options.push({ cantidad: "40", control: "", "key": "CDTPO", valueHigh: "", valueLow: temporada });
                self.ejecutarReadTable(table, options, user, numfilas, model, property, function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].CDPTA);
                })
            },

            ObtenerDescPlanta: function (temporada) {

                var self = this;
                var numfilas = 1;
                var table = "ZFLPTA";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ValeVCab/DescPlanta";
                var options = [];
                options.push({ cantidad: "40", control: "", "key": "CDPTA", valueHigh: "", valueLow: temporada });
                self.ejecutarReadTable(table, options, user, numfilas, model, property, function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].DESCR);
                })
            },

            ObtenerCentro: function (temporada) {

                var self = this;
                var numfilas = 1;
                var table = "ZFLPTA";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ValeVCab/Centro";
                var options = [];
                options.push({ cantidad: "40", control: "", "key": "CDPTA", valueHigh: "", valueLow: temporada });
                self.ejecutarReadTable(table, options, user, numfilas, model, property, function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].WERKS);
                })
            },

            onChangeTemporada: function(oEvent) {

                var temporada = oEvent.getParameters().value;

                this.ObtenerSumTemporada(temporada);

                this.ObtenerdurTravesiaMax(temporada);

                this.ObtenerPlanta(temporada);

                this.ObtenerCentro(temporada);

            },

            validarCabecera: function(oEvent) {

                this.validateFields();

                var Indpropiedad = this.getView().getModel("modelValeViveres").getProperty("/ValeVCab").INPRP;

                if(Indpropiedad === "P") {
                    
                    //this.validarTravesia();
                    
                }

            },

            validarTravesia: function () {

                var tolMax = self.getView().getModel("modelValeViveres").getProperty("/SearchTemporada").CDTPO;
                var fechIni = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDPTA;
                var fechFin = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDALM;

                var fechIni = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDPTA; //
                var fechFin = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDALM;
                
            },

            validateFields: function () { 

                var self = this;
                var refresh = false;
                var Temporada = self.getView().getModel("modelValeViveres").getProperty("/SearchTemporada").CDTPO;
                var Almacen = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDALM;
                var Embarcacion = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDEMB;
                var ArmComerc = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").ARMCOMERC;
                var FechIniTrav = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                var FechFinTrav = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FFTVS;
                var Proveedor = self.getView().getModel("modelValeViveres").getProperty("/SearchProveedor").DSTPO;

                var NumTripul = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").NRTRI;
                var IndPropiedad = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").INPRP;
                var CodTripul = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").codTripul;
                var TempNoAfect = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/TempNoAfecta");//VAL01

                var CostVivDia = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").ARCMC;
                
                /*
                meter varias variables en un atributeName para hacer funcionar el for
                for (int i = 0; i <attributeName.length; i++) { 
                    attributeValue = node.getCurrentElement().getAttributeValue(attributeName[i]);
                    attributeInfo = node.getNodeInfo().getAttribute(attributeName[i]);

                    if (isEmptyField(attributeValue))
                    {			
                        utilCust.getAttributeMessage(node.getCurrentElement(), attributeInfo, "MISSINGFIELD", 
                                new Object[] { utilCust.getText(attributeName[i].toUpperCase()) });
                    }
                }
                

                if (NumTripul > NumTripulMax && IndPropiedad === "P"){
                    //
                }
                if (NumTripul > 1 && IndPropiedad === "P"){
                    //
                }
                if ((IndPropiedad === "P" && !Temporada === TempNoAfect) && !CodTripul){
                    //
                }
                
                -- Verificar caso de recuperar datos de travesia para la misma embarcación
                if ((!formElement.getEmbarcacion().equalsIgnoreCase(formBackElement.getEmbarcacion())) || 
                        (!formElement.getFechIniTrav().equals(formBackElement.getFechIniTrav())) ||
                        (!formElement.getFechFinTrav().equals(formBackElement.getFechFinTrav())) ||
                        (formElement.getNumTripul() != formBackElement.getNumTripul()) ||
                        (formElement.getCostVivDia() != formBackElement.getCostVivDia()) ||
                        (!formElement.getProveedor().equalsIgnoreCase(formBackElement.getProveedor())) ) {
                            
                    refresh = true;		
                            
                }
                */
                IndPropiedad = "P"

                if (IndPropiedad === "P") {
                    this.prepararSuministro(refresh);
                } else {
                    if(CostVivDia === null){
                        CostVivDia = 0;
                    }
                    this.prepararSuministroTerc(refresh);
                }
                return true;
            },

            prepararSuministro: function (refresh) {

                var self = this;
                var fecha = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                var durTravesia = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/DurTravesiaMax");//DXMAR
                var centro = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/Centro");//WERKS
                var proveedor = self.getView().getModel("modelValeViveres").getProperty("/SearchProveedor").DSTPO;
                var suministro = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/Suministro");//CDSUM
                var NumTripul = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").NRTRI;

                this.getCostoSuministro(centro, proveedor, suministro , function(results){

                    if(results.s_data.length > 0) {

                        var descSuministro = results.s_data[0].DSSUM;
                        var material = results.s_data[0].MATNR;
                        var undMed = results.s_data[0].CDUMD;
                        var descUndMed = results.s_data[0].DSUMD;
                        var costoUnitario = results.s_data[0].CUSUM;

                        for (var j = 1; j <= durTravesia; j++) {
/* 
                            var DescFecha = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                            var Posicion = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                            var Racion = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                            var CostTotal = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
*/
                            var suministros = [];

                            suministros.push({ Fecha: fecha, 
                                           DescFecha: fecha, //falta ponerle formato ff/mm//yyyy
                                           Posicion: j,
                                           Racion: NumTripul,
                                           UndMedida: undMed,
                                           DescUndMedida: descUndMed,
                                           Suministro: suministro,
                                           DescSuministro: descSuministro,
                                           CostUnitario: costoUnitario,
                                           CostTotal: costoUnitario * NumTripul });

                            self.getView().getModel("modelValeViveres").setProperty("/Suministros", suministros);
                        
                    }    
                  }
                })
            },

            getCostoSuministro: function (centro, proveedor, suministro, callback) {

                if (!centro) centro = "";
                if (!proveedor) proveedor = "";
                if (!suministro) suministro = "";

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


                var objectRT = {
                    "fieldS_data": [],
                    "options": [],
                    "p_centro": centro,
                    "p_code": suministro,
                    "p_proveedor": proveedor,
                    "p_user": "FGARCIA"
                };

    
                var urlPost = urlNodeJS + "/api/valeviveres/CostoRacionValev";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        if (callback) {
                            callback(data);
                        } else {
                            self.getView().getModel("modelValeViveres").setProperty("/CostoSuministro", data.data);
                        }
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });

            },

            prepararSuministroTerc: function () {

                var self = this;
                var fecha = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                var durTravesia = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/Suministro");//DXMAR

                for (f = 1; f <= durTravesia; f++) {

                    var CostVivDia = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").ARCMC;
                    var costoUnitario = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                    
                    var suministrosTerc = [];

                    suministrosTerc.push({ Fecha: fecha, 
                                       DescFecha: fecha, //falta ponerle formato ff/mm//yyyy
                                       Posicion: j,
                                       Racion: 1,
                                       CostUnitario: CostVivDia,
                                       CostTotal: costoUnitario * NumTripul });

                    self.getView().getModel("modelValeViveres").setProperty("/Suministros", suministrosTerc);
                    
                }
            },

            CargaProveedor: function () {

                var self = this;
                var lifnr = self.getView().getModel("modelValeViveres").getProperty("/SearchProveedor").LIFNR;
                var cdpta = self.getView().getModel("modelValeViveres").getProperty("/SearchProveedor").CDPTA;
                var cdalm = self.getView().getModel("modelValeViveres").getProperty("/SearchProveedor").CDALM;
                
                var numfilas = 30;
                var table = "ZV_FLPD";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListProveedor";
                var options = [];
                if (lifnr) options.push({ cantidad: "40", control: "", "key": "LIFNR", valueHigh: "", valueLow: lifnr });
                if (cdpta) options.push({ cantidad: "40", control: "", "key": "CDPTA", valueHigh: "", valueLow: cdpta });
                if (cdalm) options.push({ cantidad: "40", control: "", "key": "CDALM", valueHigh: "", valueLow: cdalm });
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);

            },

            CargaTemporada: function () {

                var self = this;
                var dstpo = self.getView().getModel("modelValeViveres").getProperty("/SearchTemporada").DSTPO;
                
                if (!dstpo) dstpo = "";
                
                var numfilas = 50;
                var table = "ZFLTPO";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListTemporada";
                var options = [];
                if (dstpo) options.push({ cantidad: "40", control: "", "key": "DSTPO", valueHigh: "", valueLow: dstpo });
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);

            },

            SearchMain: function () {

                var self = this;
                var fecha = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;


                if(!arcmc) arcmc = "";
                if(!cdemb) cdemb = "";
                if(!cdtpo) cdtpo = "";
                if(!cdpta) cdpta = "";
                if(!cdalm) cdalm = "";
                if(!inprp) inprp = "";

                var arcmcAux = "ARCMC LIKE '"+ arcmc +"'";
                var cdembAux = "CDEMB LIKE '"+ cdemb +"'";
                var cdtpoAux = "CDTPO LIKE '"+ cdtpo +"'";
                var cdptaAux = "CDPTA LIKE '"+ cdpta +"'";
                var cdalmAux = "CDALM LIKE '"+ cdalm +"'";
                var inprpAux = "INPRP LIKE '"+ inprp +"'";
                
                if (!numfilas) numfilas = 50;
                
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListMain";
                var options = [];

                if (arcmc) options.push({ text: arcmcAux });
                if (cdemb) options.push({ text: cdembAux });
                if (cdtpo) options.push({ text: cdtpoAux });
                if (cdpta) options.push({ text: cdptaAux });
                if (cdalm) options.push({ text: cdalmAux });
                if (inprp) options.push({ text: inprpAux });
                
                self.SearchValeViveres(options, user, numfilas, model, property);

            },

            ejecutarReadTable: function (table, options, user, numfilas, model, property, callback) {

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


                var objectRT = {
                    "delimitador": "|",
                    "fields": [],
                    "no_data": "",
                    "option": [],
                    "options": options,
                    "order": "",
                    "p_user": user,
                    "rowcount": numfilas,
                    "rowskips": 0,
                    "tabla": table
                };

    
                var urlPost = urlNodeJS + "/api/General/Read_Table/";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        if (callback) {
                            callback(data);
                        } else {
                            self.getView().getModel(model).setProperty(property, data.data);
                        }
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            //
            _onOpenDialogAlmacen: function () {
                this.OpenDialogAlmacen("main");
            },

            OpenDialogAlmacen: function(viewCall) {
                this.getView().getModel("modelValeViveres").setProperty("/ViewCall", viewCall);
                this._getDialogAlmacen().open();
            },

            _onOpenDialogAlmacenNewReg: function () {
                this.OpenDialogAlmacen("nuevo");
            },

            _onCloseDialogAlmacena: function() {
                this._getDialogAlmacen().close();
            },

            _getDialogAlmacen : function () {
                if (!this._oDialogAlmacen) {
                    this._oDialogAlmacen = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgAlmacen", this.getView().getController());
                    this.getView().addDependent(this._oDialogAlmacen);
                }
                return this._oDialogAlmacen;
            },
            //

            //
            _onOpenDialogArmadorComercial: function () {
                this.OpenDialogArmadorComercial("main");
            },

            OpenDialogArmadorComercial: function(viewCall) {
                this.getView().getModel("modelValeViveres").setProperty("/ViewCall", viewCall);
                this._getDialogArmadorComercial().open();
            },

            _onOpenDialogArmadorComercialNewReg: function () {
                this.OpenDialogArmadorComercial("nuevo");
            },
            
            _onCloseDialogArmadorComercial: function() {
                this._getDialogArmadorComercial().close();
            },

            _getDialogArmadorComercial : function () {
                if (!this._oDialogArmadorComercial) {
                    this._oDialogArmadorComercial = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgArmadorComercial", this.getView().getController());
                    this.getView().addDependent(this._oDialogArmadorComercial);
                }
                return this._oDialogArmadorComercial;
            },
            //

            //
            _onOpenDialogEmbarcacion: function () {
                this.OpenDialogEmbarcacio("main");
            },

            OpenDialogEmbarcacio: function(viewCall) {
                this.getView().getModel("modelValeViveres").setProperty("/ViewCall", viewCall);
                this._getDialogEmbarcacion().open();
            },

            _onOpenDialogEmbarcacionNewReg: function () {
                this.OpenDialogEmbarcacio("nuevo");
            },

            _onCloseDialogEmbarcacion: function() {
                this._getDialogEmbarcacion().close();
            },

            _getDialogEmbarcacion : function () {
                if (!this._oDialogEmbarcacion) {
                    this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgEmbarcacion", this.getView().getController());
                    this.getView().addDependent(this._oDialogEmbarcacion);
                }
                return this._oDialogEmbarcacion;
            },
            //

            //

            _onOpenDialogPlanta: function () {
                this.OpenDialogPlanta("main");
            },

	        OpenDialogPlanta: function(viewCall) {
                this.getView().getModel("modelValeViveres").setProperty("/ViewCall", viewCall);
                this._getDialogPlanta().open();
            },

	        _onOpenDialogPlantaNewReg: function () {
                this.OpenDialogPlanta("nuevo");
            },

            _onCloseDialogPlanta: function() {
                this._getDialogPlanta().close();
            },

            _getDialogPlanta : function () {
                if (!this._oDialogPlanta) {
                    this._oDialogPlanta = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgPlanta", this.getView().getController());
                    this.getView().addDependent(this._oDialogPlanta);
                }
                return this._oDialogPlanta;
            },
            //
            
            //
            _onOpenDialogCocinero: function () {
                this._getDialogCocinero().open();
            },

            _onCloseDialogCocinero: function() {
                this._getDialogCocinero().close();
            },

            _getDialogCocinero : function () {
                if (!this._oDialogCocinero) {
                    this._oDialogCocinero = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgCocinero", this.getView().getController());
                    this.getView().addDependent(this._oDialogCocinero);
                }
                return this._oDialogCocinero;
            }
            //

		});
	});
