sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"./Utilities"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,ExportTypeCSV,Export,MessageBox,BusyIndicator,exportLibrary,Spreadsheet,Utilities) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var JsonFechaIni={
		fechaIni:"",
		fechaIni2:""
	};
	var EdmType = exportLibrary.EdmType;
	var exportarExcel=false;
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
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
		_getCurrentUser: async function(oViewModel){
			let oUshell = sap.ushell,
			oUser={};
			if(oUshell){
				let oUserInfo =await sap.ushell.Container.getServiceAsync("UserInfo");
				let sEmail = oUserInfo.getEmail().toUpperCase(),
				sName = sEmail.split("@")[0],
				sDominio= sEmail.split("@")[1];
				if(sDominio === "XTERNAL.BIZ") sName = "FGARCIA";
				oUser = {
					name:sName
				}
			}else{
				oUser = {
					name: "FGARCIA"
				}
			}

			this.usuario=oUser.name;
			console.log(this.usuario);
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
	
				ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
				this.getModel("Propiedad").setProperty("/ZINPRP", ZINPRP);
			
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);
		},
		listaEmbarcacion: function(){
			oGlobalBusyDialog.open();
			console.log("BusquedaEmbarca");
			var idEmbarcacion =sap.ui.getCore().byId("inputId0_R").getValue();
			var idEmbarcacionDesc =sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
			var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
			var idRuc =sap.ui.getCore().byId("idRuc").getValue();
			var idArmador =sap.ui.getCore().byId("idArmador").getValue();
			var idPropiedad = sap.ui.getCore().byId("idIndicadorP").getValue();

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
		// listaEmbarcacion: function(){
			
		// 	var body={
		// 		"option": [
					
		// 		],
		// 		"option2": [
				   
		// 		],
		// 		"options": [
				  
		// 		],
		// 		"options2": [
		// 		 {
		// 			 "cantidad":"10",
		// 			 "control":"COMBOBOX",
		// 			 "key":"ESEMB",
		// 			 "valueHigh":"",
		// 			 "valueLow":"0"
		// 		 }
		// 		],
		// 		"p_user": "BUSQEMB"
		// 	  }
		// 	fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
		// 		  {
		// 			  method: 'POST',
		// 			  body: JSON.stringify(body)
		// 		  })
		// 		  .then(resp => resp.json()).then(data => {
		// 			var dataPuerto=data.data;
		// 			console.log(dataPuerto);
		// 			console.log(this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto));
		// 		  }).catch(error => console.log(error)
		// 	);
		// },
		onBusqueda: function(){
			oGlobalBusyDialog.open();
			
			var idEmbarcacion = this.byId("inputId0_R").getValue();
			console.log(idEmbarcacion);
			var idFechaIni = this.byId("idFecha").mProperties.dateValue;
			var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
			console.log(this.byId("idFecha"));
			var error="";
			var valido=true;
			if(!idEmbarcacion){
				error="Debe ingresar un c??digo de embarcaci??n\n";
				oGlobalBusyDialog.close();
				valido= false;
			}
			if(!this.byId("idFecha").mProperties.dateValue){
				error+="Debe ingresar un rango de fechas"
				
				oGlobalBusyDialog.close();
				valido= false;
			}
			if(!valido){
				MessageBox.error(error);
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
			
			var body={
				"fieldStr_emb": [
				],
				"fieldStr_evn": [
				],
				"fieldStr_lho": [
				],
				"fieldT_mensaje": [
				],
				"p_cdemb": idEmbarcacion,
				"p_ffevn": fechaFin,
				"p_fievn": fechaIni,
				"p_user": this.userOperation
			  }
			  console.log(body);
			fetch(`${Utilities.onLocation()}consultahorometro/Listar/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataHorometro = data.listaHorometro;
						console.log(data);
						if(dataHorometro){
							exportarExcel=true;
						}
						for(var j=0;j<dataHorometro.length;j++){
							dataHorometro[j].NRO=j+1;
							
							//MotorPrincipal4
							if(dataHorometro[j].motorPrincipal){
								dataHorometro[j].motorPrincipal= String(this.parseMil(dataHorometro[j].motorPrincipal));
							}
							else{
								dataHorometro[j].motorPrincipal= String(dataHorometro[j].motorPrincipal);
							}
							

							if(dataHorometro[j].motorAuxiliar){
								dataHorometro[j].motorAuxiliar= String(this.parseMil(dataHorometro[j].motorAuxiliar));
							}else{
								dataHorometro[j].motorAuxiliar= String("0");
							}
							//MotorAuxiliar1
							
							if(dataHorometro[j].motorAuxiliar2){
								dataHorometro[j].motorAuxiliar2= String(this.parseMil(dataHorometro[j].motorAuxiliar2));
							}else{
								dataHorometro[j].motorAuxiliar2= String("0");
							}
							if(dataHorometro[j].motorAuxiliar3){
								dataHorometro[j].motorAuxiliar3= String(this.parseMil(dataHorometro[j].motorAuxiliar3));
							}else{
								dataHorometro[j].motorAuxiliar3= String("0");
							}

							if(dataHorometro[j].motorAuxiliar4){
								dataHorometro[j].motorAuxiliar4= String(this.parseMil(dataHorometro[j].motorAuxiliar4));
							}else{
								dataHorometro[j].motorAuxiliar4= String("0");
							}


							if(dataHorometro[j].motorAuxiliar5){
								dataHorometro[j].motorAuxiliar5= String(this.parseMil(dataHorometro[j].motorAuxiliar5));
							}else{
								dataHorometro[j].motorAuxiliar5= String("0");
							}
							
							if(dataHorometro[j].flujometro && dataHorometro[j].flujometro>0){
								dataHorometro[j].flujometro= String(this.parseMil(dataHorometro[j].flujometro));
							}else{
								dataHorometro[j].flujometro= String("0");
							}
							
							
							if(dataHorometro[j].panga && dataHorometro[j].panga>0){
								dataHorometro[j].panga= String(this.parseMil(dataHorometro[j].panga));
							}else{
								dataHorometro[j].panga= String("0");
							}



							if(dataHorometro[j].panga<=0){
								dataHorometro[j].panga="Averiado";
							}
							if(dataHorometro[j].motorPrincipal<=0 && dataHorometro[j].motorPrincipal != null){
								dataHorometro[j].motorPrincipal="Averiado";
							}
						}
						this.getView().getModel("Horometro").setProperty("/listaHorometro",dataHorometro);
						this.byId("title").setText("Lista de registros: "+data.listaHorometro.length);
						oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
					  );
		},
		parseMil: function(price){
			var num = price;
			num = num.toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g,'$1.');
			num = num.split('').reverse().join('').replace(/^[\.]/,'');
			return(num)
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
				exportType: new ExportTypeCSV({
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
						  this.byId("inputId0_R").setValue("");
						  this.byId("inputId0_R").setDescription("");
						  this.byId("idFecha").setValue("");
						  this.byId("title").setText("Lista de registros:");
						  this.getView().getModel("Horometro").setProperty("/listaHorometro",{});
					  },
					  _onOpenDialogEmbarcacion: function() {
						
						this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion","");
						this._getDialogEmbarcacion().open();
						
						},
			
						_onCloseDialogEmbarcacion: function() {
							this._getDialogEmbarcacion().close();
						},
			
						_getDialogEmbarcacion : function () {
							if (!this._oDialogEmbarcacion) {
								this._oDialogEmbarcacion = sap.ui.xmlfragment("com.tasa.consultahorom.view.DlgEmbarcacion", this.getView().getController());
								this.getView().addDependent(this._oDialogEmbarcacion);
							}
							sap.ui.getCore().byId("inputId0_R").setValue("");
							sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
							sap.ui.getCore().byId("idMatricula").setValue("");
							sap.ui.getCore().byId("idRuc").setValue("");
							sap.ui.getCore().byId("idArmador").setValue("");
							return this._oDialogEmbarcacion;
						},
						_onBuscarButtonPress: function(){
							var idEmbarcacion =sap.ui.getCore().byId("inputId0_R").getValue();
							var idEmbarcacionDesc =sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
							var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
							var idRuc =sap.ui.getCore().byId("idRuc").getValue();
							var idArmador =sap.ui.getCore().byId("idArmador").getValue();
							console.log(this.getView().getModel("Embarcacion"));
							console.log(idEmbarcacion);
							var arrayEmbarcacion = this.getView().getModel("Embarcacion").oData.listaEmbarcacion;
							var arrayActual=[];
							var tamanio = arrayEmbarcacion.length;
							console.log(tamanio);
							if(!idEmbarcacion && !idEmbarcacionDesc && !idMatricula && !idRuc && !idArmador){
								oGlobalBusyDialog.open();
								this.listaEmbarcacion2();
								oGlobalBusyDialog.close();
								this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion",this.getView().getModel("Embarcacion").oData.listaEmbarcacion);
							}
							for(var i=0;i<tamanio;i++){
								
								if(idEmbarcacion &&  arrayEmbarcacion[i].CDEMB===idEmbarcacion){
									arrayActual.push({
										"CDEMB":arrayEmbarcacion[i].CDEMB,
										"MREMB":arrayEmbarcacion[i].MREMB,
										"NMEMB":arrayEmbarcacion[i].NMEMB,
										"LIFNR":arrayEmbarcacion[i].LIFNR,
										"NAME1":arrayEmbarcacion[i].NAME1
									})
									console.log(arrayActual);
									this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion",arrayActual);
								}
								if(idMatricula &&  arrayEmbarcacion[i].MREMB===idMatricula){
									arrayActual.push({
										"CDEMB":arrayEmbarcacion[i].CDEMB,
										"MREMB":arrayEmbarcacion[i].MREMB,
										"NMEMB":arrayEmbarcacion[i].NMEMB,
										"LIFNR":arrayEmbarcacion[i].LIFNR,
										"NAME1":arrayEmbarcacion[i].NAME1
									})
									console.log(arrayActual);
									this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion",arrayActual);
								}
								if(idEmbarcacionDesc &&  arrayEmbarcacion[i].NMEMB===idEmbarcacionDesc){
									arrayActual.push({
										"CDEMB":arrayEmbarcacion[i].CDEMB,
										"MREMB":arrayEmbarcacion[i].MREMB,
										"NMEMB":arrayEmbarcacion[i].NMEMB,
										"LIFNR":arrayEmbarcacion[i].LIFNR,
										"NAME1":arrayEmbarcacion[i].NAME1
									})
									console.log(arrayActual);
									this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion",arrayActual);
								}
								if(idRuc &&  arrayEmbarcacion[i].LIFNR===idRuc){
									arrayActual.push({
										"CDEMB":arrayEmbarcacion[i].CDEMB,
										"MREMB":arrayEmbarcacion[i].MREMB,
										"NMEMB":arrayEmbarcacion[i].NMEMB,
										"LIFNR":arrayEmbarcacion[i].LIFNR,
										"NAME1":arrayEmbarcacion[i].NAME1
									})
									console.log(arrayActual);
									this.getView().getModel("EmbarcacionSearch").setProperty("/listaEmbarcacion",arrayActual);
								}
							}
							
							
						
						},
						// listaEmbarcacion2: function(){
						// 	oGlobalBusyDialog.open();
						// 	var body={
						// 		"option": [
									
						// 		],
						// 		"option2": [
						// 			{
						// 				"wa":"ESEMB = 'O'"
						// 			},
						// 			{
						// 				"wa":"AND INPRP LIKE 'P'"
						// 			}							   
						// 		],
						// 		"options": [
								  
						// 		],
						// 		"options2": [
								 
						// 		],
						// 		"p_user": "BUSQEMB"
						// 	  }
						// 	  fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
						// 		  {
						// 			  method: 'POST',
						// 			  body: JSON.stringify(body)
						// 		  })
						// 		  .then(resp => resp.json()).then(data => {
						// 			var dataPuerto=data.data;
						// 			this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto);
						// 			oGlobalBusyDialog.close();

									
						// 		  }).catch(error => console.log(error)
						// 		  );
						// },
						editarMasivo: function(oEvent){
							var indices = sap.ui.getCore().byId("table1").getSelectedIndices();
							console.log(indices);
							if(indices.length>1){
								MessageBox.error("Solo puede seleccionar un elemento");
								return false;
							}else{
								var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
								console.log(data);
								this.byId("inputId0_R").setValue(data);
								this._onCloseDialogEmbarcacion();
							}

						},
						buscar: function(evt){
							var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
							var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
							this.byId("inputId0_R").setValue(data);
								this._onCloseDialogEmbarcacion();
						},
						onDataExport2: function(){
							oGlobalBusyDialog.open();
						
							var idFechaIni = this.byId("idFecha").mProperties.dateValue;
							var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
							var error="";
							var valido=true;
							
							if(!this.byId("idFecha").mProperties.dateValue){
								error+="Debe ingresar un rango de fechas"
								oGlobalBusyDialog.close();
								valido= false;
							}
							if(!valido){
								MessageBox.error(error);
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
							console.log(fechaIni+" "+fechaFin);
							var body={
								"fieldStr_emb": [
								],
								"fieldStr_evn": [
								],
								"fieldStr_lho": [
								],
								"fieldT_mensaje": [
								],
								"p_cdemb": "",
								"p_ffevn": fechaFin,
								"p_fievn": fechaIni,
								"p_user": this.userOperation
							  }
							  console.log(body);
							fetch(`${Utilities.onLocation()}consultahorometro/Listar/`,
									  {
										  method: 'POST',
										  body: JSON.stringify(body)
									  })
									  .then(resp => resp.json()).then(data => {
										var dataHorometro = data.listaHorometro;
										if(dataHorometro){
											exportarExcel=true;
										}
										this.getView().getModel("HorometroEmba").setProperty("/listaHorometro",dataHorometro);
										console.log(dataHorometro);
										while(dataHorometro.length>1){
											this.onExportarExcelData2();
											oGlobalBusyDialog.close();
											break;
										}
									  }).catch(error => console.log(error)
									  );
									  
									  
									  
						},
						exportaList: function(){
							var oExport = new Export({
								exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
								  separatorChar: ";",
								  charset: "utf-8"
								}),
								//PoliticaPrecio>/listaPolitica
								models: this.getView().getModel("HorometroEmba"),
								rows:{path:""},
								rows: { path: "/listaHorometro" },
								columns: [
								  {
										name: "Matr??cula",
										template: {
										  content: "{matricula}"
										}
								  },
								  {
									name: "Nombre Embarcaci??n",
									template: {
									  content: "{nombreEmbarcacion}"
									}
								  },
								  {
									name: "Flota",
									template: {
									  content: "{flota}"
									}
								  },
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
						onSelectEmba: function(evt){
							var objeto = evt.getParameter("rowContext").getObject();
							if (objeto) {
								var cdemb = objeto.CDEMB;
								if (this.currentInputEmba.includes("embarcacionLow")) {
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
								this.oDialog = sap.ui.xmlfragment("com.tasa.consultahorom.view.Embarcacion", this);
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
							var detalle = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].NMEMB;
							if (this.currentInputEmba.includes("inputId0_R")) {
								this.byId("inputId0_R").setValue(data);
								// this.byId("idText").setText(detalle);
							}else if(this.currentInputEmba.includes("inputId0_R")){
								this.byId("inputId0_R").setValue(data);
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

						onSearch: function (oEvent) {
							// add filter for search
							var aFilters = [];
							var sQuery = oEvent.getSource().getValue();
							if (sQuery && sQuery.length > 0) {
								var filter = new Filter([
									
									new Filter("fecha", FilterOperator.Contains, sQuery),
									new Filter("motorPrincipal", FilterOperator.Contains, sQuery),
									new Filter("motorAuxiliar", FilterOperator.Contains, sQuery),
									new Filter("motorAuxiliar2", FilterOperator.Contains, sQuery),
									new Filter("motorAuxiliar3", FilterOperator.Contains, sQuery),
									new Filter("motorAuxiliar4", FilterOperator.Contains, sQuery),
									new Filter("motorAuxiliar5", FilterOperator.Contains, sQuery),
									new Filter("panga", FilterOperator.Contains, sQuery),
									new Filter("flujometro", FilterOperator.Contains, sQuery),
								]);
								aFilters.push(filter);
							}
				
							// update list binding
							var oList = this.byId("table");
							var oBinding = oList.getBinding("rows");
							oBinding.filter(aFilters, "Application");
						},
						onExportarExcelData: function() {
							oGlobalBusyDialog.open();
							if(!exportarExcel){
								MessageBox.error("Porfavor, realizar una b??squeda antes de exportar");
								oGlobalBusyDialog.close();
								return false;
							}
							var aCols, aProducts, oSettings, oSheet;
				
							aCols = this.createColumnConfig5();
							aProducts = this.getView().getModel("Horometro").getProperty('/listaHorometro');
				
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
								fileName:"Reporte de Hor??metros"
							};
				
							oSheet = new Spreadsheet(oSettings);
							oSheet.build()
								.then( function() {
									MessageToast.show('El Archivo ha sido exportado correctamente');
								})
								.finally(oSheet.destroy);
								oGlobalBusyDialog.close();
						},
						createColumnConfig5: function() {
							return [
								{
									label: 'NRO',
									property: 'NRO' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'fecha',
									property: 'fecha' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Principal',
									property: 'motorPrincipal' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar',
									property: 'motorAuxiliar' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar2',
									property: 'motorAuxiliar2' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar3',
									property: 'motorAuxiliar3' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar4',
									property: 'motorAuxiliar4' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar5',
									property: 'motorAuxiliar3' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Panga',
									property: 'panga' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Fluj??metro',
									property: 'flujometro' ,
									type: EdmType.String,
									scale: 2
								}
								];
						},
						
						onExportarExcelData2: function() {
							oGlobalBusyDialog.open();
							if(!exportarExcel){
								MessageBox.error("Porfavor, realizar una b??squeda antes de exportar");
								oGlobalBusyDialog.close();
								return false;
							}
							var aCols, aProducts, oSettings, oSheet;
				
							aCols = this.createColumnConfig2();

							aProducts = this.getView().getModel("HorometroEmba").getProperty('/listaHorometro');
				
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
								fileName:"Reporte de Hor??metros por Embarcaci??n"
							};
				
							oSheet = new Spreadsheet(oSettings);
							oSheet.build()
								.then( function() {
									MessageToast.show('El Archivo ha sido exportado correctamente');
								})
								.finally(oSheet.destroy);
								oGlobalBusyDialog.close();
						},
						createColumnConfig2: function() {
							return [
								{
									label: 'Matr??cula',
									property: 'matricula' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Nombre Embarcaci??n',
									property: 'nombreEmbarcacion' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Flota',
									property: 'flota' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'fecha',
									property: 'fecha' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Principal',
									property: 'motorPrincipal' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar1',
									property: 'motorAuxiliar1' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar2',
									property: 'motorAuxiliar2' ,
									type: EdmType.String,
									scale: 2
								},
								
								
								{
									label: 'Motor Auxiliar3',
									property: 'motorAuxiliar3' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar4',
									property: 'motorAuxiliar4' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Motor Auxiliar5',
									property: 'motorAuxiliar3' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Panga',
									property: 'panga' ,
									type: EdmType.String,
									scale: 2
								},
								{
									label: 'Fluj??metro',
									property: 'flujometro' ,
									type: EdmType.String,
									scale: 2
								}
								];
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