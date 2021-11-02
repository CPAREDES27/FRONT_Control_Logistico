sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/library"

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, MessageBox, History, exportLibrary, Spreadsheet, CoreLibrary) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        var ValueState = CoreLibrary

		return BaseController.extend("tasa.com.valedeviveres.controller.Main", {

            //formatter: formatter,
            dataTableKeys: [
                'NRVVI',
                'NMEMB',
                'NAME1',
                'DESCR',
                'DSALM',
                'DESC_INPRP',
                'DSTPO',
                'FCVVI',
                'ESVVI',
                'AUFNR',
                'KOSTL'
            ],

			onInit: function () {
                //this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter = this.getRouter();
                this.oRouter.getTarget("Main").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
                
            },

            CargaIndPropiedad: function () {

                var domname = "ZINPRP";
                var property = "/ListIndPropiedad";
                this.EjecutarDominios(domname, property);
            },

            CargaTemporada: function () {

                var domname = "TEMPORADA";
                var property = "/ListTemporada";
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

            onExportar: function(oEvent){

                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('tbl_valeviveres');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');
                aCols = this.createColumnConfig();

                oSettings = {
                    workbook: { columns: aCols },
                    dataSource: oRowBinding,
                    fileName: 'ValeViveres.xlsx',
                    worker: false // We need to disable worker because we are using a Mockserver as OData Service
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });

            },

            createColumnConfig: function () {
                var aCols = [];
                const title = [];
                const table = this.byId('tbl_valeviveres');
                let tableColumns = table.getColumns();
                const dataTable = table.getBinding('items').oList;
                    /**
                 * Obtener solo las opciones que se exportarán
                 */
                for (let i = 0; i < tableColumns.length; i++) {
                    let header = tableColumns[i].getAggregation('header');
                    if (header) {
                        let headerColId = tableColumns[i].getAggregation('header').getId();
                        let headerCol = sap.ui.getCore().byId(headerColId);
                        let headerColValue = headerCol.getText();
                            title.push(headerColValue);
                    }
                }
                    title.pop();
                    /**
                 * Combinar los títulos y los campos de la cabecera
                 */
                const properties = title.map((t, i) => {
                    return {
                        column: t,
                        key: this.dataTableKeys[i]
                    }
                })
                    properties.forEach(p => {
                    const typeValue = typeof dataTable[0][p.key];
                    let propCol = {
                        label: p.column,
                        property: p.key
                    };
                        switch (typeValue) {
                        case 'number':
                            propCol.type = EdmType.Number;
                            propCol.scale = 0;
                            break;
                        case 'string':
                            propCol.type = EdmType.String;
                            propCol.wrap = true;
                            break;
                    }
                        aCols.push(propCol);
                });
                    return aCols;
            },

            //
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
                this.getView().getModel("modelValeViveres").setProperty("/SearchCliente", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchValeVieres", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchEmbarcacion", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchPlanta", {});
                this.getView().getModel("modelValeViveres").setProperty("/SearchAlmacen", {});
                this.getView().getModel("modelValeViveres").setProperty("/ValeAnula", {});
                this.getView().getModel("modelValeViveres").setProperty("/VerDetalle", {});
                this.CargaTemporada();
                this.CargaIndPropiedad();


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
					var kunnrSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var name1Selected = self.getView().getModel('modelValeViveres').getProperty(path);
					var stcd1Selected = self.getView().getModel('modelValeViveres').getProperty(path);
					var kunnr = kunnrSelected.KUNNR;
					var name1 = name1Selected.NAME1;
					var stcd1 = stcd1Selected.STCD1;

					self.getView().getModel('modelValeViveres').setProperty("/SearchCliente/KUNNR",kunnr);
					self.getView().getModel('modelValeViveres').setProperty("/SearchCliente/NAME1",name1);
					self.getView().getModel('modelValeViveres').setProperty("/SearchCliente/STCD1",stcd1);
					self._onCloseDialogArmadorComercial();
            },

            //
            _onpress_plantalink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var werksSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var cdptaSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var descrSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var werks = werksSelected.WERKS;
					var cdpta = cdptaSelected.CDPTA;
					var descr = descrSelected.DESCR;
					

					self.getView().getModel('modelValeViveres').setProperty("/SearchPlanta/WERKS",werks);
					self.getView().getModel('modelValeViveres').setProperty("/SearchPlanta/CDPTA",cdpta);
					self.getView().getModel('modelValeViveres').setProperty("/SearchPlanta/DESCR",descr);
					self._onCloseDialogPlanta();
            },

            _onpress_Almacenlink: function (oEvent) {
                    
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    var self = this;
                    var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelValeViveres.sPath;
					var cdalmSelected = self.getView().getModel('modelValeViveres').getProperty(path);
					var dsalmSelected = self.getView().getModel('modelValeViveres').getProperty(path);
                    var cdptaSelected = self.getView().getModel('modelValeViveres').getProperty(path);
                    var cdaleSelected = self.getView().getModel('modelValeViveres').getProperty(path);
                    
                    var cdalm = cdalmSelected.CDALM;
					var dsalm = dsalmSelected.DSALM;
                    var cdpta = cdptaSelected.CDPTA;
                    var cdale = cdaleSelected.CDALE;


					self.getView().getModel('modelValeViveres').setProperty("/SearchAlmacen/CDALM",cdalm);
					self.getView().getModel('modelValeViveres').setProperty("/SearchAlmacen/DSALM",dsalm);
                    self.getView().getModel('modelValeViveres').setProperty("/SearchAlmacen/CDPTA",cdpta);
                    self.getView().getModel('modelValeViveres').setProperty("/SearchAlmacen/CDALE",cdale);
                    self._getDialogAlmacen().close();
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
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);

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
                //var inprp = self.getView().getModel6("modelValeViveres").getProperty("/SearchPlanta").INPRP;

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
                //if (inprp) options.push({ cantidad: "40", control: "INPUT", "key": "INPRP", valueHigh: "", valueLow: inprp }); 
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);                
            
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
                
                self.ejecutarReadTable(table, options, user, numfilas, model, property);

            },
            //

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
                var nrvvi = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").NRVVI;
                var nmemb = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").NMEMB;
                var arcmc = self.getView().getModel("modelValeViveres").getProperty("/SearchCliente").KUNNR;
                var cdemb = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").CDEMB;
                var cdtpo = self.getView().getModel("modelValeViveres").getProperty("/SearchPlanta").WERKS;
                var cdpta = self.getView().getModel("modelValeViveres").getProperty("/SearchAlmacen").CDALM;
                var cdalm = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").CDTPO;
                var inprp = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").INPRP;
                var numfilas = self.getView().getModel("modelValeViveres").getProperty("/SearchValeVieres").Numfilas;

                if(!nrvvi) nrvvi = "";
                if(!nmemb) nmemb = "";
                if(!arcmc) arcmc = "";
                if(!cdemb) cdemb = "";
                if(!cdtpo) cdtpo = "";
                if(!cdpta) cdpta = "";
                if(!cdalm) cdalm = "";
                if(!inprp) inprp = "";

                var nrvviAux = "NRVVI LIKE '"+ nrvvi +"'";
                var nmembAux = "NMEMB LIKE '"+ nmemb +"'";
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

                if (nrvvi) options.push({ text: nrvviAux });
                if (nmemb) options.push({ text: nmembAux });
                if (arcmc) options.push({ text: arcmcAux });
                if (cdemb) options.push({ text: cdembAux });
                if (cdtpo) options.push({ text: cdtpoAux });
                if (cdpta) options.push({ text: cdptaAux });
                if (cdalm) options.push({ text: cdalmAux });
                if (inprp) options.push({ text: inprpAux });
                
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
                        }, true);
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
