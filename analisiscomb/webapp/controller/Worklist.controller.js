sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (BaseController,
	JSONModel,
	formatter,
	Filter,
	FilterOperator,
	Fragment,
	MessageBox) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	return BaseController.extend("com.tasa.analisiscomb.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			this.loadCombos();			
		},

		loadCombos: function(){
			oGlobalBusyDialog.open();
			var ZCDMMA=null;
			var body={
				"dominios": [
				  {
					"domname": "ZCDMMACOM",
					"status": "A"
				  }
				]
			  }

			  fetch(`${mainUrlServices}dominios/Listar`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				var dataPuerto=data;
			
				
				ZCDMMA= data.data.find(d => d.dominio == "ZCDMMACOM").data;
				this.getModel("Estado").setProperty("/ZCDMMA", ZCDMMA);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);
		},
		onBusqueda: function(){
			oGlobalBusyDialog.open();
			var idFechaInicio=this.byId("idFechaInicio").mProperties.dateValue;
			var idFechaFin=this.byId("idFechaInicio").mProperties.secondDateValue;
			var idEmbarcacion=this.byId("idEmbarcacion").getValue();
			var idEstado=this.byId("idEstado").getSelectedKey();
			var idCant=this.byId("idCant").getValue();
			console.log(idFechaInicio);
			console.log(idFechaFin);
			if(!idFechaInicio){
				MessageBox.error("Debe ingresar una fecha de inicio");
				oGlobalBusyDialog.close();
				return false;
			}
			var idFechaIni=this.castFecha(idFechaInicio);
			var idFechaF=this.castFecha(idFechaFin);
			console.log(idFechaIni);
			console.log(idFechaF);
			var body={
				"embarcacionIni": idEmbarcacion,
				"fechaFin": idFechaF,
				"fechaIni": idFechaIni,
				"motivoIni": idEstado,
				"p_row": idCant,
				"p_user": "FGARCIA"
			}
			fetch(`${mainUrlServices}analisiscombustible/Listar`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				console.log(data);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);

		},
		castFecha: function(idFechaInicio){
			var fechaIni = new Date(idFechaInicio);
			var mes = fechaIni.getMonth()+1;
			var day= fechaIni.getDate();
			var anio = fechaIni.getFullYear();
			if(mes<10){
				mes=this.zeroFill(mes,2);
			}
			if(day<10){
				day=this.zeroFill(day,2);
			}
			return anio+""+mes+""+day;
		},
		zeroFill: function( number, width )
		{
				width -= number.toString().length;
				if ( width > 0 )
				{
					return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
				}
				return number + ""; // siempre devuelve tipo cadena
		},
		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;
  
				  if (sQuery) {
					  this._oGlobalFilter = new Filter([
						  new Filter("fecha", FilterOperator.Contains, sQuery),
						  new Filter("motorPrincipal", FilterOperator.Contains, sQuery),
						  
						  
					  ], false);
				  }
  
				  this._filter();
		},
		 _filter : function() {
			var oFilter = null;
		  
			if (this._oGlobalFilter && this._oPriceFilter) {
			oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
			  oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
			  oFilter = this._oPriceFilter;
			}
		  	this.byId("table").getBinding().filter(oFilter, "Application");
		},
			

	});
});