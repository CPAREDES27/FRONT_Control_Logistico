sap.ui.define([
	"./BaseController",
    "sap/m/MessageBox"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, MessageBox) {
		"use strict";

		return BaseController.extend("tasa.com.valedeviveres.controller.RegistrarValeViveres", {
			onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getTarget("RegistrarValeViveres").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
                
            },

            handleRouteMatched: function(oEvent) {
                var sAppId = "App6162382ab6194a3617e34917";

                this.getView().getModel("modelValeViveres").setProperty("/SearchTemporada", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchCliente", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchEmbarcacion", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchPlanta", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchAlmacen", {});
                this.getView().getModel("modelValeViveres").setProperty("/ValeVCab", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchProveedor", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchUsuario", {});
                var now = this.formatDate(new Date());
                this.getView().getModel("modelValeViveres").setProperty("/Now", now);
                var durTrav = "0"; 
                this.getView().getModel("modelValeViveres").setProperty("/DRTVS", durTrav);
                this.CargaIndPropiedad();
                this.CargaTemporada();
                this.CargaProveedor();
                this.ObtenerTempNoAfect();



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

            formatDate: function (date) {
                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();
                //let hour = date.getHours();
                //let minute = date.getMinutes();
                //let second = date.getSeconds();
                let dateFormatted = '';

                if (day < 10) day = '0' + day;
                if (month < 10) month = '0' + month;
                //if (hour < 10) hour = '0' + hour;
                //if (minute < 10) minute = '0' + minute;
                //if (second < 10) second = '0' + second;

                dateFormatted = day + '/' + month + '/' + year
                // + ' ' + hour + ':' + minute + ':' + second;

                return dateFormatted;
            }, 

            testModel: function(oEvent){
                var modelbase = this.getModel("modelValeViveres");
                console.log(modelbase);
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
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "", function(results){
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
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "", function(results){
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
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "", function(results){
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
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "", function(results){
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
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "", function(results){
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
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "", function(results){
                    self.getView().getModel(model).setProperty(property, results.data[0].WERKS);
                })
            },

            CargaIndPropiedad: function () {

                var domname = "ZINPRP";
                var property = "/ListIndPropiedad";
                this.EjecutarDominios(domname, property);
            },

            EjecutarDominios: function (domname, property) {

                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                var self = this;
                
                var objectRT = {
                        "dominios": [
                            {
                            "domname": domname,
                            "status": "A"
                            }
                        ]
                        };

    
                var urlPost = urlNodeJS + "/api/dominios/Listar";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        self.getView().getModel("modelValeViveres").setProperty(property, data.data[0].data);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },
/* 
            onChangeTemporada: function(oEvent) {

                var temporada = oEvent.getParameters().value;

                this.ObtenerSumTemporada(temporada);

                this.ObtenerdurTravesiaMax(temporada);

                this.ObtenerPlanta(temporada);

                this.ObtenerCentro(temporada);

            },
*/
            onChangeTemporada: function(oEvent) { //onActionSelTemporada

                var temporada = oEvent.getParameters().value;
                var fechCreacion = this.getView().getModel("modelValeViveres").getProperty("/Now");

                this.getView().getModel("modelValeViveres").setProperty("/Suministros", {});

                this.obtenerSuministro(oEvent);
            },

            obtenerSuministro: function(oEvent) {

                var temporada = oEvent.getParameters().value;

                this.ObtenerSumTemporada(temporada)

                this.ObtenerdurTravesiaMax(temporada);

                this.ObtenerPlanta(temporada);

                this.ObtenerDescPlanta(temporada);

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

                var tolMax = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDTPO;
                var fechIni = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                var fechFin = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FFTVS;

                //var fechIni = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDPTA; //
                //var fechFin = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDALM;
                
            },

            onActionDurTravesia: function (refresh) {
                
                var self = this;
                var fechIni = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                var fechFin = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FFTVS;

                var dd = fechIni.substring(0, 2);
                var MM = fechIni.substring(2, 4);
                var yyyy = fechIni.substring(4, 8);
                fechIni = yyyy + "/" + MM + "/" + dd;

                var dd = fechFin.substring(0, 2);
                var MM = fechFin.substring(2, 4);
                var yyyy = fechFin.substring(4, 8);
                fechFin = yyyy + "/" + MM + "/" + dd;

                var dateIni = new Date(fechIni);
                let timeIni = dateIni.getTime();

                var dateFin = new Date(fechFin);
                let timeFin = dateFin.getTime();

                var difFech = timeFin - timeIni;

                if (difFech >= 0) {
                    var durTrav = (difFech/(1000*60*60*24) + 1);
                    var durTravMax = parseInt(self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/DurTravesiaMax"));
                    if (durTrav > durTravMax) {
                        MessageBox.error("Supero duración maxima")
                        durTrav = 0;
                    } else {
                        //MessageBox.error("Error")
                    }
                } else {
                    //MessageBox.error("Error")
                    durTrav = 0;
                }
                return durTrav;
            },

            validateFields: function () { 

                var self = this;
                var refresh = false;
                var validarDatos = [];
                var valido = true;
                validarDatos.push({ campo: "Temporada", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDTPO});
                validarDatos.push({ campo: "Almacen", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDALM});
                validarDatos.push({ campo: "Embarcacion", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDEMB});
                validarDatos.push({ campo: "ArmComerc", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").KUNNR});
                validarDatos.push({ campo: "FechIniTrav", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS});
                validarDatos.push({ campo: "FechFinTrav", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FFTVS});
                validarDatos.push({ campo: "Proveedor", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").DSTPO});
                validarDatos.push({ campo: "NumTripul", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").NRTRI});
                validarDatos.push({ campo: "IndPropiedad", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").INPRP});
                validarDatos.push({ campo: "CodTripul", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").PERNR});
                validarDatos.push({ campo: "TempNoAfect", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/TempNoAfecta")});
                validarDatos.push({ campo: "CostVivDia", valor: self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CSTVD});
                
                for (var i = 0; i <validarDatos.length; i++) {
                    if (validarDatos[i].valor === "") {
                        valido = false;
                        MessageBox.warning("Faltan completar datos: " + validarDatos[i].campo);
                        break;
                    }
                }
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

                if (valido) {

                    var durTrav = this.onActionDurTravesia();
                    var IndPropiedad = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").INPRP;
                
                    if (durTrav > 0) {

                        if (IndPropiedad === "P") {
                            this.prepararSuministro(durTrav);
                        } else {
                            if(CostVivDia === null){
                                CostVivDia = 0;
                            }
                            this.prepararSuministroTerc(refresh);
                        }
                        return true;
                    }
                }
            },
            
            prepararSuministro: function (durTrav) {

                var self = this;
                var fecha = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                var centro = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/Centro");
                var proveedor = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").DSTPO;
                var suministro = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/Suministro");
                var NumTripul = parseInt(self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").NRTRI);

                this.getCostoSuministro(centro, proveedor, suministro , function(results){

                    if(results.s_data.length > 0) {

                        var descSuministro = results.s_data[0].DSSUM;
                        var material = results.s_data[0].MATNR;
                        var undMed = results.s_data[0].CDUMD;
                        var descUndMed = results.s_data[0].DSUMD;
                        //var costoUnitario = results.s_data[0].CUSUM;
                        var costoUnitario = 27.98;
                        var suministros = [];

                        for (var j = 1; j <= durTrav; j++) {
/*
                            var DescFecha = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                            var Posicion = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                            var Racion = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
                            var CostTotal = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").FITVS;
*/
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
                            
                            self.getView().getModel("modelValeViveres").setProperty("/ValeVCab/CostTotal", suministros[j-j].CostTotal);
                        }

                        self.getView().getModel("modelValeViveres").setProperty("/Suministros", suministros);
                        
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
                var durTravesia = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/Suministro");

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
                }

                self.getView().getModel("modelValeViveres").setProperty("/Suministros", suministrosTerc);
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
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "");

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
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "");

            },

            _onpress_embarcacionlink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var rowSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var cdemb = rowSelected.CDEMB;
					var mremb = rowSelected.MREMB;
                    var nmemb = rowSelected.NMEMB;
                    var inprp = rowSelected.INPRP;
                    var stcd1 = rowSelected.STCD1;
                    var kunnr = rowSelected.KUNNR;
					var name1 = rowSelected.NAME1;

					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/KUNNR",kunnr);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NAME1",name1);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/STCD1",stcd1);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CDEMB",cdemb);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/MREMB",mremb);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NMEMB",nmemb);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/INPRP",inprp);
                    
                    var inprp = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").INPRP;
                    var tempNoAfect = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab/TempNoAfecta");
                    if (inprp === "P") {
                        
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CostVivs", false);
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NumTripu", true);

                        if (!tempNoAfect){

                            self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/Cocinero", true);
                        
                        }

                        self.traerValeAnterior();

                    } else {

                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CostVivs", true);
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NumTripu", false);
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/Cocinero", false);

                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/KUNNR", "");
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NAME1", "");
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/STCD1", "");
                        self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NRTRI", "");

                    }

					self._onCloseDialogEmbarcacion();
            },

            traerValeAnterior: function () {

                var self = this;
                var embarcacion = self.getView().getModel("modelValeViveres").getProperty("/ValeVCab").CDEMB;

                if (embarcacion) {
                
                    var numfilas = 50;
                    var table = "ZFLVVI";
                    var user = "FGARCIA";
                    var model = "modelValeViveres";
                    var order = "FFTVS DESCENDING"
                    var options = [];
                    if (embarcacion) options.push({ cantidad: "40", control: "", "key": "CDEMB", valueHigh: "", valueLow: embarcacion });
                    self.ejecutarReadTable(table, options, user, numfilas, model, order, function(results){
                        self.getView().getModel(model).setProperty("/ValeVCab/NRVVI", results.data[0].NRVVI);
                        self.getView().getModel(model).setProperty("/ValeVCab/FITVS", results.data[0].FITVS);
                        self.getView().getModel(model).setProperty("/ValeVCab/FFTVS", results.data[0].FFTVS);
                    })
                }

            },

            //
            CargaEmbarcacion: function () {

                var self = this;
                var cdemb = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").CDEMB; //Cod emba
                var mremb = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").MREMB; //matricula
                var nmemb = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").NMEMB; //nomb emba
                var stcd1 = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").STCD1; //ruc emba
                var name1 = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").NAME1; //desc armador
                var inprp = self.getView().getModel("modelValeViveres").getProperty("/SearchEmbarcacion").INPRP;
                
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListEmbarcacion";
                
                var cdembAux = "CDEMB LIKE '"+ cdemb +"'";
                var mrembAux = "MREMB LIKE '"+ mremb +"'";
                var nmembAux = "NMEMB LIKE '"+ nmemb +"'";
                var stcd1Aux = "STCD1 LIKE '"+ stcd1 +"'";
                var name1Aux = "NAME1 LIKE '"+ name1 +"'";
                var inprpAux = "INPRP LIKE '"+ inprp +"'";

                var wa = [];
                if (cdemb) wa.push({ wa: cdembAux }); 
                if (mremb) wa.push({ wa: mrembAux });
                if (nmemb) wa.push({ wa: nmembAux }); 
                if (stcd1) wa.push({ wa: stcd1Aux });
                if (name1) wa.push({ wa: name1Aux });
                if (inprp) wa.push({ wa: inprpAux });
           
                self.ejecutarConsultarEmbarcacion(wa, user, model, property);
            },
            //

            ejecutarConsultarEmbarcacion: function (wa, user, model, property) {

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


                var objectRT = {
                    "option": wa,
                    "option2": [],
                    "options": [],
                    "options2": [],
                    "p_user": user
                };

                var urlPost = urlNodeJS + "/api/embarcacion/ConsultarEmbarcacion/";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        self.getView().getModel(model).setProperty(property, data.data);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            //CLIENTE
            _onpress_clientelink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var rowSelected = self.getView().getModel('modelValeViveres').getProperty(path);
                    var stcd1 = rowSelected.STCD1;
                    var kunnr = rowSelected.KUNNR;
					var name1 = rowSelected.NAME1;

					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/KUNNR",kunnr);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NAME1",name1);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/STCD1",stcd1);
					self._onCloseDialogArmadorComercial();
            },

            //
            _onpress_plantalink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var rowSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var werks = rowSelected.WERKS;
					var cdpta = rowSelected.CDPTA;
					var descr = rowSelected.DESCR;
					

					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/WERKS",werks);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CDPTA",cdpta);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DESCR",descr);
                    
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CDALM", ""); //Almacen
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DSALM", ""); //DescAlmaExterno
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CDALE", ""); //AlmaExterno
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DSTPO", ""); //Proveedor
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DRTVS", ""); //RucProveedor
					self._onCloseDialogPlanta();
            },

            _onpress_Almacenlink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var rowSelected = self.getView().getModel('modelValeViveres').getProperty(path);
                    var cdalm = rowSelected.CDALM;
					var dsalm = rowSelected.DSALM;
                    var cdale = rowSelected.CDALE;


					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CDALM",cdalm);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DSALM",dsalm);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/CDALE",cdale);

                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DSTPO", ""); //Proveedor
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/DRTVS", ""); //RucProveedor
                    self._getDialogAlmacen().close();
            },
            
            _onpress_Usuariolink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var rowSelected = self.getView().getModel('modelValeViveres').getProperty(path);
                    
                    var pernr = rowSelected.PERNR;
					var vorna = rowSelected.VORNA;
                    var nachn = rowSelected.NACHN;
                    var nach2 = rowSelected.NACH2;


					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/PERNR",pernr);
					self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/VORNA",vorna);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NACHN",nachn);
                    self.getView().getModel('modelValeViveres').setProperty("/ValeVCab/NACH2",nach2);
                    this._getDialogCocinero().close();
            },

            CargaUsuario: function () {

                var self = this;
                var pernr = self.getView().getModel("modelValeViveres").getProperty("/SearchUsuario").PERNR; 
                var vorna = self.getView().getModel("modelValeViveres").getProperty("/SearchUsuario").VORNA; 
                var nachn = self.getView().getModel("modelValeViveres").getProperty("/SearchUsuario").NACHN; 
                var nach2 = self.getView().getModel("modelValeViveres").getProperty("/SearchUsuario").NACH2; 
                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchUsuario").Numfilas;           
                
                if (!numfilas) numfilas = 50;
 
                var table = "ZHRP_BD_PERSONAL";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListUsuario";
                var options = [];
                if (pernr) options.push({ cantidad: "40", control: "INPUT", "key": "PERNR", valueHigh: "", valueLow: pernr }); 
                if (vorna) options.push({ cantidad: "40", control: "INPUT", "key": "VORNA", valueHigh: "", valueLow: vorna }); 
                if (nachn) options.push({ cantidad: "40", control: "INPUT", "key": "NACHN", valueHigh: "", valueLow: nachn }); 
                if (nach2) options.push({ cantidad: "40", control: "INPUT", "key": "NACH2", valueHigh: "", valueLow: nach2 }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "");

            },

            CargaAlmacen: function () {

                var self = this;
                var cdalm = self.getView().getModel("modelValeViveres").getProperty("/SearchAlmacen").CDALM; //Codigo
                var dsalm = self.getView().getModel("modelValeViveres").getProperty("/SearchAlmacen").DSALM; //Codigo
                var cdpta = self.getView().getModel("modelValeViveres").getProperty("/SearchAlmacen").CDPTA; //Planta
                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchAlmacen").Numfilas;
                
                if (!numfilas) numfilas = 50;
                            
                var table = "ZFLALM";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListAlmacen";
                var options = [];
                if (cdalm) options.push({ cantidad: "40", control: "INPUT", "key": "CDALM", valueHigh: "", valueLow: cdalm }); 
                if (dsalm) options.push({ cantidad: "40", control: "INPUT", "key": "DSALM", valueHigh: "", valueLow: dsalm }); 
                if (cdpta) options.push({ cantidad: "40", control: "INPUT", "key": "CDPTA", valueHigh: "", valueLow: cdpta }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "");

            },

            searchPlanta: function () {

                var self = this;
                var werks = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").WERKS;
                var cdpta = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").CDPTA;
                var descr = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").DESCR;
                var stcd1 = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").STCD1;
                var name1 = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").NAME1;
                var cdpto = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").CDPTO;
                var dspto = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").DSPTO;
                var inprp = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").INPRP;

                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").Numfilas;
                
                if (!numfilas) numfilas = 50;
                            
                var table = "ZV_FLPL";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListPlanta";
                var options = [];
                if (werks) options.push({ cantidad: "40", control: "INPUT", "key": "WERKS", valueHigh: "", valueLow: werks }); 
                if (cdpta) options.push({ cantidad: "40", control: "INPUT", "key": "CDPTA", valueHigh: "", valueLow: cdpta }); 
                if (descr) options.push({ cantidad: "40", control: "INPUT", "key": "DESCR", valueHigh: "", valueLow: descr }); 
                if (stcd1) options.push({ cantidad: "40", control: "INPUT", "key": "STCD1", valueHigh: "", valueLow: stcd1 }); 
                if (name1) options.push({ cantidad: "40", control: "INPUT", "key": "NAME1", valueHigh: "", valueLow: name1 }); 
                if (cdpto) options.push({ cantidad: "40", control: "INPUT", "key": "CDPTO", valueHigh: "", valueLow: cdpto }); 
                if (dspto) options.push({ cantidad: "40", control: "INPUT", "key": "DSPTO", valueHigh: "", valueLow: dspto }); 
                if (inprp) options.push({ cantidad: "40", control: "INPUT", "key": "INPRP", valueHigh: "", valueLow: inprp }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "");                
            
            },
            
            CargaCliente: function () {

                var self = this;
                var kunnr = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").KUNNR; //NroCliente
                var name1 = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").NAME1; //Descripcion
                var stcd1 = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").STCD1; //RUC
                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").Numfilas;
                
                if (!numfilas) numfilas = 50;
                            
                var table = "KNA1";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListClient";
                var options = [];
                if (kunnr) options.push({ cantidad: "40", control: "INPUT", "key": "KUNNR", valueHigh: "", valueLow: kunnr }); 
                if (name1) options.push({ cantidad: "40", control: "INPUT", "key": "NAME1", valueHigh: "", valueLow: name1 }); 
                if (stcd1) options.push({ cantidad: "40", control: "INPUT", "key": "STCD1", valueHigh: "", valueLow: stcd1 }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property, "");

            },
            //

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

            ejecutarReadTable: function (table, options, user, numfilas, model, property, order, callback) {

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


                var objectRT = {
                    "delimitador": "|",
                    "fields": [],
                    "no_data": "",
                    "option": [],
                    "options": options,
                    "order": order,
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

            OpenDialogEmbarcacion: function(viewCall) {
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
