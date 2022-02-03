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
	"sap/ui/core/BusyIndicator",
	"./Utilities",
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
	BusyIndicator,
	Utilities) {
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
				this.setModel(ViewModel, "exportExcelOptions");
		this.currentInputEmba = "";
			this.primerOption = [];
			this.segundoOption = [];
			this.currentPage = "";
			this.lastPage = "";
			this.loadCombos();	


		},
		
		
		onAfterRendering: async function(){
			this.userOperation =await this._getCurrentUser();
			this.objetoHelp =  await this._getHelpSearch();
			this.parameter= this.objetoHelp[0].parameter;
			this.url= this.objetoHelp[0].url;
			console.log(this.parameter)
			console.log(this.url)
			this.callConstantes();
		},
		callConstantes: function(){
			oGlobalBusyDialog.open();
			var body={
				"nombreConsulta": "CONSGENCONST",
				"p_user": this.userOperation,
				"parametro1": this.parameter,
				"parametro2": "",
				"parametro3": "",
				"parametro4": "",
				"parametro5": ""
			}
			fetch(`${Utilities.onLocation()}General/ConsultaGeneral/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					
					console.log(data.data);
					this.HOST_HELP=this.url+data.data[0].LOW;
					console.log(this.HOST_HELP);
						oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
			);
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

			  fetch(`${Utilities.onLocation()}dominios/Listar`,
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
			this.byId("idCant").setValue("200");
			this.getView().getModel("Combustible").setProperty("/listaCombustible",{});
		},
		parseMil: function(price){
			var num = price;
			num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
			num = num.split('').reverse().join('').replace(/^[\.]/,'');
			return(num)
		},
		changeFechaReport: function(value){
			
			var fecha="";
			if(value)
			var fecha = value.split("/")[2]+"-"+value.split("/")[1]+"-"+value.split("/")[0];
				
			
			
			return fecha;
		},
		onBusqueda: function(){
			oGlobalBusyDialog.open();
			var idFechaInicio=this.byId("idFechaInicio").mProperties.dateValue;
			var idFechaFin=this.byId("idFechaInicio").mProperties.secondDateValue;
			var idEmbarcacion=this.byId("inputId0_R").getValue();
			var idEstado=this.byId("idEstado").getSelectedKey();
			var idCant=this.byId("idCant").getValue();
			if(idEmbarcacion && idFechaInicio){
				this.embarcacionB = true;
			}
			if(!idEmbarcacion){
				this.embarcacionB=false;
			}
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
				"p_user": this.userOperation
			}
			console.log(body);
		
			fetch(`${Utilities.onLocation()}analisiscombustible/Listar`,
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
					// Guardar los parámetros para la exportación
					this.getView().getModel("exportExcelOptions").setProperty("/requestBody", body);
					exportarExcel=true;
				}
				for(var i=0;i<data.str_csmar.length;i++){
					
					data.str_csmar[i].STCMB2 = data.str_csmar[i].STCMB.toLocaleString();
					data.str_csmar[i].STCMB3 = data.str_csmar[i].STCMB.toLocaleString()+".000";
					data.str_csmar[i].CNSUM2 = data.str_csmar[i].CNSUM.toLocaleString();
					data.str_csmar[i].CNSUM3 = data.str_csmar[i].CNSUM !==0?data.str_csmar[i].CNSUM.toLocaleString()+"0.000":".000";
					data.str_csmar[i].CONSU2 = data.str_csmar[i].CONSU.toLocaleString();
					data.str_csmar[i].STFIN2 = data.str_csmar[i].STFIN.toLocaleString();
					data.str_csmar[i].HOZMP2 = data.str_csmar[i].HOZMP.toLocaleString();
					data.str_csmar[i].HOZA12 = data.str_csmar[i].HOZA1.toLocaleString();
					data.str_csmar[i].HOZA22 = data.str_csmar[i].HOZA2.toLocaleString();
					data.str_csmar[i].HOZA32 = data.str_csmar[i].HOZA3.toLocaleString();
					data.str_csmar[i].HOZA42 = data.str_csmar[i].HOZA4.toLocaleString();
					data.str_csmar[i].HOZA52 = data.str_csmar[i].HOZA5.toLocaleString();
					data.str_csmar[i].HOZPA2 = data.str_csmar[i].HOZPA.toLocaleString();
					data.str_csmar[i].HOZFP2 = data.str_csmar[i].HOZFP.toLocaleString();
					data.str_csmar[i].HOAMP2 = data.str_csmar[i].HOAMP.toLocaleString();
					data.str_csmar[i].HOAA12 = data.str_csmar[i].HOAA1.toLocaleString();
					data.str_csmar[i].HOAA22 = data.str_csmar[i].HOAA2.toLocaleString();
					data.str_csmar[i].HOAA32 = data.str_csmar[i].HOAA3.toLocaleString();
					data.str_csmar[i].HOAA42 = data.str_csmar[i].HOAA4.toLocaleString();
					data.str_csmar[i].HOAA52 = data.str_csmar[i].HOAA5.toLocaleString();
					data.str_csmar[i].HOAPA2 = data.str_csmar[i].HOAPA.toLocaleString();
					data.str_csmar[i].HOAFP2 = data.str_csmar[i].HOAFP.toLocaleString();
					data.str_csmar[i].HODMP2 = data.str_csmar[i].HODMP.toLocaleString();
					data.str_csmar[i].HODFP2 = data.str_csmar[i].HODFP.toLocaleString();
					data.str_csmar[i].HOHMP2 = data.str_csmar[i].HOHMP.toLocaleString();
					data.str_csmar[i].HOHA12 = data.str_csmar[i].HOHA1.toLocaleString();
					data.str_csmar[i].HOHA22 = data.str_csmar[i].HOHA2.toLocaleString();
					data.str_csmar[i].HOHA32 = data.str_csmar[i].HOHA3.toLocaleString();
					data.str_csmar[i].HOHA42 = data.str_csmar[i].HOHA4.toLocaleString();
					data.str_csmar[i].HOHA52 = data.str_csmar[i].HOHA5.toLocaleString();
					data.str_csmar[i].HOHPA2 = data.str_csmar[i].HOHPA.toLocaleString();
					data.str_csmar[i].HOHFP2 = data.str_csmar[i].HOHFP.toLocaleString();



					data.str_csmar[i].STCMB=String(data.str_csmar[i].STCMB);
					data.str_csmar[i].FECZA2= this.changeFechaReport(data.str_csmar[i].FECZA);
					data.str_csmar[i].FECCONMOV2= this.changeFechaReport(data.str_csmar[i].FECCONMOV);
					data.str_csmar[i].FECAR2= this.changeFechaReport(data.str_csmar[i].FECAR);
					data.str_csmar[i].CNSUM=String(this.parseMil(data.str_csmar[i].CNSUM));
					data.str_csmar[i].CONSU=String(this.parseMil(data.str_csmar[i].CONSU));
					data.str_csmar[i].CNPDS=String(data.str_csmar[i].CNPDS);
					data.str_csmar[i].CNPDS2=Math.round(data.str_csmar[i].CNPDS);
					data.str_csmar[i].STFIN=String(data.str_csmar[i].STFIN);
					data.str_csmar[i].NRMAR2 = data.str_csmar[i].NRMAR.toLocaleString();	
						
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
				
				var cantidadRegistros="Lista de registros ("+data.str_csmar.length+")";
				this.byId("idListaReg").setText(cantidadRegistros);

				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);

		},
		createColumnConfigEmba:function(){
			return [
				{
					label: 'Num. Marea',
					property: 'NRMAR2' ,
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
					property: 'NMEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Motivo',
					property: 'DSMMA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Puerto',
					property: 'PTOZA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha de Inicio',
					property: 'FECZA2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Hora de Inicio',
					property: 'HIZAR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Stock',
					property: 'STCMB3' ,
					type: EdmType.String,
					delimiter: true
				},
				{
					label: 'Suministro',
					property: 'CNSUM3' ,
					type: EdmType.String,
					delimiter: true
				},
			]
		},
		createColumnConfig5: function() {
			return [
				{
					label: 'Num. Marea',
					property: 'NRMAR2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Cod. de Embarcación',
					property: 'CDEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Nombre de Embarcación',
					property: 'NMEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Motivo',
					property: 'DSMMA' ,
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
					property: 'FECZA2' ,
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
					label: 'Fecha de Arribo',
					property: 'FECAR2' ,
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
					property: 'FECCONMOV2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Cant. desc. (Tn)',
					property: 'CNPDS' ,
					type: EdmType.Number,
					delimiter: true
				},
				{
					label: 'Stock Inicial',
					property: 'STCMB2' ,
					type: EdmType.Number,
					delimiter: true
				},
				{
					label: 'Suministro',
					property: 'CNSUM2' ,
					type: EdmType.Number,
					delimiter: true
				},
				{
					label: 'Consumo',
					property: 'CONSU2' ,
					type: EdmType.Number,
					delimiter: true
				},
				{
					label: 'Stock Final',
					property: 'STFIN2' ,
					type: EdmType.Number,
					delimiter: true
				},
				{
					label: 'Zarpe MP',
					property: 'HOZMP2' ,
					type: EdmType.String,
				},
				{
					label: 'Zarpe A1',
					property: 'HOZA12' ,
					type: EdmType.String,
				},
				{
					label: 'Zarpe A2',
					property: 'HOZA22' ,
					type: EdmType.String,
	
				},
				{
					label: 'Zarpe A3',
					property: 'HOZA32' ,
					type: EdmType.String,
			
				},
				{
					label: 'Zarpe A4',
					property: 'HOZA42' ,
					type: EdmType.String,
				
				},
				{
					label: 'Zarpe A5',
					property: 'HOZA52' ,
					type: EdmType.String,
				
				},
				{
					label: 'Zarpe PA',
					property: 'HOZPA2' ,
					type: EdmType.String,
				
				},
				{
					label: 'Zarpe FP',
					property: 'HOZFP2' ,
					type: EdmType.String,
				
				},
				{
					label: 'Arribo MP',
					property: 'HOAMP2' ,
					type: EdmType.String,
			
				},
				{
					label: 'Arribo A1',
					property: 'HOAA12' ,
					type: EdmType.String,
				
				},
				{
					label: 'Arribo A2',
					property: 'HOAA22' ,
					type: EdmType.String,
				
				},
				{
					label: 'Arribo A3',
					property: 'HOAA32' ,
					type: EdmType.String,
			
				},
				{
					label: 'Arribo A4',
					property: 'HOAA42' ,
					type: EdmType.String,
				
				},
				{
					label: 'Arribo A5',
					property: 'HOAA52' ,
					type: EdmType.String,
				
				},
				{
					label: 'Arribo PA',
					property: 'HOAPA2' ,
					type: EdmType.String,
				
				},
				{
					label: 'Arribo FP',
					property: 'HOAFP2' ,
					type: EdmType.String,
			
				},
				{
					label: 'Descarga MP',
					property: 'HODMP2' ,
					type: EdmType.String,
					
				},
				{
					label: 'Descarga FP',
					property: 'HODFP2' ,
					type: EdmType.String,
				
				},
				{
					label: 'Horometro MP',
					property: 'HOHMP2' ,
					type: EdmType.String,
				
				},
				{
					label: 'Horometro A1',
					property: 'HOHA12' ,
					type: EdmType.String,
				
				},
				{
					label: 'Horometro A2',
					property: 'HOHA22' ,
					type: EdmType.String,
			
				},
				{
					label: 'Horometro A3',
					property: 'HOHA32' ,
					type: EdmType.String,
				
				},
				{
					label: 'Horometro A4',
					property: 'HOHA42' ,
					type: EdmType.String,
				
				},
				{
					label: 'Horometro A5',
					property: 'HOHA52' ,
					type: EdmType.String,
					
				},
				{
					label: 'Horometro PA',
					property: 'HOHPA2' ,
					type: EdmType.String,
					
				},
				{
					label: 'Horometro FP',
					property: 'HOHFP2' ,
					type: EdmType.String,
				
				}
				
				];
		},
		onExportarExcelData: async function() {
			oGlobalBusyDialog.open();
			if(!exportarExcel){
				MessageBox.error("Porfavor, realizar una búsqueda antes de exportar");
				oGlobalBusyDialog.close();
				return false;
			}
			var aCols, aProducts, oSettings, oSheet, oData, oRequestBody;
			oRequestBody = this.getModel("exportExcelOptions").getProperty("/requestBody");
			
				aCols = this.createColumnConfig5();
			
			
			console.log(this.getView().getModel("Combustible"));

			let data = await fetch(`${Utilities.onLocation()}analisiscombustible/ExportRegistroAnalisisCombus`, {
				method: 'POST',
				body: JSON.stringify(oRequestBody)
			}).then(resp => resp.json());

			/**
			 * Creación del libro de Excel
			 */
			const content = data.base64;
			if (content) {
				const contentType = 'application/vnd.ms-excel';
				const sliceSize = 512;
				let byteCharacters = window.atob(
					content);
				let byteArrays = [];
				const fileName = 'Reporte Análisis de Combustible.xls';

				/**
				 * Convertir base64 a Blob
				 */
				for (let offset = 0; offset < byteCharacters.length; offset +=
					sliceSize) {
					let slice = byteCharacters.slice(offset, offset + sliceSize);
					let byteNumbers = new Array(slice.length);
					for (let i = 0; i < slice.length; i++) {
						byteNumbers[i] = slice.charCodeAt(i);
					}
					let byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}
				let blob = new Blob(byteArrays, {
					type: contentType
				});

				/**
				 * Exportar a Excel
				 */
				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, fileName);
					
					oGlobalBusyDialog.close();
				} else {
					let link = document.createElement("a");
					if (link.download !== undefined) {
						let url = URL.createObjectURL(blob);
						link.setAttribute("href", url);
						link.setAttribute("download", fileName);
						link.style.visibility = 'hidden';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);

						oGlobalBusyDialog.close();
					}
				}
			} else {
				oGlobalBusyDialog.close();
			}
			

			/*
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
				*/
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
				"p_user": this.userOperation,
				"str_csmar": arraySend,
				"str_lgcco": [
				 
				]
			}

			console.log(body);
			fetch(`${Utilities.onLocation()}logregistrocombustible/Nuevo`,
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
				"pRow": 0
			}
			console.log(body);
			fetch(`${Utilities.onLocation()}analisiscombustible/QlikView`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then(resp => resp.json()).then(data => {
			  console.log(data);
			  for(var i=0;i<data.str_cef.length;i++){
				  
				  var nmar=data.str_cef[i].NRMAR.toLocaleString()+".000";
				  data.str_cef[i].NRMAR2=nmar.replace(".",",");
				  data.str_cef[i].CNPDS2=data.str_cef[i].CNPDS===0?".000":data.str_cef[i].CNPDS.toFixed(3);
				  data.str_cef[i].HONAV2=data.str_cef[i].HONAV===0?".000":data.str_cef[i].HONAV.toFixed(3);
				  data.str_cef[i].HODES2=data.str_cef[i].HODES===0?".000":data.str_cef[i].HODES.toFixed(3);
				  data.str_cef[i].HOPUE2=data.str_cef[i].HOPUE===0?".000":data.str_cef[i].HOPUE.toFixed(3);
				  data.str_cef[i].HOMAR2=data.str_cef[i].HOMAR===0?".000":data.str_cef[i].HOMAR.toFixed(3);
				  data.str_cef[i].CONAV2=data.str_cef[i].CONAV===0?".000":data.str_cef[i].CONAV.toFixed(3);
				  data.str_cef[i].CODES2=data.str_cef[i].CODES===0?".000":data.str_cef[i].CODES.toFixed(3);
				  data.str_cef[i].COPUE2=data.str_cef[i].COPUE===0?".000":data.str_cef[i].COPUE.toFixed(3);
				  data.str_cef[i].COMAR2=data.str_cef[i].COMAR===0?".000":data.str_cef[i].COMAR.toFixed(3);
				  data.str_cef[i].RRNAV2=data.str_cef[i].RRNAV===0?".000":data.str_cef[i].RRNAV.toFixed(3);
				  data.str_cef[i].RRDES2=data.str_cef[i].RRDES===0?".000":data.str_cef[i].RRDES.toFixed(3);
				  data.str_cef[i].RRPUE2=data.str_cef[i].RRPUE===0?".000":data.str_cef[i].RRPUE.toFixed(3);
				  data.str_cef[i].RRMAR2=data.str_cef[i].RRMAR===0?".000":data.str_cef[i].RRMAR.toFixed(3);
				  data.str_cef[i].RPNAV2=data.str_cef[i].RPNAV===0?".000":data.str_cef[i].RPNAV.toFixed(3);
				  data.str_cef[i].RPDES2=data.str_cef[i].RPDES===0?".000":data.str_cef[i].RPDES.toFixed(3);
				  data.str_cef[i].RPPUE2=data.str_cef[i].RPPUE===0?".000":data.str_cef[i].RPPUE.toFixed(3);
				  data.str_cef[i].RPMAR2=data.str_cef[i].RPMAR===0?".000":data.str_cef[i].RPMAR.toFixed(3);

				  var fecha =data.str_cef[i].FEPRD;
				  data.str_cef[i].FEPRD=fecha!="" ? fecha.split("/")[2]+"-"+fecha.split("/")[1]+"-"+fecha.split("/")[0] : "";
			  }
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
					label: 'Cdemb',
					property: 'CDEMB',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Nrmar',
					property: 'NRMAR2',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Nmemb',
					property: 'NMEMB',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Cdmma',
					property: 'CDMMA',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Dsmma',
					property: 'DSMMA',
					type: EdmType.String,
					scale: 0
				},
				{
					label: 'Cnpds',
					property: 'CNPDS2',
					type: EdmType.String
					
				},
				{
					label: 'Honav',
					property: 'HONAV2',
					type: EdmType.String
					
				},
				{
					label: 'Hodes',
					property: 'HODES2',
					type: EdmType.String
				},
				{
					label: 'Hopue',
					property: 'HOPUE2',
					type: EdmType.String
				},
				{
					label: 'Homar',
					property: 'HOMAR2',
					type: EdmType.String
				},
				{
					label: 'Conav',
					property: 'CONAV2',
					type: EdmType.String
				},
				{
					label: 'Codes',
					property: 'CODES2',
					type: EdmType.String
				},
				{
					label: 'Copue',
					property: 'COPUE2',
					type: EdmType.String
				},
				{
					label: 'Comar',
					property: 'COMAR2',
					type: EdmType.String
				},
				{
					label: 'Rrnav',
					property: 'RRNAV2',
					type: EdmType.String
				},
				{
					label: 'Rrdes',
					property: 'RRDES2',
					type: EdmType.String
				},
				{
					label: 'Rrpue',
					property: 'RRPUE2',
					type: EdmType.String
				},
				{
					label: 'Rrmar',
					property: 'RRMAR2',
					type: EdmType.String
				},
				{
					label: 'Rpnav',
					property: 'RPNAV2',
					type: EdmType.String
				},
				{
					label: 'Rpdes',
					property: 'RPDES2',
					type: EdmType.String
				},
				{
					label: 'Rppue',
					property: 'RPPUE2',
					type: EdmType.String
				},
				{
					label: 'Rpmar',
					property: 'RPMAR2',
					type: EdmType.String
				},
				{
					label: 'Feprd',
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
			console.log(array.DSMMA);

			if(array.CDMMA==="7"||array.CDMMA==="8"){
				await this.getCuadroAnalisis(array.NRMAR);
				this._onOpenDialogArmador();
				sap.ui.getCore().byId("idMarea").setText(array.NRMAR);
				sap.ui.getCore().byId("idCalas").setText(array.CNCAL);
				sap.ui.getCore().byId("idEmbarcacion").setText(array.NMEMB);
				sap.ui.getCore().byId("idZarpe").setText(array.DSMMA);
				oGlobalBusyDialog.close();
				sap.ui.getCore().byId("idMotMarea").setText("  MotMarea: "+array.CDMMA);
			}else{
				await this.getCuadroAnalisis2(array.NRMAR);
				this._onOpenDialogArmador2();
				sap.ui.getCore().byId("idMarea2").setText(array.NRMAR);
				sap.ui.getCore().byId("idCalas2").setText(array.CNCAL);
				sap.ui.getCore().byId("idEmbarcacion2").setText(array.NMEMB);
				sap.ui.getCore().byId("idZarpe2").setText(array.DSMMA);
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
				"p_user": this.userOperation
			}

			await fetch(`${Utilities.onLocation()}analisiscombustible/Detalle`,
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
				"p_user": this.userOperation
			}

			await fetch(`${Utilities.onLocation()}analisiscombustible/Detalles`,
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
			await fetch(`${Utilities.onLocation()}analisiscombustible/AnalisisCombu`,
			{
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then(resp => resp.json()).then(data => {

				var cantidadRegistros="Lista de registros ("+data.str_cef.length+")";
				this.byId("idListaReg").setText(cantidadRegistros);

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

			fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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

			fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
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
					new Filter("PTOZA", FilterOperator.Contains, sQuery),
					new Filter("PTOAR", FilterOperator.Contains, sQuery),
					new Filter("STCMB", FilterOperator.Contains, sQuery),
					new Filter("CNSUM", FilterOperator.Contains, sQuery),
					new Filter("CONSU", FilterOperator.Contains, sQuery),
					new Filter("STFIN", FilterOperator.Contains, sQuery),
					new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
					new Filter("CNPDS", FilterOperator.Contains, sQuery)
					
					
					
					
					
					
					
					
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
				"p_user": this.userOperation,
				"tabla": "ZFLOCC"
			}
			
			console.log(body);
			 fetch(`${Utilities.onLocation()}General/Update_Table2`,
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
				"p_user": this.userOperation,
				"rowcount": 0,
				"rowskips": 0,
				"tabla": "ZFLOCC"
			  }
			
			await fetch(`${Utilities.onLocation()}General/Read_Table`,
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