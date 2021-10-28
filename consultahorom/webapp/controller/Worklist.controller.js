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
			
			
		},
		listaEmbarcacion: function(){
			oGlobalBusyDialog.open();
			console.log("BusquedaEmbarca");
			var idEmbarcacion =sap.ui.getCore().byId("idEmbarcacion").getValue();
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
					"control": "COMBOBOX",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacion
					
				});
			}
			if(idEmbarcacionDesc){
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacionDesc
					
				});
			}
			if(idMatricula){
				options.push({
					"cantidad": "20",
					"control": "COMBOBOX",
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
					"control": "COMBOBOX",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": idRuc
				})
			}
			if(idArmador){
				options2.push({
					"cantidad": "20",
					"control": "COMBOBOX",
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
			fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
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
		// 	fetch(`${mainUrlServices}embarcacion/ConsultarEmbarcacion/`,
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
			
			var idEmbarcacion = this.byId("idEmbarcacion").getValue();
			console.log(idEmbarcacion);
			var idFechaIni = this.byId("idFecha").mProperties.dateValue;
			var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
			console.log(this.byId("idFecha"));
			var error="";
			var valido=true;
			if(!idEmbarcacion){
				error="Debe ingresar un código de embarcación\n";
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
						  this.byId("idEmbarcacion").setValue("");
						  this.byId("idFecha").setValue("");
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
							sap.ui.getCore().byId("idEmbarcacion").setValue("");
						sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
						sap.ui.getCore().byId("idMatricula").setValue("");
						sap.ui.getCore().byId("idRuc").setValue("");
						sap.ui.getCore().byId("idArmador").setValue("");
							return this._oDialogEmbarcacion;
						},
						_onBuscarButtonPress: function(){
							var idEmbarcacion =sap.ui.getCore().byId("idEmbarcacion").getValue();
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
						listaEmbarcacion2: function(){
							oGlobalBusyDialog.open();
							var body={
								"option": [
									
								],
								"option2": [
									{
										"wa":"ESEMB = 'O'"
									},
									{
										"wa":"AND INPRP LIKE 'P'"
									}							   
								],
								"options": [
								  
								],
								"options2": [
								 
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
									this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion",dataPuerto);
									oGlobalBusyDialog.close();

									
								  }).catch(error => console.log(error)
								  );
						},
						editarMasivo: function(oEvent){
							var indices = sap.ui.getCore().byId("table1").getSelectedIndices();
							console.log(indices);
							if(indices.length>1){
								MessageBox.error("Solo puede seleccionar un elemento");
								return false;
							}else{
								var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
								console.log(data);
								this.byId("idEmbarcacion").setValue(data);
								this._onCloseDialogEmbarcacion();
							}

						},
						buscar: function(evt){
							var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
							var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
							this.byId("idEmbarcacion").setValue(data);
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
										this.getView().getModel("HorometroEmba").setProperty("/listaHorometro",dataHorometro);
										console.log(dataHorometro);
										while(dataHorometro.length>1){
											this.exportaList();
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
										name: "Matrícula",
										template: {
										  content: "{matricula}"
										}
								  },
								  {
									name: "Nombre Embarcación",
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
						}
						
	

	});
});