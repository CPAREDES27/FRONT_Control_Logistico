sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
	"sap/ui/core/routing/History"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox, History) {
		"use strict";

		return Controller.extend("tasa.com.valedeviveres.controller.BaseController", {
			onInit: function () {
			    this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getTarget("Main").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
                this.getView().getModel("modelValeViveres").setProperty("/SearchCliente", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchValeVieres", {});
                this.getView().getModel("modelValeViveres").setProperty("/ValeAnula", {});
                this.getView().getModel("modelValeViveres").setProperty("/VerDetalle", {});
                //this.getView().getModel("modelValeViveres").setProperty("/Suministro", {});
            },
            
            _onPressDetalle: function(oEvent) {

                var self = this;
                var sPath = oEvent.oSource.oParent.oBindingContexts.modelValeViveres.sPath
                var rowSelected = self.getView().getModel('modelValeViveres').getProperty(sPath);
                this.getView().getModel("modelValeViveres").setProperty("/VerDetalle", rowSelected);
                var vale = rowSelected.NRVVI;
                var fechaFin = rowSelected.FFTVS; // 22/06/2009

                var dia = fechaFin.substring(0, 2);
                var mes = fechaFin.substring(3, 5);
                var año = fechaFin.substring(6, 10);

                fechaFin = mes + '/' + dia + '/' + año;
                let formatted_date = dia + '/' + mes + '/' + año;

                this.getListaSuministros(vale, function(results){
                    for (var i = 0; i < results.s_posicion.length; i++){
                        
                        results.s_posicion[i].FECHA = formatted_date
                        let hoy = new Date(fechaFin);
                        let DiaEnMilisegundos = 1000 * 60 * 60 * 24;
                        let resta = hoy.getTime() - DiaEnMilisegundos; //getTime devuelve milisegundos de esa fecha
                        fechaFin = new Date(resta);

                        formatted_date = 
                        (String(fechaFin.getDate()).length < 2 ? "0" + String(fechaFin.getDate()) : String(fechaFin.getDate()) )
                        
                        + "/" + 
                        (String(fechaFin.getMonth() + 1).length < 2 ? "0" + String(fechaFin.getMonth() + 1)  : String(fechaFin.getMonth() + 1) ) + "/" + 
                        fechaFin.getFullYear()
                    }
                    self.getView().getModel("modelValeViveres").setProperty("/ListaSuministro", results.s_posicion);
                });
                this._getDialogVerDetalle().open();

            },

            getListaSuministros: function (vale, callback) {
                if (!vale) vale = "";

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";

                var objectRT = {
                    "fields": [],
                    "p_code": vale,
                    "p_user": "FGARCIA"
                };

                var urlPost = urlNodeJS + "/api/valeviveres/DetalleImpresionViveres";

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
                            self.getView().getModel("modelValeViveres").setProperty("/ListaSuministro", data.data);
                        }
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });

            },

            _onPressAnularVale: function(oEvent) {

                var self = this;
                var sPath = oEvent.oSource.oParent.oBindingContexts.modelValeViveres.sPath
                var rowSelected = self.getView().getModel('modelValeViveres').getProperty(sPath);
                this.getView().getModel("modelValeViveres").setProperty("/ValeAnula", rowSelected);
                this._getDialogAnular().open();

            },

            AnularVale: function () {

                var self = this;
                var nrvvi = self.getView().getModel("modelValeViveres").getProperty("/ValeAnula").NRVVI; //Vale
                var obvvi = self.getView().getModel("modelValeViveres").getProperty("/ValeAnula").OBVVI; //Motivo
                var user = "FGARCIA";
                
                self.EjecutarAnularValev(nrvvi, obvvi, user);

            },
            
            EjecutarAnularValev: function (nrvvi, obvvi, user) {

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";

                var objectRT = {
                    "p_anula": obvvi,
                    "p_user": user,
                    "p_vale": nrvvi
                };
    
                var urlPost = urlNodeJS + "/api/valeviveres/AnularValev";

                $.ajax({
                    url: urlPost,
                    type: 'POST',
                    cache: false,
                    async: false,
                    dataType: 'json',
                    data: JSON.stringify(objectRT),
                    success: function (data, textStatus, jqXHR) {
                        if (data.t_mensaje[0].CMIN === "S") {
                            MessageBox.success(data.t_mensaje[0].DSMIN);
                            self.SearchMain();
                            self._getDialogAnular().close();
                        }
                        if (data.t_mensaje[0].CMIN === "W") MessageBox.warning(data.t_mensaje[0].DSMIN);
                        if (data.t_mensaje[0].CMIN === "E") MessageBox.warning(data.t_mensaje[0].DSMIN);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });

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
            
            CargaCliente: function () {

                /*
                var viewCall = self.getView().getModel("modelValeViveres").getProperty("/ViewCall");

                if (viewCall === "main" || viewCall === "main") {
                }
                */

                var self = this;
                var kunnr = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").KUNNR;
                var name1 = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").NAME1;
                var stcd1 = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").STCD1;
                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").Numfilas;
                
                if (!numfilas) numfilas = 50;
                            
                var table = "ZV_FLRP";
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListClient";
                var options = [];
                //if (kunnr) options.push({ text : "40", text : "", text : "KUNNR", text : "", text : kunnr }); 
                if (name1) options.push({ cantidad: "40", control: "", "key": "NAME1", valueHigh: "", valueLow: name1 }); 
                if (stcd1) options.push({ cantidad: "40", control: "", "key": "STCD1", valueHigh: "", valueLow: stcd1 }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);

            },

            ejecutarReadTable: function (table, options, user, numfilas, model, property) {

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
                        self.getView().getModel(model).setProperty(property, data.data);
                        console.log(data);
                    },
                    error: function (xhr, readyState) {
                        console.log(xhr);
                    }
                });
            },

            SearchMain: function () {

                var self = this;
                var Nrvvi = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").NRVVI ;
                var Nmemb = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").NMEMB ;
                var Name1 = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").NAME1 ;
                var Descr = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").DESCR ;
                var Inprp = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").INPRP;
                var Dstpo = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").DSTPO;
                var Fcvvi = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").FCVVI;
                var Esvvi = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").ESVVI;
                var Aufnr = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").AUFNR;
                var Kostl = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").KOSTL;
                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").Numfilas;

                if(!Nrvvi) Nrvvi = "";
                if(!Nmemb) Nmemb = "";
                if(!Name1) Name1 = "";
                if(!Descr) Descr = "";
                if(!Inprp) Inprp = "";
                if(!Dstpo) Dstpo = "";
                if(!Fcvvi) Fcvvi = "";
                if(!Esvvi) Esvvi = "";
                if(!Aufnr) Aufnr = "";
                if(!Kostl) Kostl = "";

                var nrvviAux = "NRVVI LIKE '"+ Nrvvi +"'";
                var nmembAux = "NMEMB LIKE '"+ Nmemb +"'";
                var name1Aux = "NAME1 LIKE '"+ Name1 +"'";
                var descrAux = "DESCR LIKE '"+ Descr +"'";
                var inprpAux = "INPRP LIKE '"+ Inprp +"'";
                var dstpoAux = "DSTPO LIKE '"+ Dstpo +"'";
                var fcvviAux = "FCVVI LIKE '"+ Fcvvi +"'";
                var esvviAux = "ESVVI LIKE '"+ Esvvi +"'";
                var AufnrAux = "AUFNR LIKE '"+ Aufnr +"'";
                var kostlAux = "KOSTL LIKE '"+ Kostl +"'";
                
                if (!numfilas) numfilas = 50;
                
                var user = "FGARCIA";
                var model = "modelValeViveres";
                var property = "/ListMain";
                var options = [];

                if (Nrvvi) options.push({ text: nrvviAux });
                if (Nmemb) options.push({ text: nmembAux });
                if (Name1) options.push({ text: name1Aux });
                if (Descr) options.push({ text: descrAux });
                if (Inprp) options.push({ text: inprpAux });
                if (Dstpo) options.push({ text: dstpoAux });
                if (Fcvvi) options.push({ text: fcvviAux });
                if (Esvvi) options.push({ text: esvviAux });
                if (Aufnr) options.push({ text: AufnrAux });
                if (Kostl) options.push({ text: kostlAux });
                
                self.SearchValeViveres(options, user, numfilas, model, property);

            },

            SearchValeViveres: function (options, user, numfilas, model, property) {

                var self = this;
                var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";


                var objectRT = {
                    "fields": [],
                    "options": options,
                    "p_user": user,
                    "rowcount": numfilas
                };

    
                var urlPost = urlNodeJS + "/api/valeviveres/Listar/";

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
            
            //
            _onOpenDialogAlmacen: function() {
            this._getDialogAlmacen().open();
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
            
            _onOpenDialogArmadorComercial: function() {
            this._getDialogArmadorComercial().open();
            },

            _onCloseDialogArmadorComercial: function() {
                this._getDialogArmadorComercial().close();
            },

            _onBuscarButtonPress: function(oEvent){
                var oBindingContext = oEvent.getSource().getBindingContext();

                return new Promise(function(fnResolve) {

                    this.doNavigate("RegistrarValeViveres", oBindingContext, fnResolve, "");
                }.bind(this)).catch(function(err) {
                    if (err !== undefined) {
                        MessageBox.error(err.message);
                    }
                });
            },

            Navigate: function(oEvent){
                var oBindingContext = oEvent.getSource().getBindingContext();

                return new Promise(function(fnResolve) {

                    this.doNavigate("RegistrarValeViveres", oBindingContext, fnResolve, "");
                }.bind(this)).catch(function(err) {
                    if (err !== undefined) {
                        MessageBox.error(err.message);
                    }
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

            _getDialogArmadorComercial : function () {
                if (!this._oDialogArmadorComercial) {
                    this._oDialogArmadorComercial = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgArmadorComercial", this.getView().getController());
                    this.getView().addDependent(this._oDialogArmadorComercial);
                }
                return this._oDialogArmadorComercial;
            },
            //

            //
            _onOpenDialogEmbarcacion: function() {
            this._getDialogEmbarcacion().open();
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
            _onOpenDialogPlanta: function() {
            this._getDialogPlanta().open();
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
            _onOpenDialogVerDetalle: function() {
                this._getDialogVerDetalle().open();
            },

            _onCloseDialogVerDetalle: function() {
                this._getDialogVerDetalle().close();
            },

            _getDialogVerDetalle : function () {
                if (!this._oDialogVerDetalle) {
                    this._oDialogVerDetalle = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgVerDetalle", this.getView().getController());
                    this.getView().addDependent(this._oDialogVerDetalle);
                }
                return this._oDialogVerDetalle;
            },
            //
            
            //
            _onOpenDialogAnular: function() {
                this._getDialogAnular().open();

            },

            _onCloseDialogAnular: function() {
                this._getDialogAnular().close();
            },

            _getDialogAnular : function () {
                if (!this._oDialogAnular) {
                    this._oDialogAnular = sap.ui.xmlfragment("tasa.com.valedeviveres.view.DlgAnular", this.getView().getController());
                    this.getView().addDependent(this._oDialogAnular);
                }
                return this._oDialogAnular;
            }
            //
		});
	});
