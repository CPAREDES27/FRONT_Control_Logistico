sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,ExportTypeCSV,Export,MessageBox) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var JsonFechaIni={
		fechaIni:"",
		fechaIni2:""
	};
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	return BaseController.extend("com.tasa.consultahorom.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			
			this.listaEmbarcacion();
		},
		listaEmbarcacion: function(){
			
			var body={
				"option": [
					
				],
				"option2": [
				   
				],
				"options": [
				  
				],
				"options2": [
				 {
					 "cantidad":"10",
					 "control":"COMBOBOX",
					 "key":"ESEMB",
					 "valueHigh":"",
					 "valueLow":"0"

				 }
				],
				"p_user": "BUSQEMB"
			  }
			  fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data.data;
					console.log(dataPuerto);
					console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
				  }).catch(error => console.log(error)
				  );
		},
		onBusqueda: function(){
			oGlobalBusyDialog.open();
			
			var idEmbarcacionIni = this.byId("idEmbarcacionIni").getValue();
			var idFechaIni = this.byId("idFecha").mProperties.dateValue;
			var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
			console.log(this.byId("idFecha"));
			if(!this.byId("idFecha").mProperties.dateValue){
				MessageBox.error("Debe ingresar un rango de fechas");
				oGlobalBusyDialog.close();
				return false;
			}
			var dateIni = new Date(idFechaIni);
			var mesIni;
			var diaIni;
			mesIni=dateIni.getMonth()+1;
			diaIni=dateIni.getDate();
			if(mesIni<10){
				mesIni= this.zeroFill(mesIni,2);
			}
			if(diaIni<10){
				diaIni= this.zeroFill(diaIni,2);
			}
			var fechaIni = dateIni.getFullYear()+""+mesIni+""+diaIni;
			var dateFin = new Date(idFechaFin);
			var mesFin;
			var diaFin;
			mesFin=dateFin.getMonth()+1;
			diaFin=dateFin.getDate();
			if(mesFin<10){
				mesFin= this.zeroFill(mesFin,2);
			}
			if(diaFin<10){
				diaFin= this.zeroFill(diaFin,2);
			}
			var fechaFin = dateFin.getFullYear()+""+mesFin+""+diaFin;
			console.log(fechaIni);
			console.log(fechaFin);
			var body={
				"fieldStr_emb": [
				],
				"fieldStr_evn": [
				],
				"fieldStr_lho": [
				],
				"fieldT_mensaje": [
				],
				"p_cdemb": idEmbarcacionIni,
				"p_ffevn": fechaFin,
				"p_fievn": fechaIni,
				"p_user": "FGARCIA"
			  }
			  console.log(body);
			fetch(`${mainUrlServices}consultahorometro/Listar/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataHorometro = data.listaHorometro;
					
						this.getView().getModel("Horometro").setProperty("/listaHorometro",dataHorometro);
						oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
					  );
		},
		buscarFecha: function(oEvent){
                debugger;
			var dateIni= new Date(oEvent.mParameters.from);
			var dateIni2 = new Date(oEvent.mParameters.to);
			if(oEvent.mParameters.from==null){
				dateIni="";	
			}
			if(oEvent.mParameters.to==null){
				dateIni2="";	
			}
			var id=oEvent.mParameters.id;
			var fechaIni="";
			var fechaIni2="";
			if(dateIni){
				 fechaIni=this.generateFecha(dateIni);
			}
			if(dateIni2){
				 fechaIni2=this.generateFecha(dateIni2);
			}

			console.log(fechaIni);
			console.log(fechaIni2);
			
			if(id==="application-politicadeprecios-display-component---App--idFechaIniVigencia")
			{
				JsonFechaIni={
					fechaIni:fechaIni,
					fechaIni2:fechaIni2
				}
			}else{
				JsonFechaFin={
					fechaFin:fechaIni,
					fechaFin2:fechaIni2
				}
			}
		   
			console.log(JsonFechaIni);
			console.log(JsonFechaFin);
		   
		},
		generateFecha: function(date){
			var day=date.getDate();
			var anio=date.getFullYear();
			var mes=date.getMonth()+1;
			if(mes<10){
				mes=this.zeroFill(mes,2);
			}
			if(day<10){
				day=this.zeroFill(day,2);
			}
			var fecha= anio.toString()+mes.toString()+day.toString();
		   
		   
			return fecha;
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
		onDataExport:  function() {
			var oExport = new Export({
				exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
				  separatorChar: ";",
				  charset: "utf-8"
				}),
				//PoliticaPrecio>/listaPolitica
				models: this.getView().getModel("Horometro"),
				rows:{path:""},
				rows: { path: "/listaHorometro" },
				columns: [
				  {
					name: "fecha",
					template: {
					  content: "{fecha}"
					}
				  },
				  {
					name: "Motor Principal",
					template: {
					  content: "{motorPrincipal}"
					}
				  },
				  {
					name: "Motor Auxiliar 1",
					template: {
					  content: "{motorAuxiliar}"
					}
				  },
				  {
					name: "Motor Auxiliar 2",
					template: {
					  content: "{motorAuxiliar2}"
					}
				  },
				  {
					name: "Motor Auxiliar 3",
					template: {
					  content: "{motorAuxiliar3}"
					}
				  },
				  {
					name: "Motor Auxiliar 4",
					template: {
					  content: "{motorAuxiliar4}"
					}
				  },
				  {
					name: "Motor Auxiliar 5",
					template: {
					  content: "{motorAuxiliar5}"
					}
				  },
				  {
					name: "Panga",
					template: {
					  content: "{panga}"
					}
				  },
				  {
					name: "Flujometro",
					template: {
					  content: "{flujometro}"
					}
				  }
				]
			  });
			  oExport.saveFile("Politica de Precios").catch(function(oError) {
				MessageBox.error("Error when downloading data. ..." + oError);
			  }).then(function() {
				oExport.destroy();
			  });
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
					  onLimpiar: function(){
						  this.byId("idEmbarcacionIni").setValue("");
						  this.byId("idFecha").setValue("");
					  }

	

	});
});