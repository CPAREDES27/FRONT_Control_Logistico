sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,MessageBox,ExportTypeCSV,Export) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	return BaseController.extend("com.tasa.logregistrocomb.controller.Worklist", {

		formatter: formatter,

		onInit : function () {
			this.loadCombos();
			this.byId("idAciertos").setValue("200");
			
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
		zeroFill: function( number, width )
		{
			width -= number.toString().length;
			if ( width > 0 )
			{
				return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
			}
			return number + ""; // siempre devuelve tipo cadena
		},
		
		loadCombos: function(){
			oGlobalBusyDialog.open();
			var ZDO_ESREGC=null;
			var ZINPRP=null;
			var ZD_TPIMPU = null;
			const body={
				"dominios": [
					{
						"domname": "ZDO_ESREGC",
						"status": "A"
					  },
					  {
						"domname": "ZINPRP",
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
					console.log(dataPuerto);
					ZDO_ESREGC= data.data.find(d => d.dominio == "ZDO_ESREGC").data;
					ZD_TPIMPU = data.data.find(d => d.dominio == "ZD_TPIMPU").data;
					ZINPRP=data.data.find(d => d.dominio == "ZINPRP").data;
					this.getModel("Estado").setProperty("/ZDO_ESREGC", ZDO_ESREGC);
					this.getModel("Propiedad").setProperty("/ZINPRP", ZINPRP);
					this.getModel("Imputacion").setProperty("/ZD_TPIMPU", ZD_TPIMPU);
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
				  );
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
					this._oDialogEmbarcacion = sap.ui.xmlfragment("com.tasa.logregistrocomb.view.DlgEmbarcacion", this.getView().getController());
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

				if(!idEmbarcacion && !idEmbarcacionDesc && !idMatricula && !idRuc && !idArmador){
					
					this.listaEmbarcacion();
					oGlobalBusyDialog.close();
				}
				
				
			
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
			onBusqueda: function(){
				oGlobalBusyDialog.open();
				var idMareaIni = this.byId("idMareaIni").getValue();
				var idMareaFin = this.byId("idMareaFin").getValue();
				var idFechaIni = this.byId("idFecha").mProperties.dateValue;
				var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
				var estado = this.byId("idEstado").getSelectedKey();
				var idEmbarcacion = this.byId("idEmbarcacion").getValue();
				var idAciertos = this.byId("idAciertos").getValue();
				var idImputacion = this.byId("idImputacion").getSelectedKey();
				console.log(idMareaIni+" "+idMareaFin+" "+estado+" "+idEmbarcacion+" "+idAciertos+ " "+idImputacion);
			//#region
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
				console.log(fechaIni + " " + fechaFin);
				
			//#endregion
			var errors="";
			var options=[];
				if(idMareaIni && !idMareaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"NRMAR",
						valueHigh: idMareaIni,
						valueLow:idMareaIni
					});
				}
				if(!idMareaIni && idMareaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"NRMAR",
						valueHigh: idMareaFin,
						valueLow:idMareaFin
					});
				}
				if(idMareaIni && idMareaFin){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"NRMAR",
						valueHigh: idMareaFin,
						valueLow:idMareaIni
					});
				}

				console.log(fechaIni + " " + fechaFin);
				// if(fechaIni || fechaFin){
				// 	options.push({
				// 		cantidad: "10",
				// 		control:"MULTIINPUT",
				// 		key:"FECON",
				// 		valueHigh: fechaFin,
				// 		valueLow:fechaIni
				// 	});
				// }
				if(estado){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"ESPRO",
						valueHigh: "",
						valueLow:estado
					});
				}
				if(idEmbarcacion){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"EMB~WERKS",
						valueHigh: "",
						valueLow:idEmbarcacion
					});
				}
				if(idImputacion){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"CDIMP",
						valueHigh: "",
						valueLow:idImputacion
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
					"options": options,
					"p_canti": idAciertos,
					"p_lcco": "X",
					"p_tope": "L",
					"p_user": "FGARCIA"
				  }
				  console.log(body);
				fetch(`${mainUrlServices}logregistrocombustible/Listar`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data;
					console.log(dataPuerto);
					console.log(dataPuerto.mensaje);
					if(dataPuerto.str_lgcco==="null" || dataPuerto.str_lgcco===null){
						errors=dataPuerto.mensaje;
						this.byId("title").setText("Lista de registros: No se encontraron resultados");
					}
					
					console.log(dataPuerto.str_lgcco);
					var arrayLista=dataPuerto.str_lgcco;
					
					console.log(this.getView().getModel("Combustible").setProperty("/listaCombustible",arrayLista));
					this.byId("title").setText("Lista de registros: "+dataPuerto.str_lgcco.length);
					if(dataPuerto.str_lgcco.length<=0){
						this.byId("title").setText("Lista de registros: No se encontraron resultados");
						
					}
					
					console.log(arrayLista.length);
					oGlobalBusyDialog.close();
				  }).catch((error) =>{
					MessageBox.error(errors);
					oGlobalBusyDialog.close();
				  }
				  );
			},
		onDataExport:  function() {
			var oExport = new Export({
				exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
				  separatorChar: ";",
				  charset: "utf-8"
				}),
				//PoliticaPrecio>/listaPolitica
				models: this.getView().getModel("Combustible"),
				rows:{path:""},
				rows: { path: "/listaCombustible" },
				columns: [
				  {
					name: "Marea",
					template: {
					  content: "{nrmar}"
					}
				  },
				  {
					name: "Embarcación",
					template: {
					  content: "{werks}"
					}
				  },
				  {
					name: "Fecha Contabilización",
					template: {
					  content: "{fecon}"
					}
				  },
				  {
					name: "Documento SAP Generado",
					template: {
					  content: "{nrdco}"
					}
				  },
				  {
					name: "Tipo	Imputación",
					template: {
					  content: "{dsimp}"
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
							  new Filter("werks", FilterOperator.Contains, sQuery),
							  new Filter("nrmar", FilterOperator.Contains, sQuery),
							  new Filter("fecon", FilterOperator.Contains, sQuery),
							  new Filter("nrdco", FilterOperator.Contains, sQuery),
							  new Filter("dsobs", FilterOperator.Contains, sQuery),
							  new Filter("espro", FilterOperator.Contains, sQuery),
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
		onDataExport2: function(){
	
				
		},
		onAnularConsumo: function(oEvent){
				
			oGlobalBusyDialog.open();
			var indice = this.byId("table").getSelectedIndices();
			var data ;
			console.log(indice);
			var arreglo=this.getView().byId("table").getModel("Combustible").oData.listaCombustible;
			console.log(arreglo);
			
			var array=[];
			var data=[];
			MessageBox.warning(
						"Desea anular el registro?", {
							icon: MessageBox.Icon.WARNING,
							title: "Anular",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							emphasizedAction: MessageBox.Action.YES,
							onClose: function (oAction) { if(oAction=="YES"){
							   for(var j=0;j<indice.length;j++){
										for(var i=0;i<arreglo.length;i++){
											if(i==indice[j]){
													array={
														"cdimp":arreglo[i].cdimp,
														"cncon":"800",
														"dsimp":arreglo[i].dsimp,
														"dsobs":arreglo[i].dsobs,
														"espro":arreglo[i].espro,
														"esreg":arreglo[i].esreg,
														"fecon":"20191107",
														"mremb":arreglo[i].mremb,
														"nmemb":arreglo[i].nmemb,
														"nrdco":arreglo[i].nrdco,
														"nrlcc":arreglo[i].nrlcc,
														"nrmar":arreglo[i].nrmar,
														"tplcc":arreglo[i].tplcc,
														"werks":arreglo[i].werks
													}
												}
										}
										data.push(array);
								}
								this.anularPrecio(data);
								oGlobalBusyDialog.close();
							}else{oGlobalBusyDialog.close();}}.bind(this)
						}
					); 
		   /*if(!indice.length){
				MessageBox.error("Debe seleccionar un elemento  ");
				return;
		   }else{*/
			
		   //}                
		},
		anularPrecio: function(array){

			// var cadena="";
			// if(array.length<1){
			// 	cadena="El registro"+ array + " fue anulado";
			// }else{
			// 	for(var i=0;i<array.length;i++){
			// 		cadena += "El registro "+array[i] + " fue anulado\n";
			// 	}
				
			// }
			
			var bodyGuardar={
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
				"p_lcco": "X",
				"p_tope": "A",
				"p_user": "FGARCIA",
				"str_lgcco": array
			 };
		  
			console.log(bodyGuardar);
		 
			 fetch(`${mainUrlServices}logregistrocombustible/Listar`,
				{
					method: 'POST',
					body: JSON.stringify(bodyGuardar)
				})
				.then(resp => resp.json()).then(data => {
				
					var mensaje = data.t_mensaje;
					var textMessage="";
					for(var i=0;i<mensaje.length;i++){
						textMessage+=mensaje[i].DSMIN+"\n";
					}
					MessageBox.error(textMessage);
					
				}).catch(error => MessageBox.error("El servicio no está disponible")
				);

		},	

	});
});