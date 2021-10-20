  sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageBox, MessageToast, Filter, FilterOperator) {
		"use strict";

		return Controller.extend("tasa.com.analisisdecombustible.controller.Main", {
			onInit: function () {
                this.getView().getModel("modelControlLog").setProperty("/SearchMain", {});
                this.getView().getModel("modelControlLog").setProperty("/SearchEmbarcacion", {});
                this.getView().getModel("modelControlLog").setProperty("/SearchDetalle", {});
            //    this.getLogonUser();
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
       
        _onOpenDialogEmbarcacion: function () {
            this._getDialogEmbarcacion().open();
        },

        _onCloseDialogEmbarcacion: function() {
            this._getDialogEmbarcacion().close();
        },        

        _getDialogEmbarcacion: function () {
            if (!this._oDialogEmbarcacion) {
                this._oDialogEmbarcacion = sap.ui.xmlfragment("tasa.com.analisisdecombustible.view.DlgEmbarcacion", this.getView().getController());
                this.getView().addDependent(this._oDialogEmbarcacion);
            }
            return this._oDialogEmbarcacion;
        },

        _onBucarEmbarcacion: function() {
        var urlNodeJS = "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com";
                        
                var self = this;
                var cdemb = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").CDEMB;
                var nmemb = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").NMEMB;
                var stcd1 = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").STCD1; 
                var mremb = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").MREMB;
                var inprp = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").INPRP;
                var name1 = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").NAME1;

                var numfilas = self.getView().getModel("modelControlLog").getProperty("/SearchEmbarcacion").Numfilas;
            
                if (!numfilas) numfilas = 50;
                            
                var table = "ZV_FLEB";
                var user = "FGARCIA";
                var model = "modelControlLog";
                var property = "/ListACombustible";

                var options = [];
                if (cdemb) options.push({ cantidad: "40", control: "INPUT", "key": "CDEMB", valueHigh: "", valueLow: cdemb }); 
                if (nmemb) options.push({ cantidad: "40", control: "INPUT", "key": "NMEMB", valueHigh: "", valueLow: nmemb }); 
                if (stcd1) options.push({ cantidad: "40", control: "INPUT", "key": "STCD1", valueHigh: "", valueLow: stcd1 }); 
                if (mremb) options.push({ cantidad: "40", control: "INPUT", "key": "MREMB", valueHigh: "", valueLow: mremb }); 
                if (inprp) options.push({ cantidad: "40", control: "COMBOBOX", "key": "INPRP", valueHigh: "", valueLow: inprp }); 
                if (name1) options.push({ cantidad: "40", control: "INPUT", "key": "NAME1", valueHigh: "", valueLow: name1 }); 

                self.ejecutarReadTable(table, options, user, numfilas, model, property);

        },
        
        _onpress_embarcacionlinkCLog: function (oEvent) {
            var self = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var path = oEvent.getSource().oPropagatedProperties.oBindingContexts.modelControlLog.sPath;
            var cdptaSelected = this.getView().getModel('modelControlLog').getProperty(path);
            var werksSelected = this.getView().getModel('modelControlLog').getProperty(path);
            var viewCall = self.getView().getModel("modelControlLog").getProperty("/ViewCall");
            var nmemb = nmembSelected.NMEMB;
            var cdemb = cdembSelected.CDEMB;

            if (viewCall === "SearchEmbarcacion") {
                self.getView().getModel("modelControlLog").setProperty("/SearchEmbarcacion/NMEMB",nmemb);
            } else {
                self.getView().getModel("modelControlLog").setProperty("/SearchMain/CDEMB",cdemb);
            } 
            
            this._onCloseDialogCentro();    

        },
        
        _onOpenDialogBotonPruebaDetalle: function () {
            this._getDialogBotonPruebaDetalle().open();
        },

         
        _onCloseDialogBotonPruebaDetalle: function() {
            this._getDialogBotonPruebaDetalle().close();
        },  

        _getDialogBotonPruebaDetalle: function () {
            if (!this._oDialogBotonPruebaDetalle) {
                this._oDialogBotonPruebaDetalle = sap.ui.xmlfragment("tasa.com.analisisdecombustible.view.DlgDetalleControlLogistico", this.getView().getController());
                this.getView().addDependent(this._oDialogBotonPruebaDetalle);
            }
            return this._oDialogBotonPruebaDetalle;
        }


		}); 
	}); 

