sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,MessageBox) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var mimeDet=null;
	var fileName=null;
	var fileDetails=null;
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
			this.loadCombos();	
			this.loadIndicadorP();
			this.byId("idAciertos").setValue("200");
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
			buscar: function(evt){
				var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
				var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].WERKS;
				this.byId("idEmbarcacion").setValue(data);
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
				fetch(`${mainUrlServices}dominios/Listar/`,
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
				fetch(`${mainUrlServices}dominios/Listar`,
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
			
			loadTabla: function(){
				oGlobalBusyDialog.open();
				var idEmbarcacion = this.byId("idEmbarcacion").getValue();
				var fechaIni = this.byId("idFechaIniVigencia").getValue();
				var idMotivo = this.byId("idMotivo").getSelectedKey();
				var idFase = this.byId("idFase").getSelectedKey();
				var idAciertos= this.byId("idAciertos").getValue();
				var error=""
				var options=[];
				var estado=true;
				if(!fechaIni){
				 error="Debe ingresar una fecha de inicio de vigencia\n";
				 estado=false;
				}
				
				if(!estado){
					MessageBox.error(error);
					oGlobalBusyDialog.close()
					return false;
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
				  fetch(`${mainUrlServices}reportesmodifdatoscombustible/Listar/`,
					   {
						   method: 'POST',
						   body: JSON.stringify(body)
					   })
					   .then(resp => resp.json()).then(data => {
							console.log(data);
							this.getModel("Lista").setProperty("/listaLista", data.t_flocc);
							this.byId("title").setText("Indicador de modificación: "+data.indicadorPorc+"%");
							oGlobalBusyDialog.close();
					   }).catch(error => console.log(error)
					   );

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
						name: "Embarcación",
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
						name: "Fec. producción",
						template: {
						  content: "{FECCONMOV}"
						}
					  },
					  {
						name: "Fec. modificación",
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
						name: "Texto explicativo por modificación",
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
				}
	});
});