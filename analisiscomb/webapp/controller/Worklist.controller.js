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
	"sap/ui/core/BusyIndicator"
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
	Spreadsheet,
	BusyIndicator) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var EdmType = exportLibrary.EdmType;
	var bEmbarcacion=false;
	var listaAnalisis=false;
	var fechaInicio="";
	var fechaFin="";
	var codFase="";
	var exportarExcel=false;
	const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
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
			let ViewModel= new JSONModel(
				{}
				);
				this.setModel(ViewModel, "consultaMareas");
		this.currentInputEmba = "";
			this.primerOption = [];
			this.segundoOption = [];
			this.currentPage = "";
			this.lastPage = "";
			this.loadCombos();	


		},

		loadCombos: function(){
			oGlobalBusyDialog.open();
			var ZCDMMACOM=null;
			var ZD_TPIMPU=null;
			var ZINPRP=null;
			var body={
				"dominios": [
				  {
					"domname": "ZCDMMACOM",
					"status": "A"
				  },
				  {
					"domname": "ZD_TPIMPU",
					"status": "A"
				  },
				  {
					"domname": "ZINPRP",
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
				ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
				this.getModel("Propiedad").setProperty("/ZINPRP", ZINPRP);
				this.getModel("Estado").setProperty("/ZCDMMACOM", ZCDMMACOM);
				this.getModel("EstadoGrilla").setProperty("/ZD_TPIMPU", ZD_TPIMPU);
				console.log(ZCDMMACOM);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);
		},
		validaState:function(){
			if(this.byId("idFechaInicio").getValue){
				this.getView().byId('idFechaInicio').setValueState();
			}
		},
		onLimpiar: function(){
			this.byId("inputId0_R").setValue("");
			this.byId("idFechaInicio").setValue("");
			this.byId("idEstado").setValue("");
		},
		parseMil: function(price){
			var num = price;
			num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
			num = num.split('').reverse().join('').replace(/^[\.]/,'');
			return(num)
		},
		onBusqueda: function(){
			oGlobalBusyDialog.open();
			var idFechaInicio=this.byId("idFechaInicio").mProperties.dateValue;
			var idFechaFin=this.byId("idFechaInicio").mProperties.secondDateValue;
			var idEmbarcacion=this.byId("inputId0_R").getValue();
			var idEstado=this.byId("idEstado").getSelectedKey();
			var idCant=this.byId("idCant").getValue();
			if(idEmbarcacion){
				console.log("Hola");
				bEmbarcacion=true;
				
			}else{
				bEmbarcacion=false;
			}
			this.getView().getModel("Embarca").setProperty("/valida",bEmbarcacion);
				console.log(this.getView().getModel("Embarca").getProperty("/valida"));
			if(!idFechaInicio){
				MessageBox.error("La fecha de arribo es obligatorio");
				oGlobalBusyDialog.close();
				return false;
			}
			var idFechaIni=this.castFecha(idFechaInicio);
			var idFechaF=this.castFecha(idFechaFin);
			this.fechaInicio=idFechaIni;
			this.fechaFin=idFechaF;
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
				
				console.log(data);
				var tamanio=data.str_csmar.length;
				var dataFinal=data.str_csmar;
				console.log(tamanio);
				var totalCNPDS=0;
				var totalCONSU=0;
				if(data){
					exportarExcel=true;
				}
				for(var i=0;i<data.str_csmar.length;i++){
					
					data.str_csmar[i].CNPDS=String(this.parseMil(data.str_csmar[i].CNPDS));
					data.str_csmar[i].Enable=true;
					data.str_csmar[i].NRMAR=this.zeroFill(data.str_csmar[i].NRMAR,10);
					if(data.str_csmar[i].CNPDS != null && data.str_csmar[i].CNPDS > 0)	{
						data.str_csmar[i].FlagPesca=true;
						data.str_csmar[i].MarcaPesca="X";
					}else{
						data.str_csmar[i].FlagNoPesca=true;
						data.str_csmar[i].MarcaNoPesca="X";
					}
					if((data.str_csmar[i].STCMB>=0)&&(data.str_csmar[i].STFIN>=0) && i>0){
						var dato=data.str_csmar[i].STCMB-data.str_csmar[i-1].STFIN;;
					
						console.log(dato);
						data.str_csmar[i].CANTIDAD = String(dato.toFixed(3));
						
					
					}
					totalCNPDS+=data.str_csmar[i].CNPDS;
					totalCONSU+=data.str_csmar[i].CONSU;
					
					var comboKey=data.str_csmar[i].CDIMP;
					data.str_csmar[i].comboKeyReg="";
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

					//estadoPRE2
					if(data.str_csmar[i].ESPR2==="P"){
						data.str_csmar[i].estadoCheckReg=true;
					}else{
						data.str_csmar[i].estadoCheckReg=false;
						
					}
						
						
					
					
					//estadoPRE2
					
				}
				if(data.str_csmar){
					listaAnalisis=true;
				}
			
				this.getView().getModel("Combustible").setProperty("/listaCombustible",data.str_csmar);
				
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);

		},
		createColumnConfig5: function() {
			return [
				{
					label: 'Num. Marea',
					property: 'NRMAR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Cod. de deEmbarcación',
					property: 'CDEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Nombre deEmbarcación',
					property: 'WERKS' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Motivo',
					property: 'DESC_CDMMA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Puerto de Zarpe',
					property: 'PTOZA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha de Zarpe',
					property: 'FECZA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Hora de Zarpe',
					property: 'HIZAR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Puerto de Arribo',
					property: 'PTOAR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Hora de Arribo',
					property: 'HIARR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha de prod.',
					property: 'FECCONMOV' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Canti. desc. (Tn)',
					property: 'CNPDS' ,
					type: EdmType.Number,
					scale: 3,
					delimiter: true
				},
				{
					label: 'Stock Inicial',
					property: 'STCMB' ,
					type: EdmType.Number,
					scale: 3,
					delimiter: true
				},
				{
					label: 'Suministro',
					property: 'CNSUM' ,
					type: EdmType.Number,
					scale: 3,
					delimiter: true
				},
				{
					label: 'Consumo',
					property: 'CONSU' ,
					type: EdmType.Number,
					scale: 3,
					delimiter: true
				},
				{
					label: 'Stock Final',
					property: 'STFIN' ,
					type: EdmType.Number,
					scale: 3,
					delimiter: true
				},
				{
					label: 'Zarpe MP',
					property: 'HOZMP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe A1',
					property: 'HOZA1' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe A2',
					property: 'HOZA2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe A3',
					property: 'HOZA3' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe A4',
					property: 'HOZA4' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe A5',
					property: 'HOZA5' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe PA',
					property: 'HOZPA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Zarpe FP',
					property: 'HOZFP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo MP',
					property: 'HOAMP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo A1',
					property: 'HOAA1' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo A2',
					property: 'HOAA2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo A3',
					property: 'HOAA3' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo A4',
					property: 'HOAA4' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo A5',
					property: 'HOAA5' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo PA',
					property: 'HOAPA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Arribo FP',
					property: 'HOAFP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descarga MP',
					property: 'HODMP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descarga FP',
					property: 'HODFP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro MP',
					property: 'HOHMP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro A1',
					property: 'HOHA1' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro A2',
					property: 'HOHA2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro A3',
					property: 'HOHA3' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro A4',
					property: 'HOHA4' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro A5',
					property: 'HOHA5' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro PA',
					property: 'HOHPA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Horometro FP',
					property: 'HOHFP' ,
					type: EdmType.String,
					scale: 2
				}
				
				];
		},
		onExportarExcelData: function() {
			oGlobalBusyDialog.open();
			if(!exportarExcel){
				MessageBox.error("Porfavor, realizar una búsqueda antes de exportar");
				oGlobalBusyDialog.close();
				return false;
			}
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig5();
			console.log(this.getView().getModel("Combustible"));
			aProducts = this.getView().getModel("Combustible").getProperty('/listaCombustible');

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
				fileName:"Reporte Análisis de Combustible"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
				oGlobalBusyDialog.close();
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
				for(var i=0;i<data.t_mensaje.length;i++){
					mensaje +=data.t_mensaje[i].DSMIN+"\n";
				}
				
				MessageBox.alert(mensaje,{
					title: "Información",
				});
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);
		},
		castFecha2: function(fecha){
			if(fecha==="null" || fecha==="" || fecha==="-"){
				return "";
			}
			var fechaFinal = fecha.split("/");
			
			return fechaFinal[2]+fechaFinal[1]+fechaFinal[0];
		},
		castHora2: function(hora){
			if(hora==="" || hora===null){
				return "000000";
			}
			hora=hora+":00";
			console.log(hora);
			var fechaFinal = hora.split(":");
			
			return fechaFinal[0]+fechaFinal[1]+fechaFinal[2];
		},
		onExporQlikView: function(){
			oGlobalBusyDialog.open();
			var idEmbarcacion=this.byId("inputId0_R").getValue();
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
			console.log();
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


		//
		
		_onOpenDialogArmador4: function() {
				
			this._getDialogArmador4().open();
		},

		_onCloseDialogArmador4: function() {
			this._getDialogArmador4().close();
	
			
		},

		_getDialogArmador4 : function () {
			if (!this._oDialogArmador4) {
				this._oDialogArmador4 = sap.ui.xmlfragment("com.tasa.analisiscomb.view.Cuadro", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador4);
				
			}
			
			return this._oDialogArmador4;
		},


		//

		_onOpenDialogArmador5: function() {
				
			this._getDialogArmador5().open();
		},

		_onCloseDialogArmador5: function() {
			this._getDialogArmador5().close();
	
			
		},

		_getDialogArmador5 : function () {
			if (!this._oDialogArmador5) {
				this._oDialogArmador5 = sap.ui.xmlfragment("com.tasa.analisiscomb.view.EmbarcacionCuadro", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador5);
				
			}
			
			return this._oDialogArmador5;
		},
		
		onCuadroConsumo: async function(){
			console.log(bEmbarcacion);
			if(!listaAnalisis){
				MessageBox.error("No existe información en la grilla para generar el reporte");
			}else{
				if(bEmbarcacion){
					this._onOpenDialogArmador5();
					sap.ui.getCore().byId("fechaEmbarca").setText(this.byId("idFechaInicio").getValue());
				}else{
					await this.llenarZarpe();
					this._onOpenDialogArmador4();
					sap.ui.getCore().byId("idFecha").setText(this.byId("idFechaInicio").getValue());
				}
			}
			
			
		},
		llenarZarpe: async function(){

			var body={
				"fechaFin": this.fechaFin,
				"fechaIni": this.fechaInicio
			};
			await fetch(`${mainUrlServices}analisiscombustible/AnalisisCombu`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then(resp => resp.json()).then(data => {
				console.log(data.str_cef);
				var totalCONAV=0;
				var totalCODES=0;
				var totalCOPUE=0;
				var totalCOMAR=0;
				for(var i=0;i<data.str_cef.length;i++){
					totalCONAV +=data.str_cef[i].CONAV;
					totalCODES+=data.str_cef[i].CODES
					totalCOPUE+=data.str_cef[i].COPUE
					totalCOMAR+=data.str_cef[i].COMAR
				}
				data.str_cef.push({
					DSMMA:"Total",
					CONAV:totalCONAV,
					CODES: totalCODES,
					COPUE : totalCOPUE,
					COMAR: totalCOMAR
				})
				this.getView().getModel("AnalisisCombustible").setProperty("/listaAnalisisCombustible",data.str_cef);
				console.log(this.getView().getModel("AnalisisCombustible"));
			}).catch(error => console.log(error)
		  );
		},
		onSelectEmba: function(evt){
			var objeto = evt.getParameter("rowContext").getObject();
			if (objeto) {
				var cdemb = objeto.CDEMB;
				if (this.currentInputEmba.includes("inputId0_R")) {
					this.byId("inputId0_R").setValue(cdemb);
				}else if(this.currentInputEmba.includes("embarcacionHigh")){
					this.byId("embarcacionHigh").setValue(cdemb);
				}
				this.getDialog().close();
			}
		},

		onSearchEmbarcacion: function(evt){
			BusyIndicator.show(0);
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
					"control": "INPUT",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacion

				});
			}
			if (idEmbarcacionDesc) {
				options.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacionDesc.toUpperCase()

				});
			}
			if (idMatricula) {
				options.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "MREMB",
					"valueHigh": "",
					"valueLow": idMatricula
				});
			}
			if (idPropiedad) {
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "INPRP",
					"valueHigh": "",
					"valueLow": idPropiedad
				});
			}
			if (idRuc) {
				options2.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": idRuc
				});
			}
			if (idArmador) {
				options2.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NAME1",
					"valueHigh": "",
					"valueLow": idArmador.toUpperCase()
				});
			}

			this.primerOption = options;
			this.segundoOption = options2;

			var body = {
				"option": [

				],
				"option2": [

				],
				"options": options,
				"options2": options2,
				"p_user": "BUSQEMB",
				//"p_pag": "1" //por defecto la primera parte
			};

			fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					console.log("Emba: ", data);
					embarcaciones = data.data;

					this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
					this.getModel("consultaMareas").refresh();

					if (!isNaN(data.p_totalpag)) {
						if (Number(data.p_totalpag) > 0) {
							sap.ui.getCore().byId("goFirstPag").setEnabled(true);
							sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
							sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
							sap.ui.getCore().byId("goLastPag").setEnabled(true);
							sap.ui.getCore().byId("goNextPag").setEnabled(true);
							var tituloTablaEmba = "Página 1/" + Number(data.p_totalpag);
							this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
							var numPag = Number(data.p_totalpag) + 1;
							var paginas = [];
							for (let index = 1; index < numPag; index++) {
								paginas.push({
									numero: index
								});
							}
							this.getModel("consultaMareas").setProperty("/NumerosPaginacion", paginas);
							sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
							this.currentPage = "1";
							this.lastPage = data.p_totalpag;
						} else {
							var tituloTablaEmba = "Página 1/1";
							this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
							this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
							sap.ui.getCore().byId("goFirstPag").setEnabled(false);
							sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
							sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
							sap.ui.getCore().byId("goLastPag").setEnabled(false);
							sap.ui.getCore().byId("goNextPag").setEnabled(false);
							this.currentPage = "1";
							this.lastPage = data.p_totalpag;
						}
					}


					//sap.ui.getCore().byId("comboPaginacion").setVisible(true);

					BusyIndicator.hide();
				}).catch(error => console.log(error));
		},


		onChangePag: function (evt) {
			var id = evt.getSource().getId();
			var oControl = sap.ui.getCore().byId(id);
			var pagina = oControl.getSelectedKey();
			this.currentPage = pagina;
			this.onNavPage();
		},

		onSetCurrentPage: function (evt) {
			var id = evt.getSource().getId();
			if (id == "goFirstPag") {
				this.currentPage = "1";
			} else if (id == "goPreviousPag") {
				if (!isNaN(this.currentPage)) {
					if (this.currentPage != "1") {
						var previousPage = Number(this.currentPage) - 1;
						this.currentPage = previousPage.toString();
					}
				}
			} else if (id == "goNextPag") {
				if (!isNaN(this.currentPage)) {
					if (this.currentPage != this.lastPage) {
						var nextPage = Number(this.currentPage) + 1;
						this.currentPage = nextPage.toString();
					}
				}
			} else if (id == "goLastPag") {
				this.currentPage = this.lastPage;
			}
			this.onNavPage();
		},

		onNavPage: function () {
			BusyIndicator.show(0);
			let embarcaciones = [];
			var body = {
				"option": [

				],
				"option2": [

				],
				"options": this.primerOption,
				"options2": this.segundoOption,
				"p_user": "BUSQEMB",
				"p_pag": this.currentPage
			};

			fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					console.log("Emba: ", data);
					embarcaciones = data.data;

					this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
					this.getModel("consultaMareas").refresh();
					var tituloTablaEmba = "Página " + this.currentPage + "/" + Number(data.p_totalpag);
					this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
					sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
					BusyIndicator.hide();
				}).catch(error => console.log(error));
		},
		getDialog: function(){
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("com.tasa.analisiscomb.view.Embarcacion", this);
				this.getView().addDependent(this.oDialog);
			}
			return this.oDialog;
		},
		onOpenEmba: function(evt){
			this.currentInputEmba = evt.getSource().getId();
			this.getDialog().open();
		},

		
		buscarEmbarca: function(evt){
			console.log(evt);
			var indices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
			console.log(indices);
		
			var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].CDEMB;
			if (this.currentInputEmba.includes("inputId0_R")) {
				this.byId("inputId0_R").setValue(data);
			}else if(this.currentInputEmba.includes("embarcacionHigh")){
				this.byId("embarcacionHigh").setValue(data);
			}
			this.onCerrarEmba();
			
		},
		
		onCerrarEmba: function(){
			this.clearFilterEmba();
			this.getDialog().close();
			this.getModel("consultaMareas").setProperty("/embarcaciones", "");
			this.getModel("consultaMareas").setProperty("/TituloEmba", "");
			sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
			sap.ui.getCore().byId("goFirstPag").setEnabled(false);
			sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
			sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
			sap.ui.getCore().byId("goLastPag").setEnabled(false);
			sap.ui.getCore().byId("goNextPag").setEnabled(false);
			sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
		},
		clearFilterEmba: function(){
			sap.ui.getCore().byId("idEmba").setValue("");
			sap.ui.getCore().byId("idNombEmba").setValue("");
			sap.ui.getCore().byId("idRucArmador").setValue("");
			sap.ui.getCore().byId("idMatricula").setValue("");
			sap.ui.getCore().byId("indicadorPropiedad").setValue("");
			sap.ui.getCore().byId("idDescArmador").setValue("");
			this.getModel("consultaMareas").setProperty("/embarcaciones","");
		},		
		onExportarConsumoEmbarca: function(){

		},
		createColumnConfig2: function() {
			return [
				{
					label: 'Fecha/hora de Zarpe',
					property: ['FECZA','HIZAR'],
					type: EdmType.String,
					template: '{0} {1}'
				},
				{
					label: 'Fecha/hora de Arribo',
					property: ['FECAR','HIARR'],
					type: EdmType.String,
					template: '{0} {1}'
				},
				{
					label: 'ME',
					property: 'MarcaPesca',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'MP',
					property: 'MarcaNoPesca',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Cant. descarga(Tn)',
					property: 'CNPDS',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Consumo (Gln)',
					property: 'CONSU',
					type: EdmType.String,
					scale: 0
				},
				];
		},
		
		onExportCombustible: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig2();
			console.log(this.getView().getModel("AnalisisComb"));
			aProducts = this.getView().getModel("AnalisisComb").getProperty('/listaAnalisisComb');

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
				fileName:"CONSUMO DE COMBUSTIBLE POR EMBARCACION"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfig3: function() {
			return [
				{
					label: 'Cod. de Embarcación',
					property: 'CDEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Nombre de Embarcación',
					property: 'NMEMB',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Motivo',
					property: 'DSMMA',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Nav',
					property: 'HONAV',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Des',
					property: 'HODES',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Pue',
					property: 'HOPUE',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Mar',
					property: 'HOMAR',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Nav',
					property: 'CONAV',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Des',
					property: 'CODES',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Pue',
					property: 'COPUE',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Mar',
					property: 'COMAR',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Nav',
					property: 'RRNAV',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Des',
					property: 'RRDES',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Pue',
					property: 'RRPUE',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Mar',
					property: 'RRMAR',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Nav',
					property: 'RPNAV',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Des',
					property: 'RPDES',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Pue',
					property: 'RPPUE',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Mar',
					property: 'RPMAR',
					type: EdmType.String,
					scale: 0
				},
				];
		},
		onExportAnalisisCombustible: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig3();
			console.log(this.getView().getModel("AnalisisCombustible"));
			aProducts = this.getView().getModel("AnalisisCombustible").getProperty('/listaAnalisisCombustible');

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
				fileName:"CUADRO DE ANALISIS DE COMBUSTIBLE"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
		},
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
					new Filter("NRMAR", FilterOperator.Contains, sQuery),
					new Filter("CDEMB", FilterOperator.Contains, sQuery),
					new Filter("NMEMB", FilterOperator.Contains, sQuery),
					new Filter("DSMMA", FilterOperator.Contains, sQuery),
					new Filter("FECZA", FilterOperator.Contains, sQuery),
					new Filter("HIZAR", FilterOperator.Contains, sQuery),
				]);
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("table");
			var oBinding = oList.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},
		// clearFilterEmba: function(){
		// 	this.byId("inputId0_R").setValue("");
		// 	this.byId("idFechaInicio").setValue("");
		// 	this.byId("idEstado").setValue("");
		// }

		_onOpenDialogComentario: function() {
				
			this._getDialogComentario().open();
		},

		_onCloseDialogComentario: function() {

			this._getDialogComentario().close();
				oGlobalBusyDialog.close();

			
		},
		_getDialogComentario : function () {
			if (!this._oDialogArmador) {
				this._oDialogArmador = sap.ui.xmlfragment("com.tasa.analisiscomb.view.Comentario", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador);
				
			}
			
			return this._oDialogArmador;
		},
		onObtenerComentario:function(){
			var comentario="Hola";
			sap.ui.getCore().byId("idLabelCom").setText("comentario");
			sap.ui.getCore().byId("idComentario").setValue("comentario");
		},
		onComentario: async function(oEvent){
			oGlobalBusyDialog.open();

			//var nrmar=sap.ui.getCore().byId("idMarea2").getText();
			//this.getCuadroAnalisis2(nrmar);


			console.log(oEvent);
			var cadena=oEvent.getSource().getBindingContext("Reporte").getPath().split("/")[2];
			var array=this.getView().getModel("Reporte").oData.listaReporte[cadena];
			console.log(array.OBCOM);
			console.log(array.DESC_CDFAS);

		
				this._onOpenDialogComentario();
				sap.ui.getCore().byId("idComentario").setValue(array.OBCOM);
				sap.ui.getCore().byId("idLabelCom").setText(array.DESC_CDFAS);
				this.codFase= array.CDFAS;


		},

		onActualizarComentario: async  function(){

			var nrmar=sap.ui.getCore().byId("idMarea2").getText();
			var obcom=sap.ui.getCore().byId("idComentario").getValue();
			var p_case="E";
			var flag="X";

			

				var existe= await this.onValidarComentario(nrmar, this.codFase);

				if(!existe){
					p_case="N";
					flag="";
				}
				this.onInsertarComentario(nrmar, obcom, p_case, flag);
			

			
			this.getCuadroAnalisis2(nrmar);
			this.codFase="";
			this._onCloseDialogComentario();

		},
		onInsertarComentario: function(nrmar, obcom, p_case, flag){

			oGlobalBusyDialog.open();
			var body={
				"data": "",
				"fieldWhere": "NRMAR",
				"flag": flag,
				"keyWhere": nrmar,
			//	"keyWhere": "164378",
				"opcion": [
				{
					"field": "OBCOM",
					"valor": obcom					
				},
				{
					"field": "CDFAS",
					"valor": this.codFase					
				}
				],
				"p_case": p_case,
				"p_user": "FGARCIA",
				"tabla": "ZFLOCC"
			}
			
			console.log(body);
			 fetch(`${mainUrlServices}General/Update_Table2`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then(resp => resp.json()).then(data => {
				console.log(data);
				this.getView().getModel("EstadoComentario").setProperty("/listaMensajes",data.t_mensaje);

				MessageBox.success(data.t_mensaje[0].DSMIN);
				this._onCloseDialogComentario();
				oGlobalBusyDialog.close();
			}).catch(error => console.log(error)

			);
		},

		onValidarComentario: async function(nrmar, cdfas)
		{
			
			var existe=true;

			oGlobalBusyDialog.open();
			var body={
				"delimitador": "|",
				"fields": [
				],
				"no_data": "",
				"option": [
				 
				 {"wa":"NRMAR = '"+nrmar+"' AND CDFAS = '"+cdfas+"'"}
			   ],
				"options": [
				 
				],
				"order": "",
				"p_pag": "",
				"p_user": "FGARCIA",
				"rowcount": 0,
				"rowskips": 0,
				"tabla": "ZFLOCC"
			  }
			
			await fetch(`${mainUrlServices}General/Read_Table`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				console.log(data.data.length);

				var tamaño=data.data.length;
				if(tamaño===0){
					existe=false;
				}

			
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)

			);
			
			return existe;
		},
		onSearchHelp:function(oEvent){
			let sIdInput = oEvent.getSource().getId(),
			oModel = this.getModel(),
			nameComponent="busqembarcaciones",
			idComponent="busqembarcaciones",
			urlComponent=HOST+"/9acc820a-22dc-4d66-8d69-bed5b2789d3c.AyudasBusqueda.busqembarcaciones-1.0.0",
			oView = this.getView(),
			oInput = this.getView().byId(sIdInput);
			oModel.setProperty("/input",oInput);

			if(!this.DialogComponent){
				this.DialogComponent = new sap.m.Dialog({
					title:"Búsqueda de embarcaciones",
					icon:"sap-icon://search",
					state:"Information",
					endButton:new sap.m.Button({
						icon:"sap-icon://decline",
						text:"Cerrar",
						type:"Reject",
						press:function(oEvent){
							this.onCloseDialog(oEvent);
						}.bind(this)
					})
				});
				oView.addDependent(this.DialogComponent);
				oModel.setProperty("/idDialogComp",this.DialogComponent.getId());
			}

			let comCreateOk = function(oEvent){
				BusyIndicator.hide();
			};

			
			if(this.DialogComponent.getContent().length===0){
				BusyIndicator.show(0);
				let oComponent = new sap.ui.core.ComponentContainer({
					id:idComponent,
					name:nameComponent,
					url:urlComponent,
					settings:{},
					componentData:{},
					propagateModel:true,
					componentCreated:comCreateOk,
					height:'100%',
					// manifest:true,
					async:false
				});

				this.DialogComponent.addContent(oComponent);
			}
			
			this.DialogComponent.open();
		},
		onCloseDialog:function(oEvent){
			oEvent.getSource().getParent().close();
		}
	});
});