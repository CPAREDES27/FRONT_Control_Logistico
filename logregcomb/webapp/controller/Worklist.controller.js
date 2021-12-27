sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',	
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,MessageBox,ExportTypeCSV,Export,exportLibrary,
	Spreadsheet,BusyIndicator,Fragment) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var exportarExcel=false;
	var EdmType = exportLibrary.EdmType;
	const HOST1 = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com/";
	const HOST2 =".AyudasBusqueda"
	const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
	return BaseController.extend("com.tasa.logregcomb.controller.Worklist", {

		formatter: formatter,

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
			this.byId("idAciertos").setValue("200");
			
		},
		onAfterRendering: function(){
			//this.callConstantes();
		},

		callConstantes: function(){
			var body={
				"nombreConsulta": "CONSGENCONST",
				"p_user": "FGARCIA",
				"parametro1": "IDCOMPH4",
				"parametro2": "",
				"parametro3": "",
				"parametro4": "",
				"parametro5": ""
			}
			fetch(`${mainUrlServices}General/ConsultaGeneral/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					
					console.log(data.data);
					this.HOST=HOST1+data.data[0].LOW+HOST2;
					console.log(this.HOST);
						oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
			);
		},
		listaEmbarcacion: function(){
			oGlobalBusyDialog.open();
			console.log("BusquedaEmbarca");
			var inputId_W =sap.ui.getCore().byId("inputId_W").getValue();
			var inputId_WDesc =sap.ui.getCore().byId("inputId_WDesc").getValue();
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
			if(inputId_W){
				options.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": inputId_W
					
				});
			}
			if(inputId_WDesc){
				options.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": inputId_WDesc
					
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
					this.getModel().setProperty("/INPRP", ZINPRP);
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
					this._oDialogEmbarcacion = sap.ui.xmlfragment("com.tasa.logregcomb.view.DlgEmbarcacion", this.getView().getController());
					this.getView().addDependent(this._oDialogEmbarcacion);
				}
				sap.ui.getCore().byId("inputId_W").setValue("");
			sap.ui.getCore().byId("inputId_WDesc").setValue("");
			sap.ui.getCore().byId("idMatricula").setValue("");
			sap.ui.getCore().byId("idRuc").setValue("");
			sap.ui.getCore().byId("idArmador").setValue("");
				return this._oDialogEmbarcacion;
			},
			_onBuscarButtonPress: function(){
				var inputId_W =sap.ui.getCore().byId("inputId_W").getValue();
				var inputId_WDesc =sap.ui.getCore().byId("inputId_WDesc").getValue();
				var idMatricula =sap.ui.getCore().byId("idMatricula").getValue();
				var idRuc =sap.ui.getCore().byId("idRuc").getValue();
				var idArmador =sap.ui.getCore().byId("idArmador").getValue();

				if(!inputId_W && !inputId_WDesc && !idMatricula && !idRuc && !idArmador){
					
					this.listaEmbarcacion();
					oGlobalBusyDialog.close();
				}
				
				
			
			},
			listaEmbarcacion: function(){
				oGlobalBusyDialog.open();
				console.log("BusquedaEmbarca");
				var inputId_W =sap.ui.getCore().byId("inputId_W").getValue();
				var inputId_WDesc =sap.ui.getCore().byId("inputId_WDesc").getValue();
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
				if(inputId_W){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "CDEMB",
						"valueHigh": "",
						"valueLow": inputId_W
						
					});
				}
				if(inputId_WDesc){
					options.push({
						"cantidad": "20",
						"control": "INPUT",
						"key": "NMEMB",
						"valueHigh": "",
						"valueLow": inputId_WDesc
						
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
				this.byId("inputId_W").setValue(data);
				this._onCloseDialogEmbarcacion();
			},
			onBusqueda: function(){
				oGlobalBusyDialog.open();
				var idMareaIni = this.byId("idMareaIni").getValue();
				var idMareaFin = this.byId("idMareaFin").getValue();
				var idFechaInicio = this.byId("idFecha").getValue();
				var idFechaIni = this.byId("idFecha").mProperties.dateValue;
				var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
				var estado = this.byId("idEstado").getSelectedKey();
				var inputId_W = this.byId("inputId_W").getValue();
				var idAciertos = this.byId("idAciertos").getValue();
				var idImputacion = this.byId("idImputacion").getSelectedKey();
				console.log(idMareaIni+" "+idMareaFin+" "+estado+" "+inputId_W+" "+idAciertos+ " "+idImputacion);
			//#region
				var error="";
				var valido=true;

				// if(!this.byId("idFecha").mProperties.dateValue){
				// 	error+="Debe ingresar un rango de fechas"
				// 	oGlobalBusyDialog.close();
				// 	valido= false;
				// }
				// if(!valido){
				// 	MessageBox.error(error);
				// 	return false;
				// }
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
				if(idFechaInicio){
					options.push({
						cantidad: "10",
						control:"MULTIINPUT",
						key:"FECON",
						valueHigh: fechaFin,
						valueLow:fechaIni
					});
				}
				if(estado){
					options.push({
						cantidad: "10",
						control:"COMBOBOX",
						key:"ESPRO",
						valueHigh: "",
						valueLow:estado
					});
				}
				if(inputId_W){
					options.push({
						cantidad: "10",
						control:"INPUT",
						key:"EMB~WERKS",
						valueHigh: "",
						valueLow:inputId_W
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
					if(dataPuerto.str_lgcco){
						exportarExcel=true;
					}
					if(dataPuerto.str_lgcco==="null" || dataPuerto.str_lgcco===null){
						errors=dataPuerto.mensaje;
						this.byId("title").setText("Lista de registros: No se encontraron resultados");
					}
					for(var i=0;i<dataPuerto.str_lgcco.length;i++){
						dataPuerto.str_lgcco[i].nrmar=this.zeroFill(dataPuerto.str_lgcco[i].nrmar,10);
					}
					
					console.log(dataPuerto.str_lgcco);
					var arrayLista=dataPuerto.str_lgcco;
					
					
					console.log(arrayLista);
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
		onLimpiar: function(){
			this.byId("idMareaIni").setValue("");
			this.byId("idMareaFin").setValue("");
			this.byId("idFecha").setValue("");
			this.byId("idEstado").setValue("");
			this.byId("inputId_W").setValue("");
			this.byId("idImputacion").setValue("");
			
		},
		createColumnConfig5: function() {
			return [
				{
					label: 'Num. Marea',
					property: 'nrmar' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Embarcación',
					property: 'werks' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha de contabilización',
					property: 'fecon' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Documento SAP Generado',
					property: 'nrdco' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Tipo Imputación',
					property: 'dsimp' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Cantidad consumida',
					property: 'cncon' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Observaciones',
					property: 'dsobs' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Estado',
					property: 'desc_ESPRO' ,
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
				fileName:"Reporte Log Registro de Combustible"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
				oGlobalBusyDialog.close();
		},
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
					new Filter("werks", FilterOperator.Contains, sQuery),
					new Filter("nrmar", FilterOperator.Contains, sQuery),
					new Filter("fecon", FilterOperator.Contains, sQuery),
					new Filter("nrdco", FilterOperator.Contains, sQuery),
					new Filter("dsobs", FilterOperator.Contains, sQuery),
					new Filter("espro", FilterOperator.Contains, sQuery),
					new Filter("cncon", FilterOperator.Contains, sQuery),
					new Filter("dsimp", FilterOperator.Contains, sQuery)
					
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
			var inputId_W = sap.ui.getCore().byId("idEmba").getValue();
			var inputId_WDesc = sap.ui.getCore().byId("idNombEmba").getValue();
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
			if (inputId_W) {
				options.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": inputId_W

				});
			}
			if (inputId_WDesc) {
				options.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": inputId_WDesc.toUpperCase()

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
				this.oDialog = sap.ui.xmlfragment("com.tasa.logregcomb.view.Embarcacion", this);
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
			if (this.currentInputEmba.includes("inputId_W")) {
				this.byId("inputId_W").setValue(data);
			}else if(this.currentInputEmba.includes("inputId_W")){
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
			this.getView().getModel("consultaMareas").setProperty("/embarcaciones","");
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