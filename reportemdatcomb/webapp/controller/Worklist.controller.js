sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	"sap/m/MessageBox",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator",
	"./Utilities"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,ExportTypeCSV,Export,MessageBox,exportLibrary,
	Spreadsheet,BusyIndicator,Utilities) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var mimeDet=null;
	var fileName=null;
	var fileDetails=null;
	var EdmType = exportLibrary.EdmType;
	var exportarExcel=false;
	const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
	return BaseController.extend("com.tasa.reportemdatcomb.controller.Worklist", {

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
			this.loadIndicadorP();
			this.byId("idAciertos").setValue("200");
		},
		onAfterRendering: async function(){
			this.userOperation =await this._getCurrentUser();
			this.objetoHelp =  this._getHelpSearch();
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

				var oModel = new JSONModel();

				this.getView().setModel(oModel);

				  })
			},
		_onOpenDialogEmbarcacion: function() {
			this._getDialogEmbarcacion().open();
			},

			_onCloseDialogEmbarcacion: function() {
				this._getDialogEmbarcacion().close();
			},

			_getDialogEmbarcacion : function () {
				if (!this._oDialogEmbarcacion) {
					this._oDialogEmbarcacion = sap.ui.xmlfragment("com.tasa.reportemdatcomb.view.DlgEmbarcacion", this.getView().getController());
					this.getView().addDependent(this._oDialogEmbarcacion);
				}
				sap.ui.getCore().byId("idEmbarcacion").setValue("");
			sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
			sap.ui.getCore().byId("idMatricula").setValue("");
			sap.ui.getCore().byId("idRuc").setValue("");
			sap.ui.getCore().byId("idArmador").setValue("");
				return this._oDialogEmbarcacion;
			},
			listaEmbarcacion: function(){
				oGlobalBusyDialog.open();
				console.log("BusquedaEmbarca");
				var idEmbarcacion =sap.ui.getCore().byId("idEmbarcacion").getValue();
				var idEmbarcacionDesc =sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
				var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc =sap.ui.getCore().byId("idRuc").getValue();
				var idArmador =sap.ui.getCore().byId("idArmador").getValue();
				var idPropiedad = sap.ui.getCore().byId("idPropiedad").getSelectedKey();
				
				var options=[];
				var options2=[];
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "ESEMB",
					"valueHigh": "",
					"valueLow": "O"
				})
				if(idEmbarcacion){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacion
						
					});
				}
				if(idEmbarcacionDesc){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": idEmbarcacionDesc
						
					});
				}
				if(idMatricula){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "MREMB",
						"valueHigh": "",
						"valueLow": idMatricula
					})
				}
				if(idPropiedad){
					options.push({
						"cantidad": "20",
						"control": "COMBOBOX",
						"key": "INPRP",
						"valueHigh": "",
						"valueLow": idPropiedad
					})
				}
				if(idRuc){
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc
					})
				}
				if(idArmador){
					options2.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idArmador
					})
				}
				
				var body={
					"option": [
					  
					],
					"option2": [
					  
					],
					"options": options,
					"options2": options2,
					"p_user": "BUSQEMB"
				  }
				  console.log(body);
				fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						  console.log(data);
						var dataPuerto=data.data;
						console.log(dataPuerto);
						console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
						
							sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: "+dataPuerto.length);
						if(dataPuerto.length<=0){
							sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: No se encontraron resultados");
						}
						oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
			},
			buscar: function(evt){
				var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
				var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].WERKS;
				this.byId("inputId_W").setValue(data);
				this._onCloseDialogEmbarcacion();
			},
			loadIndicadorP: function(){
				oGlobalBusyDialog.open();
				var ZINPRP=null;
				var body={
					"dominios": [
					  {
						"domname": "ZINPRP",
						"status": "A"
					  }
					]
				}
				fetch(`${Utilities.onLocation()}dominios/Listar/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						console.log(data);
							
						ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
							
							this.getModel("Propiedad").setProperty("/ZINPRP", ZINPRP);
							oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
	
			},
			loadCombos: function(){
				oGlobalBusyDialog.open();
				var FASE=null;
				var ZCDMMA=null;
		
				const body={
					"dominios": [
						{
							"domname": "FASE",
							"status": "A"
						  },
						  {
							"domname": "ZCDMMA",
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
						console.log(dataPuerto);
						FASE= data.data.find(d => d.dominio == "FASE").data;
						ZCDMMA = data.data.find(d => d.dominio == "ZCDMMA").data;
			
						this.getModel("Fase").setProperty("/FASE", FASE);
						this.getModel("Motivo").setProperty("/ZCDMMA", ZCDMMA);
					
						oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
					  );
			},
			castFechas: function(fecha){
				var arrayFecha=fecha.split("/");
				console.log(arrayFecha);
				var fechas = arrayFecha[2]+""+arrayFecha[1]+""+arrayFecha[0];
				return fechas;
			},
			castFechasForReport: function(fecha){
				var arrayFecha=fecha.split("/");
				console.log(arrayFecha);
				var fechas = arrayFecha[2]+"-"+arrayFecha[1]+"-"+arrayFecha[0];
				return fechas;
			},
			onLimpiar:function(){
				this.byId("inputId_W").setValue("");
				this.byId("idFechaIniVigencia").setValue("");
				this.byId("idMotivo").setValue("");
				this.byId("idFase").setValue("");
				this.byId("idAciertos").setValue("200");
				this.byId("idListaReg").setText("Lista de registros:")
				this.byId("title").setText("");
				this.getView().getModel("Lista").setProperty("/listaLista",{});
			},
			
			loadTabla: function(){
				oGlobalBusyDialog.open();
				var idEmbarcacion = this.byId("inputId_W").getValue();
				var fechaIni = this.byId("idFechaIniVigencia").getValue();
				var idMotivo = this.byId("idMotivo").getSelectedKey();
				var idFase = this.byId("idFase").getSelectedKey();
				var idAciertos= this.byId("idAciertos").getValue();
				var error=""
				var options=[];
				var estado=true;
				if(idEmbarcacion || idFase ||idMotivo){
					
				}else{
					if(!fechaIni){
						error="Debe ingresar una fecha de inicio de vigencia\n";
						estado=false;
					   }
					   
					   if(!estado){
						   MessageBox.error(error);
						   oGlobalBusyDialog.close()
						   return false;
					   }
				}
				
				var feccc =[];
				feccc= fechaIni.trim().split("-");
				for(var i=0;i<feccc.length;i++){
					feccc[i]=feccc[i].trim();
				}
				var fechaIniVigencia= this.castFechas(feccc[0]);
				var fechaIniVigencia2= this.castFechas(feccc[1]);

				if(fechaIni){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FIEVN",
						valueHigh: fechaIniVigencia2,
						valueLow:fechaIniVigencia
					});
				}
				if(idEmbarcacion){
					options.push({
						cantidad: "10",
						control:"INPUT",
						key:"WERKS",
						valueHigh: "",
						valueLow:idEmbarcacion
					});
				}
				if(idMotivo){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"CDMMA",
						valueHigh: "",
						valueLow:idMotivo
					});
				}
				var body={
					"fieldsT_flocc": [
					  
					],
					"fieldsT_mensaje": [
					
					],
					"option": [
					  
					],
					"options": options,
					"p_cant": idAciertos,
					"p_fase": idFase
				  }
				  console.log(body);
				  fetch(`${Utilities.onLocation()}reportesmodifdatoscombustible/Listar/`,
					   {
						   method: 'POST',
						   body: JSON.stringify(body)
					   })
					   .then(resp => resp.json()).then(data => {
							console.log(data);
							if(data.t_flocc){
								// Guardar los par??metros para la exportaci??n
								this.getView().getModel("exportExcelOptions").setProperty("/requestBody", body);
								exportarExcel=true;
							}
							for(var i=0;i<data.t_flocc.length;i++){
								data.t_flocc[i].NRMAR=this.zeroFill(data.t_flocc[i].NRMAR,10);
								data.t_flocc[i].NRMAR2 = parseInt(data.t_flocc[i].NRMAR).toLocaleString();
								if(data.t_flocc[i].FECCONMOV===null || data.t_flocc[i].FECCONMOV==="null"){
									data.t_flocc[i].FECCONMOV="";
									
								}
					
								data.t_flocc[i].CNPDS = String(data.t_flocc[i].CNPDS.toFixed(2));
								data.t_flocc[i].CNPDS2 = parseInt(data.t_flocc[i].CNPDS).toLocaleString();
								data.t_flocc[i].DESC_CDFAS = (data.t_flocc[i].DESC_CDFAS).toUpperCase();
								data.t_flocc[i].FECCONMOV2 = data.t_flocc[i].FECCONMOV ? this.castFechasForReport(data.t_flocc[i].FECCONMOV) : "";
								data.t_flocc[i].FCMOD2 = data.t_flocc[i].FCMOD ? this.castFechasForReport(data.t_flocc[i].FCMOD) : "";
							}
							this.getModel("Lista").setProperty("/listaLista", data.t_flocc);
							this.getModel("Lista").setProperty("/porcIndModif", data.indicadorPorc);
							this.byId("title").setText("Indicador de modificaci??n: "+data.indicadorPorc.toFixed(0)+"%");
							oGlobalBusyDialog.close();

							var cantidadRegistros="Lista de registros ("+data.t_flocc.length+")";
							this.byId("idListaReg").setText(cantidadRegistros);
					   }).catch(error => console.log(error)
					   );

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
		filterPrice: function(){

		},
			onDataExport:  function() {
				var oExport = new Export({
					exportType: new ExportTypeCSV({
					  separatorChar: ";",
					  charset: "utf-8"
					}),
					//PoliticaPrecio>/listaPolitica
					models: this.getView().getModel("Lista"),
					rows:{path:""},
					rows: { path: "/listaLista" },
					columns: [
					  {
						name: "Embarcaci??n",
						template: {
						  content: "{NMEMB}"
						}
					  },
					  {
						name: "Marea",
						template: {
						  content: "{NRMAR}"
						}
					  },
					  {
						name: "Fase",
						template: {
						  content: "{DESC_CDFAS}"
						}
					  },
					  {
						name: "Motivo de marea",
						template: {
						  content: "{DESC_CDMMA}"
						}
					  },
					  {
						name: "Fec. producci??n",
						template: {
						  content: "{FECCONMOV}"
						}
					  },
					  {
						name: "Fec. modificaci??n",
						template: {
						  content: "{FCMOD}"
						}
					  },
					  {
						name: "Usuario",
						template: {
						  content: "{ATMOD}"
						}
					  },
					  {
						name: "Descarga (TN)",
						template: {
						  content: "{CNPDS}"
						}
					  },
					  {
						name: "Texto explicativo por modificaci??n",
						template: {
						  content: "{OBCOM}"
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
				createColumnConfig5: function() {
					return [
						{
							label: 'Embarcaci??n',
							property: 'NMEMB' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Marea',
							property: 'NRMAR' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Fase',
							property: 'DESC_CDFAS' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Motivo de marea',
							property: 'DESC_CDMMA' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Fec. producci??n',
							property: 'FECCONMOV' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Fec. modificaci??n',
							property: 'FCMOD' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Usuario',
							property: 'ATMOD' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Descarga (TN)',
							property: 'CNPDS' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Texto Explicativo',
							property: 'OBCOM' ,
							type: EdmType.String,
						}
						
						];
				},
				onExportarExcelData: async function() {
					oGlobalBusyDialog.open();
					if(!exportarExcel){
						MessageBox.error("Porfavor, realizar una b??squeda antes de exportar");
						oGlobalBusyDialog.close();
						return false;
					}
					var aCols, aProducts, oSettings, oSheet, oData, aPorcIndMod,
					oRequestBody = this.getView().getModel("exportExcelOptions").getProperty("/requestBody");

					aProducts = this.getView().getModel("Lista").getProperty('/listaLista');
					aPorcIndMod = this.getView().getModel("Lista").getProperty('/porcIndModif')

					let data = await fetch(`${Utilities.onLocation()}reportesmodifdatoscombustible/Exportar`, {
						method: "POST",
						body: JSON.stringify(oRequestBody),
					}).then(resp => resp.json());

					/**
					 * Creaci??n del libro de Excel
					 */
					const content = data.base64;
					if (content) {
						const contentType = 'application/vnd.ms-excel';
						const sliceSize = 512;
						let byteCharacters = window.atob(
							content);
						let byteArrays = [];
						const fileName = 'Reporte de modificaci??n de datos de combustible.xls';

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
					aCols = this.createColumnConfig5();
					console.log(this.getView().getModel("Lista"));
					aProducts = this.getView().getModel("Lista").getProperty('/listaLista');
		
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
						fileName:"Reporte de modificaci??n de datos de combustible"
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
				onSearch: function (oEvent) {
					// add filter for search
					var aFilters = [];
					var sQuery = oEvent.getSource().getValue();
					if (sQuery && sQuery.length > 0) {
						var filter = new Filter([
							new Filter("NMEMB", FilterOperator.Contains, sQuery),
							new Filter("NRMAR", FilterOperator.Contains, sQuery),
							new Filter("DESC_CDFAS", FilterOperator.Contains, sQuery),
							new Filter("DESC_CDMMA", FilterOperator.Contains, sQuery),
							new Filter("FECCONMOV", FilterOperator.Contains, sQuery),
							new Filter("FCMOD", FilterOperator.Contains, sQuery),
							new Filter("ATMOD", FilterOperator.Contains, sQuery),
							new Filter("OBCOM", FilterOperator.Contains, sQuery),
							new Filter("CNPDS", FilterOperator.Contains, sQuery)
						]);
						aFilters.push(filter);
					}
		
					// update list binding
					var oList = this.byId("table");
					var oBinding = oList.getBinding("rows");
					oBinding.filter(aFilters, "Application");
				},
				onSelectEmba: function(evt){
					var objeto = evt.getParameter("rowContext").getObject();
					if (objeto) {
						var cdemb = objeto.CDEMB;
						if (this.currentInputEmba.includes("embarcacionLow")) {
							this.byId("embarcacionLow").setValue(cdemb);
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
									var tituloTablaEmba = "P??gina 1/" + Number(data.p_totalpag);
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
									var tituloTablaEmba = "P??gina 1/1";
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
							var tituloTablaEmba = "P??gina " + this.currentPage + "/" + Number(data.p_totalpag);
							this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
							sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
							BusyIndicator.hide();
						}).catch(error => console.log(error));
				},
				getDialog: function(){
					if (!this.oDialog) {
						this.oDialog = sap.ui.xmlfragment("com.tasa.reportemdatcomb.view.Embarcacion", this);
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
				
					var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].WERKS;
					if (this.currentInputEmba.includes("idEmbarcacion")) {
						this.byId("inputId_W").setValue(data);
					}else if(this.currentInputEmba.includes("idEmbarcacion")){
						this.byId("inputId_W").setValue(data);
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
				onSearchHelp:function(oEvent){
					let sIdInput = oEvent.getSource().getId(),
					oModel = this.getModel(),
					nameComponent="busqembarcaciones",
					idComponent="busqembarcaciones",
					urlComponent=this.HOST_HELP+".AyudasBusqueda.busqembarcaciones-1.0.0",
					oView = this.getView(),
					oInput = this.getView().byId(sIdInput);
					oModel.setProperty("/input",oInput);
		
					if(!this.DialogComponent){
						this.DialogComponent = new sap.m.Dialog({
							title:"B??squeda de embarcaciones",
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