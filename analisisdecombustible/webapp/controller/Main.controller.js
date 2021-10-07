  sap.ui.define([
    "sap/ui/core/mvc/Controller"
    //"sap/m/MessageBox",
    //"sap/m/MessageToast",
    //"sap/ui/model/Filter",
    //"sap/ui/model/FilterOperator"
    //, MessageBox, MessageToast, Filter, FilterOperator
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("tasa.com.analisisdecombustible.controller.Main", {
			onInit: function () {
            //    this.getView().getModel("modelReqPesca").setProperty("/Search", {});
            //    this.getView().getModel("modelReqPesca").setProperty("/SearchPlanta", {});
            //    this.getView().getModel("modelReqPesca").setProperty("/NewReg", {});
            //    this.getLogonUser();
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

