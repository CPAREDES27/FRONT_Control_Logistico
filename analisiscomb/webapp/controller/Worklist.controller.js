sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
], function (BaseController,
	JSONModel,
	formatter,
	Filter,
	FilterOperator,
	Fragment,
	MessageBox,
	ExportTypeCSV,
	Export,
	exportLibrary,
	Spreadsheet) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var EdmType = exportLibrary.EdmType;
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
			var ZCDMMACOM=null;
			var ZD_TPIMPU=null;
			var body={
				"dominios": [
				  {
					"domname": "ZCDMMACOM",
					"status": "A"
				  },
				  {
					"domname": "ZD_TPIMPU",
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
			
				
				ZCDMMACOM= data.data.find(d => d.dominio == "ZCDMMACOM").data;
				ZD_TPIMPU= data.data.find(d => d.dominio == "ZD_TPIMPU").data;
				this.getModel("Estado").setProperty("/ZCDMMACOM", ZCDMMACOM);
				this.getModel("EstadoGrilla").setProperty("/ZD_TPIMPU", ZD_TPIMPU);
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
			console.log(body);
			fetch(`${mainUrlServices}analisiscombustible/Listar`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				console.log(data.str_csmar);
				for(var i=0;i<data.str_csmar.length;i++){
					var comboKey=data.str_csmar[i].CDIMP;
					// comboKey=comboKey.substring(1,2);
					// console.log(comboKey);
					data.str_csmar[i].comboKey=comboKey;
					if(data.str_csmar[i].CNOBS>0){
						data.str_csmar[i].estado=true;
					}else{
						data.str_csmar[i].estado=false;
					}
					if(data.str_csmar[i].ESPRO==="P"){
						data.str_csmar[i].SoloLecturaAjustComb=false;
						data.str_csmar[i].estadoCheck=false;
						data.str_csmar[i].estadoCombo=false;
					}else{
						data.str_csmar[i].SoloLecturaAjustComb=true;
						data.str_csmar[i].estadoCombo=true;
						if(data.str_csmar[i].CONSU>0){
							data.str_csmar[i].estadoCheck=true;
						}else{
							data.str_csmar[i].estadoCheck=false;
						}
						
					}
				}
				
				this.getView().getModel("Combustible").setProperty("/listaCombustible",data.str_csmar);
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
			
		onCargarConsumo: function(){
			oGlobalBusyDialog.open();
			var table = this.byId("table");
			console.log(table);
			var array=table.oPropagatedProperties.oModels.Combustible.oData.listaCombustible;
			var newArray=[];
			var contador=0;
			for(var i=0;i<array.length;i++){
				if(array[i].estadoCheck===true){
					newArray[contador]=array[i];
					contador++;
				}
			}
			console.log(newArray);
			console.log(newArray.length);
			var arraySend=[];

			for(var j=0;j<newArray.length;j++){
				arraySend.push({
					"cdemb": newArray[j].CDEMB,
					"cdim2": newArray[j].CDIM2,
					"cdimp": newArray[j].CDIMP,
					"cdmma": newArray[j].CDMMA,
					"cncal": newArray[j].CNCAL,
					"cnobs": newArray[j].CNOBS,
					"cnpds": newArray[j].CNPDS,
					"cnsum": newArray[j].CNSUM,
					"cons2": newArray[j].CONS2,
					"consu": newArray[j].CONSU,
					"dsmma": newArray[j].DSMMA,
					"dsob2": newArray[j].DSOB2,
					"dsobs": newArray[j].DSOBS,
					"espr2": newArray[j].ESPR2,
					"espro": newArray[j].ESPRO,
					"fecar": this.castFecha2(newArray[j].FECAR),
					"fecconmo2": "",
					"fecconmov": this.castFecha2(newArray[j].FECCONMOV),
					"fecza": this.castFecha2(newArray[j].FECZA),
					"femar": this.castFecha2(newArray[j].FEMAR),
					"fxmar": this.castFecha2(newArray[j].FXMAR),
					"hamar": this.castHora2(newArray[j].HAMAR),
					"hiarr": this.castHora2(newArray[j].HIARR),
					"hizar": this.castHora2(newArray[j].HIZAR),
					"hoaa1": newArray[j].HOAA1,
					"hoaa2": newArray[j].HOAA2,
					"hoaa3": newArray[j].HOAA3,
					"hoaa4": newArray[j].HOAA4,
					"hoaa5": newArray[j].HOAA5,
					"hoafp": newArray[j].HOAFP,
					"hoamp": newArray[j].HOAMP,
					"hoapa": newArray[j].HOAPA,
					"hodfp": newArray[j].HODFP,
					"hodmp": newArray[j].HODMP,
					"hoha1": newArray[j].HOHA1,
					"hoha2": newArray[j].HOHA2,
					"hoha3": newArray[j].HOHA3,
					"hoha4": newArray[j].HOHA4,
					"hoha5": newArray[j].HOHA5,
					"hohfp": newArray[j].HOHFP,
					"hohmp": newArray[j].HOHMP,
					"hohpa": newArray[j].HOHPA,
					"hoza1": newArray[j].HOZA1,
					"hoza2": newArray[j].HOZA2,
					"hoza3": newArray[j].HOZA3,
					"hoza4": newArray[j].HOZA4,
					"hoza5": newArray[j].HOZA5,
					"hozfp": newArray[j].HOZFP,
					"hozmp": newArray[j].HOZMP,
					"hozpa": newArray[j].HOZPA,
					"hxmar": this.castHora2(newArray[j].HXMAR),
					"nmemb": newArray[j].NMEMB,
					"nrmar": newArray[j].NRMAR,
					"ptoar": newArray[j].PTOAR,
					"ptoza": newArray[j].PTOZA,
					"stcmb": newArray[j].STCMB,
					"stfin": newArray[j].STFIN,
					"werks": newArray[j].WERKS,
					"zcdzar": newArray[j].ZCDZAR
				});
			}
			var body={
				"fieldsStr_csmaj": [
				  
				],
				"fieldsStr_csmar": [
				  
				],
				"fieldsStr_lgcco": [
				  
				],
				"fieldsT_mensaje": [
				  
				],
				"option": [
				  
				],
				"options": [
				  
				],
				"p_canti": "0",
				"p_lcco": "",
				"p_tope": "N",
				"p_user": "FGARCIA",
				"str_csmar": arraySend,
				"str_lgcco": [
				 
				]
			}

			console.log(body);
			fetch(`${mainUrlServices}logregistrocombustible/Nuevo`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				console.log(data);
				var mensaje="";
				
				MessageBox.alert(mensaje,{
					title: "Información",
				});
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);
		},
		castFecha2: function(fecha){
			if(fecha==="null" || fecha===""){
				return "";
			}
			var fechaFinal = fecha.split("/");
			
			return fechaFinal[2]+fechaFinal[1]+fechaFinal[0];
		},
		castHora2: function(hora){
			hora=hora+":00";
			console.log(hora);
			var fechaFinal = hora.split(":");
			
			return fechaFinal[0]+fechaFinal[1]+fechaFinal[2];
		},
		onExporQlikView: function(){
			oGlobalBusyDialog.open();
			var idEmbarcacion=this.byId("idEmbarcacion").getValue();
			var idFechaInicio=this.byId("idFechaInicio").mProperties.dateValue;
			var idFechaFin=this.byId("idFechaInicio").mProperties.secondDateValue;
			var idEstado=this.byId("idEstado").getSelectedKey();
			var idCant =this.byId("idCant").getValue();
			if(!idFechaInicio&&!idFechaFin){
				MessageBox.error("No se ingresó un rango de fechas para la búsqueda");
				oGlobalBusyDialog.close();
				return false;
			}
			var idFechaIni=this.castFecha(idFechaInicio);
			var idFechaF=this.castFecha(idFechaFin);
			var body={
				"pCdemb": idEmbarcacion,
				"pCdmma": idEstado,
				"pFfevn": idFechaF,
				"pFievn": idFechaIni,
				"pRow": idCant
			}
			console.log(body);
			fetch(`${mainUrlServices}analisiscombustible/QlikView`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then(resp => resp.json()).then(data => {
			  console.log(data);
			  this.getView().getModel("Qlik").setProperty("/listaQlik",data.str_cef);
			  console.log(this.getView().getModel("Qlik"));
			  this.onExport();
			  oGlobalBusyDialog.close();
			}).catch(error => console.log(error)
		  );

		},
		onDataExportQlikView: function(){
			var oExport = new Export({
				exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
				  separatorChar: ";"
				}),
				//PoliticaPrecio>/listaPolitica
				models: this.getView().getModel("Qlik"),
				rows:{path:""},
				rows: { path: "/listaQlik" },
				columns: [
				  {
					name: "CDEMB",
					template: {
					  content: "00000012"
					},
					type: EdmType.String
				  },
				  {
					name: "NRMAR",
					template: {
					  content: "{NRMAR}"
					}
				  },
				  {
					name: "NMEMB",
					template: {
					  content: "{NMEMB}"
					}
				  },
				  {
					name: "CDMMA",
					template: {
					  content: "{CDMMA}"
					}
				  },
				  {
					name: "DSMMA",
					template: {
					  content: "{DSMMA}"
					}
				  },
				  {
					name: "CNPDS",
					template: {
					  content: "{CNPDS}"
					}
				  },
				  {
					name: "HONAV",
					template: {
					  content: "{HONAV}"
					}
				  },
				  {
					name: "HODES",
					template: {
					  content: "{HODES}"
					}
				  },
				  {
					name: "HOPUE",
					template: {
					  content: "{HOPUE}"
					}
				  },
				  {
					name: "HOMAR",
					template: {
					  content: "{HOMAR}"
					}
				  },
				  {
					name: "CONAV",
					template: {
					  content: "{CONAV}"
					}
				  },
				  {
					name: "CODES",
					template: {
					  content: "{CODES}"
					}
				  },
				  {
					name: "COPUS",
					template: {
					  content: "{COPUS}"
					}
				  },
				  {
					name: "COMAR",
					template: {
					  content: "{COMAR}"
					}
				  },
				  {
					name: "RRNAV",
					template: {
					  content: "{RRNAV}"
					}
				  },
				  {
					name: "RRDES",
					template: {
					  content: "{RRDES}"
					}
				  },
				  {
					name: "RRPUE",
					template: {
					  content: "{RRPUE}"
					}
				  },
				  {
					name: "RRMAR",
					template: {
					  content: "{RRMAR}"
					}
				  },
				  {
					name: "RPNAV",
					template: {
					  content: "{RPNAV}"
					}
				  },
				  {
					name: "RPDES",
					template: {
					  content: "{RPDES}"
					}
				  },
				  {
					name: "RPPUE",
					template: {
					  content: "{RPPUE}"
					}
				  },
				  {
					name: "RPMAR",
					template: {
					  content: "{RPMAR}"
					}
				  },
				  {
					name: "FEPRD",
					template: {
					  content: "{FEPRD}"
					}
				  }

				]
			  });
			  oExport.saveFile("Control de Combustible - QLIKVIEW").catch(function(oError) {
				MessageBox.error("Error when downloading data. ..." + oError);
			  }).then(function() {
				oExport.destroy();
			  });
		},
		createColumnConfig: function() {
			return [
				{
					label: 'CDEMB',
					property: 'CDEMB',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'NRMAR',
					property: 'NRMAR',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'NMEMB',
					property: 'NMEMB',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'CDMMA',
					property: 'CDMMA',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'DSMMA',
					property: 'DSMMA',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'CNPDS',
					property: 'CNPDS',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'HONAV',
					property: 'HONAV',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'HODES',
					property: 'HODES',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'HOPUE',
					property: 'HOPUE',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'CONAV',
					property: 'CONAV',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'CODES',
					property: 'CODES',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'COPUS',
					property: 'COPUS',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'COMAR',
					property: 'COMAR',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'RRNAV',
					property: 'RRNAV',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'RRDES',
					property: 'RRDES',
					type: EdmType.String
				},
				{
					label: 'RRPUE',
					property: 'RRPUE',
					type: EdmType.String
				},
				{
					label: 'RRMAR',
					property: 'RRMAR',
					type: EdmType.String
				},
				{
					label: 'RPNAV',
					property: 'RPNAV',
					type: EdmType.String
				},
				{
					label: 'RPDES',
					property: 'RPDES',
					type: EdmType.String
				},
				{
					label: 'RPPUE',
					property: 'RPPUE',
					type: EdmType.String
				},
				{
					label: 'RPMAR',
					property: 'RPMAR',
					type: EdmType.String
				},
				{
					label: 'FEPRD',
					property: 'FEPRD',
					type: EdmType.String
				}];
		},
		onExport: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig();
			console.log(this.getView().getModel("Qlik"));
			aProducts = this.getView().getModel("Qlik").getProperty('/listaQlik');

			oSettings = {
				
				workbook: { 
					columns: aCols,
					context: {
						application: 'Debug Test Application',
						version: '1.95.0',
						title: 'Some random title',
						modifiedBy: 'John Doe',
						metaSheetName: 'Custom metadata'
					}
					
				},
				dataSource: aProducts,
				fileName:"CONTROL DE COMBUSTIBLE - QLIKVIEW"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
		},

		onDetail: async function(oEvent){
			oGlobalBusyDialog.open();
			var cadena=oEvent.getSource().getBindingContext("Combustible").getPath().split("/")[2];
			var array=this.getView().getModel("Combustible").oData.listaCombustible[cadena];
			console.log(array.CDMMA);
			if(array.CDMMA==="7"||array.CDMMA==="8"){
				await this.getCuadroAnalisis(array.NRMAR);
				this._onOpenDialogArmador();
				sap.ui.getCore().byId("idMarea").setText(array.NRMAR);
				sap.ui.getCore().byId("idCalas").setText(array.CNCAL);
				sap.ui.getCore().byId("idEmbarcacion").setText(array.NMEMB);
				sap.ui.getCore().byId("idZarpe").setText(array.DESC_CDMMA);
				oGlobalBusyDialog.close();
				sap.ui.getCore().byId("idMotMarea").setText("  MotMarea: "+array.CDMMA);
			}else{
				await this.getCuadroAnalisis2(array.NRMAR);
				this._onOpenDialogArmador2();
				sap.ui.getCore().byId("idMarea2").setText(array.NRMAR);
				sap.ui.getCore().byId("idCalas2").setText(array.CNCAL);
				sap.ui.getCore().byId("idEmbarcacion2").setText(array.NMEMB);
				sap.ui.getCore().byId("idZarpe2").setText(array.DESC_CDMMA);
				sap.ui.getCore().byId("idFechaP").setText(array.FECCONMOV);
				sap.ui.getCore().byId("idCant").setText(array.CNPDS);
				sap.ui.getCore().byId("idMotMarea2").setText("  MotMarea: "+array.CDMMA);
			}
			
		},
		
		//
		getCuadroAnalisis: async function(idMarea){
			oGlobalBusyDialog.open();
			var body={
				"fields": [
				  
				],
				"p_nrmar": idMarea,
				"p_user": "FGARCIA"
			}

			await fetch(`${mainUrlServices}analisiscombustible/Detalle`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				console.log(data.data);
				this.getView().getModel("ConsumoTwo").setProperty("/listaConsumoTwo",data.data);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);

		},
		getCuadroAnalisis2: async function(idMarea){
			oGlobalBusyDialog.open();
			var body={
				"fields": [
				  
				],
				"p_nrmar": idMarea,
				"p_user": "FGARCIA"
			}

			await fetch(`${mainUrlServices}analisiscombustible/Detalles`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				console.log(data);
				this.getView().getModel("Analisis").setProperty("/listaAnalisis",data.str_detf);
				this.getView().getModel("Reporte").setProperty("/listaReporte",data.str_fase);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);

		},


		_onOpenDialogArmador2: function() {
				
			this._getDialogArmador2().open();
		},

		_onCloseDialogArmador2: function() {
			this._getDialogArmador2().close();
	
			
		},

		_getDialogArmador2 : function () {
			if (!this._oDialogArmador2) {
				this._oDialogArmador2 = sap.ui.xmlfragment("com.tasa.analisiscomb.view.Consumo", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador2);
				
			}
			
			return this._oDialogArmador2;
		},

		//


		_onOpenDialogArmador: function() {
				
			this._getDialogArmador().open();
		},

		_onCloseDialogArmador: function() {
			this._getDialogArmador().close();
	
			
		},

		_getDialogArmador : function () {
			if (!this._oDialogArmador) {
				this._oDialogArmador = sap.ui.xmlfragment("com.tasa.analisiscomb.view.Consumo2", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador);
				
			}
			
			return this._oDialogArmador;
		},
	});
});