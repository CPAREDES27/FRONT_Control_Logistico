sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
    "sap/ui/model/ValidateException",
	"sap/ui/core/Core",
	"sap/ui/core/Popup",
	"sap/m/PDFViewer",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/util/Export",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/BusyIndicator",
	"./Utilities"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,Fragment,MessageBox,MessageToast,ValidateException,Core,Popup,PDFViewer,ExportTypeCSV,Export,exportLibrary,Spreadsheet,BusyIndicator,Utilities) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	
	var valeVivere=null;
	var CodImprime="";
	var EdmType = exportLibrary.EdmType;
	const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
	return BaseController.extend("com.tasa.valeviveres.controller.Worklist", {

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
			this.listPlanta();	
			this.listAlmacen();
			this.listaCombos();
			
		},
		listaCombos: function(){
			
			var temporada=null;
			var ZINPRP=null;
			var body={
				"dominios": [
				  {
					"domname": "TEMPORADA",
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
				var dataPuerto=data.data;
				console.log(dataPuerto);
				temporada = data.data.find(d => d.dominio == "TEMPORADA").data;
				ZINPRP = data.data.find(d => d.dominio == "ZINPRP").data;
				console.log(this.getView().getModel("Temporada").setProperty("/listaTemporada",temporada));
				console.log(this.getView().getModel("Propia").setProperty("/listaPropia",ZINPRP));
				
					oGlobalBusyDialog.close();
				
			  }).catch(error => console.log(error)
			  );
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

	
		onNavBack : function() {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},


		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("CategoryName", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		
		_showObject : function (oItem) {
			// this.getRouter().navTo("object", {
			// 	objectId: oItem.getBindingContext().getPath().split("/")[2]
			// });
			let sPath = oItem.getBindingContext().getPath();
			if(!this.oDetailVale){
				this.oDetailVale = Fragment.load({
					name:"com.tasa.valeviveres.fragments.DetailVale",
					controller:this
				}).then(oDialog=>{
					this.getView().addDependent(oDialog);
					return oDialog;
				})
			}
			this.oDetailVale.then(oDialog=>{
				oDialog.bindElement(sPath);
				oDialog.open();
			})
		},

	
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},

		
		onClose:function(oEvent){
			let oDialog = oEvent.getSource().getParent();
			oDialog.close();
		},
		_onOpenDialogArmador: function(evn) {
				
			this.popUp=evn;
			this.getView().getModel("Armador").setProperty("/listaArmador","");
			this._getDialogArmador().open();
		},

		_onCloseDialogArmador: function() {
			this._getDialogArmador().close();
			sap.ui.getCore().byId("idRuc2").setValue("");
			sap.ui.getCore().byId("idDescripcion").setValue("");
			sap.ui.getCore().byId("idCuentaProveedor").setValue("");
			sap.ui.getCore().byId("idListaArmador").setText("Lista de registros:");
			
		},
		onLimpiarArmador: function(){
			sap.ui.getCore().byId("idRuc2").setValue("");
			sap.ui.getCore().byId("idDescripcion").setValue();
			sap.ui.getCore().byId("idCuentaProveedor").setValue("");
			this.getView().getModel("Armador").setProperty("/listaArmador","");
		},

		onLimpiar: function(){
			this.byId("idValeIni").setValue("");
			this.byId("idValeFin").setValue("");
			this.byId("idFechaVivere").setValue("");
			this.byId("idArmadorIni").setValue("");
			this.byId("inputId0_R").setValue("");
			this.byId("idPlantaIni").setValue("");
			this.byId("idAlmacenIni").setValue("");
			this.byId("idAlmacenIni").setDescription("");
			this.byId("idAlmacenExterno").setValue("");
			this.byId("cboIndicador").setValue("");
			this.byId("idCentro").setValue("");
			this.byId("cboTemporada").setValue("");
			this.byId("idCantidad").setValue("200");
			this.byId("idPlantaIni").setDescription("");
			this.getView().getModel("Vivere").setProperty("/listaVivere","");
			
		},
		_getDialogArmador : function () {
			if (!this._oDialogArmador) {
				this._oDialogArmador = sap.ui.xmlfragment("com.tasa.valeviveres.view.DlgArmador", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador);
				sap.ui.getCore().byId("idAciertosPop").setValue("200");
			}
			
			return this._oDialogArmador;
		},
		buscar: function(evt){
			console.log(evt);
			var indices = evt.mParameters.listItem.oBindingContexts.Armador.sPath.split("/")[2];
			console.log(indices);
			var data = this.getView().getModel("Armador").oData.listaArmador[indices].STCD1;
			if(this.popUp==="popOne"){
				this.byId("idArmadorIni").setValue(data);
			}else if(this.popUp==="popTwo"){
				this.byId("idArmadorFin").setValue(data);
			}
			
			this._onCloseDialogArmador();	
		},
		listaArmador: function(){
			oGlobalBusyDialog.open();
			var idAciertos = 	sap.ui.getCore().byId("idAciertosPop").getValue().trim();
			var idRuc = 	sap.ui.getCore().byId("idRuc2").getValue().trim();
			var idDescripcion = 	sap.ui.getCore().byId("idDescripcion").getValue().trim();
			var idCuentaProveedor =	sap.ui.getCore().byId("idCuentaProveedor").getValue().trim();
			
			console.log(idAciertos);
			console.log(idRuc);
			console.log(idDescripcion);
			console.log(idCuentaProveedor);
			
			var body={
				"delimitador": "|",
				"fields": [
				  "KUNNR","NAME1","STCD1"
				],
				"no_data": "",
				"option": [
				 
				],
				"options": [
					{
						"cantidad": "10",
						"control": "INPUT",
						"key": "KUNNR",
						"valueHigh": "",
						"valueLow": idCuentaProveedor,
					  },
					  {
						"cantidad": "10",
						"control": "INPUT",
						"key": "NAME1",
						"valueHigh": "",
						"valueLow": idDescripcion,
					  },
					  {
						"cantidad": "10",
						"control": "INPUT",
						"key": "STCD1",
						"valueHigh": "",
						"valueLow": idRuc,
					  }
				  
				],
				"order": "",
				"p_user": "FGARCIA",
				"rowcount": idAciertos,
				"rowskips": 0,
				"tabla": "KNA1"
			  }
			  fetch(`${Utilities.onLocation()}General/Read_table/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data.data;
					console.log(dataPuerto);
					console.log(this.getView().getModel("Armador").setProperty("/listaArmador",dataPuerto));
					sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: "+dataPuerto.length);
					if(dataPuerto.length<=0){
						sap.ui.getCore().byId("idListaArmador").setText("Lista de registros: No se encontraron resultados");
					}
					oGlobalBusyDialog.close();
				  }).catch(function(error){
						if(error){
							MessageBox.error(error.message);
							oGlobalBusyDialog.close();
						}
				  });
		},
		listPlanta: function(){
			oGlobalBusyDialog.open();
			var dataPlantas={
				"nombreAyuda": "BSQPLANTAS",
				"p_user": "FGARCIA"
			  }
			  fetch(`${Utilities.onLocation()}General/AyudasBusqueda`,
			  {
				  method: 'POST',
				  body: JSON.stringify(dataPlantas)
			  })
			  .then(resp => resp.json()).then(data => {
				var dataPuerto=data.data;
				console.log(dataPuerto);
				console.log(this.getView().getModel("Planta").setProperty("/listaPlanta",dataPuerto));
				
					oGlobalBusyDialog.close();
				
			  }).catch(error => console.log(error)
			  );
			
		},
		listAlmacen: function(){
			oGlobalBusyDialog.open();
			var dataPlantas={
				"nombreAyuda": "BSQALMACEN",
				"p_user": "FGARCIA"
			  }
			  fetch(`${Utilities.onLocation()}General/AyudasBusqueda`,
			  {
				  method: 'POST',
				  body: JSON.stringify(dataPlantas)
			  })
			  .then(resp => resp.json()).then(data => {
				var dataPuerto=data.data;
				console.log(data.data);
				console.log(this.getView().getModel("Almacen").setProperty("/listaAlmacen",dataPuerto));
				
					oGlobalBusyDialog.close();
				
			  }).catch(error => console.log(error)
			  );
			
		},
		setCentro:function(){
			var codPlanta= this.byId("idPlantaIni").getValue();
			var array=this.getView().getModel("Planta").oData.listaPlanta;
			var centro="";
			var descr="";
			console.log(array);
			console.log(codPlanta);
			
			
			for(var i=0;i<array.length;i++){
				if(array[i].CDPTA===codPlanta){
					centro=array[i].WERKS;
					descr = array[i].DESCR;
				}
			}
			if(this.byId("idPlantaIni")){
				this.byId("idCentro").setValue(centro);
				this.byId("idPlantaIni").setDescription(descr);
			}
		},
		onChangeAlmacen: function(){
			var codPlanta= this.byId("idAlmacenIni").getValue();
			var array=this.getView().getModel("Almacen").oData.listaAlmacen;
			var centro="";
			var almacenExterno="";
			console.log(array);
			console.log(codPlanta);
			if(!codPlanta){
				MessageBox.error("El código de Almacén no existe");
			}
			for(var i=0;i<array.length;i++){
				if(array[i].CDALM===codPlanta){
					centro=array[i].DSALM;
					almacenExterno=array[i].CDALE;
				}
			}
			if(this.byId("idAlmacenIni")){
				this.byId("idAlmacenIni").setDescription(centro);
				this.byId("idAlmacenExterno").setValue(almacenExterno);
			}
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
		onBusqueda: function(){
			var idValeIni = this.byId("idValeIni").getValue();
			var idValeFin = this.byId("idValeFin").getValue();
			var idFechaI = this.byId("idFechaVivere").getValue();	
			var idFechaInicio=this.byId("idFechaVivere").mProperties.dateValue;
			var idFechaFin= this.byId("idFechaVivere").mProperties.secondDateValue;
			var idArmadorIni = this.byId("idArmadorIni").getValue();
			var idEmbarcacion = this.byId("inputId0_R").getValue();
			var idPlantaIni = this.byId("idPlantaIni").getValue();
			var idAlmacenIni = this.byId("idAlmacenIni").getValue();
			var cboTemporada = this.byId("cboTemporada").getSelectedKey();
			var cboIndicador = this.byId("cboIndicador").getSelectedKey();
			var idCantidad = this.byId("idCantidad").getValue();

			// if(!idFechaInicio){
			// 	MessageBox.error("La fecha de arribo es obligatorio");
			// 	oGlobalBusyDialog.close();
			// 	return false;
			// }
			var idFechaIni=this.castFecha(idFechaInicio);
			var idFechaF=this.castFecha(idFechaFin);
			this.fechaInicio=idFechaIni;
			this.fechaFin=idFechaF;

			//validaInputs 
			
			//validaInputs
			var options=[];
			if(idValeIni&& idValeFin){
				options.push({
					"cantidad": "10",
					"control": "MULTIINPUT",
					"key": "NRVVI",
					"valueHigh": idValeFin,
					"valueLow": idValeIni
				});
			}
			if(idValeIni&& !idValeFin){
				options.push({
					"cantidad": "10",
					"control": "INPUT",
					"key": "NRVVI",
					"valueHigh": "",
					"valueLow": idValeIni
				});
			}
			if(!idValeIni&& idValeFin){
				options.push({
					"cantidad": "10",
					"control": "INPUT",
					"key": "NRVVI",
					"valueHigh": "",
					"valueLow": idValeFin
				});
			}
			if(idFechaI){
				options.push({
					"cantidad": "10",
					"control": "MULTIINPUT",
					"key": "FCVVI",
					"valueHigh": idFechaF,
					"valueLow": idFechaIni
				});
			}

			if(idArmadorIni){
				options.push({
					"cantidad": "10",
					"control": "INPUT",
					"key": "ARCMC",
					"valueHigh": "",
					"valueLow": idArmadorIni
				});
			}
			if(idEmbarcacion){
				options.push({
					"cantidad": "10",
					"control": "INPUT",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": idEmbarcacion
				});
			}
			if(cboTemporada){
				options.push({
					"cantidad": "10",
					"control": "COMBOBOX",
					"key": "CDTPO",
					"valueHigh": "",
					"valueLow":cboTemporada
				});
			}
			if(idPlantaIni){
				options.push({
					"cantidad": "10",
					"control": "INPUT",
					"key": "CDPTA",
					"valueHigh": "",
					"valueLow": idPlantaIni
				});
			}
			if(idAlmacenIni){
				options.push({
					"cantidad": "10",
					"control": "INPUT",
					"key": "CDALM",
					"valueHigh": "",
					"valueLow": idAlmacenIni
				});
			}
			if(cboIndicador){
				options.push({
					"cantidad": "10",
					"control": "COMBOBOX",
					"key": "INPRP",
					"valueHigh": "",
					"valueLow": cboIndicador
				});
			}
			console.log(options);
			var body={
				"fields": [
				
				],
				"options1": [
				  
				],
				"options2": options,
				"p_user": "FGARCIA",
				"rowcount": idCantidad
			};
			oGlobalBusyDialog.open();
			fetch(`${Utilities.onLocation()}valeviveres/Listar/`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				var listaViviere = data.data;
				console.log(listaViviere);
				
				this.getView().getModel("Vivere").setProperty("/listaVivere",listaViviere);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			);
		},
		buscardd: function(evnt){
			var hola=evnt.mParameters.rowContext.sPath.split("/")[2];
			var array=this.getModel("Vivere").getProperty("/listaVivere")[hola];
			this.valeVivere=array;
			console.log(this.valeVivere);
			if(array.ESVVI!="A"){
				this.byId("idAnular").setEnabled(true);
				this.byId("idImprmir").setEnabled(true);
			
			}else{
				this.byId("idAnular").setEnabled(false);
				
				this.byId("idImprmir").setEnabled(false);
			}
			console.log(hola);
		},
		onAnularVale: function(evnt){
			console.log("NUMERO "+this.valeVivere.NRVVI);
			this.onOpenDialog();
			sap.ui.getCore().byId("idVale").setValue(this.valeVivere.NRVVI);
		},
		onImprimir: function(detail){
			oGlobalBusyDialog.open();
			var codigo="";
			if(detail==="detail"){
				
				codigo=this.CodImprime;
			}
			if(detail==="lista"){
				codigo=this.valeVivere.NRVVI;
			}
			var body={
				"numValeVivere": codigo,
				"p_user": "FGARCIA"
			}
			fetch(`${Utilities.onLocation()}tripulantes/PDFValeViveres`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				
				this.showPDF(data.base64);
				oGlobalBusyDialog.close();
			  }).catch(error => console.log(error)
			  );
		},
		showPDF: function(base64){
			this._PDFViewer2=null;
			var base64EncodedPDF=base64;
			var decodedPdfContent = atob(base64EncodedPDF);
			var byteArray = new Uint8Array(decodedPdfContent.length)
			for(var i=0; i<decodedPdfContent.length; i++){
				byteArray[i] = decodedPdfContent.charCodeAt(i);
			}
			var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
			var _pdfurl = URL.createObjectURL(blob);
			if(!this._PDFViewer2){
				this._PDFViewer2 = new sap.m.PDFViewer({
					width:"auto",
					source:_pdfurl, // my blob url
					title: "Vale de Víveres",
					showDownloadButton:false
				});
				jQuery.sap.addUrlWhitelist("blob"); // register blob url as whitelist
		   }
		   this._PDFViewer2.downloadPDF = function(){
		   File.save(
			   byteArray.buffer,
			   "Hello_UI5",
			   "pdf",
			   "application/pdf"
			   );
		   };
		   this._PDFViewer2.open();
		   oGlobalBusyDialog.close();
		},
		onAnular: function(){
			var codeVive= sap.ui.getCore().byId("idVale").getValue();
			var motivo= sap.ui.getCore().byId("idMotivo").getValue();
			if(!motivo){
				sap.ui.getCore().byId('idMotivo').setValueState(sap.ui.core.ValueState.Error); 
			}
			var body={
				"p_anula": "string",
				"p_user": motivo,
				"p_vale": codeVive
			}
			oGlobalBusyDialog.open();
			fetch(`${Utilities.onLocation()}valeviveres/AnularValev`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				MessageBox.success(data.t_mensaje[0].DSMIN);
				this.onCloseDialog();
				this.onBusqueda();
				
			  }).catch(error => console.log(error)
			  );
		},
		validaInput: function(){
			sap.ui.getCore().byId('idMotivo').setValueState(); 
		},
		_getDialog : function () {
			if (!this._oDialog) {
			   this._oDialog = sap.ui.xmlfragment("com.tasa.valeviveres.view.Vivere", this.getView().getController());
			   this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		 },
		 onOpenDialog : function () {
			this._getDialog().open();
		 },
		 onCloseDialog : function () {
			this._getDialog().close();
		 },
		//OpenDetail

		_getsDialog : function () {
			if (!this._oDialog) {
			   this._oDialog = sap.ui.xmlfragment("com.tasa.valeviveres.view.Detail", this.getView().getController());
			   this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		 },
		 onOpenDialogs : async function (evn) {
			await this.poblarSuministros(evn);
			this._getsDialog().open();
		 },
		 onCloseDialogs : function () {
			this._getsDialog().close();
		 },
		 onNuevo:function(){

		 },
		 goNuevo: function(){
			this.getRouter().navTo("Nuevo");
			
		 },
		 poblarSuministros: async function(evn){
			var position=evn.oSource.oPropagatedProperties.oBindingContexts.Vivere.sPath.split("/")[2];
			this.getView().bindElement({path: "Vivere>/listaVivere/"+ position});
			var array=this.getModel("Vivere").getProperty("/listaVivere")[position].NRVVI;
			this.CodImprime=array;
			var fecha=this.getModel("Vivere").getProperty("/listaVivere")[position].FFTVS;
			var dataVivere= this.getModel("Vivere").getProperty("/listaVivere")[position];
			var total=0;

			console.log(array);
			var body={
				"fields": [
				  
				],
				"p_code": array,
				"p_user": "FGARCIA"
			}
			await fetch(`${Utilities.onLocation()}valeviveres/DetalleImpresionViveres`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				  console.log(data.s_posicion);
				var dataSuministro=data.s_posicion;
				for(var i=0;i<dataSuministro.length;i++){
					//dataSuministro.QTSUMTOTAL+=Number(dataSuministro[i].QTSUM);
					total+=dataSuministro[i].QTSUM;
					console.log(total);
					dataSuministro.QTSUMTOTAL=total;
					dataSuministro[i].FECHA=fecha;
				}
				
				this.getView().getModel("Suministro").setProperty("/listaSuministro",dataSuministro);
				
				
			  }).catch(error => console.log(error)
			  );
			  this.getView().bindElement({path: "Suministro>/listaSuministro/"});
			  
			  this.onOpenDialogs();
		 },
		 onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter([
					new Filter("NRVVI", FilterOperator.Contains, sQuery),
					  new Filter("NMEMB", FilterOperator.Contains, sQuery),
					  new Filter("NAME1", FilterOperator.Contains, sQuery),
					  new Filter("DSALM", FilterOperator.Contains, sQuery),
					  new Filter("DESC_INPRP", FilterOperator.Contains, sQuery),
					  new Filter("DSTPO", FilterOperator.Contains, sQuery),
					  new Filter("FCVVI", FilterOperator.Contains, sQuery),
					  new Filter("DESC_ESVVI", FilterOperator.Contains, sQuery),
					  new Filter("AUFNR", FilterOperator.Contains, sQuery),
					  new Filter("DESCR", FilterOperator.Contains, sQuery),
					  new Filter("KOSTL", FilterOperator.Contains, sQuery)
				
				]);
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("table");
			var oBinding = oList.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},
		onExport: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfig();
		
			aProducts = this.getView().getModel("Vivere").getProperty('/listaVivere');

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
				fileName:"REPORTE VALE DE VIVERES"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfig: function() {
			return [
				{
					label: 'Vale',
					property: 'NRVVI' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Temporada',
					property: 'CDTPO' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción Temporada',
					property: 'DSTPO' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Planta',
					property: 'CDPTA' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción Planta',
					property: 'DESCR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Centro',
					property: 'WERKS' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Almacén',
					property: 'CDALM' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción de Almacén',
					property: 'DSALM' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Embarcación',
					property: 'CDEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción Embarcación',
					property: 'NMEMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Matrícula',
					property: 'MREMB' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Armador',
					property: 'CDEMP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción Armador',
					property: 'NAME1' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Armador Comercial',
					property: 'ARCMC' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción Armador Comercial',
					property: 'NAME2' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'RUC Armador Comerc',
					property: 'RUCCP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Dirección',
					property: 'DIREC' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Centro Costo',
					property: 'KOSTL' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Código Cocinero',
					property: 'PERNR' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Nombre Cocinero',
					property: 'NMPER' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Proveedor',
					property: 'CDPVE' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Descripción proveedor',
					property: 'NAME3' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'RUC Proveedor',
					property: 'RUCCP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Indicador Propiedad',
					property: 'DESC_INPRP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Número Tripulantes',
					property: 'NRTRI' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha Inicio Travesía',
					property: 'FITVS' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha Fin Travesía',
					property: 'FFTVS' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Duración Travesía',
					property: 'DRTVS' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Estado Impresión',
					property: 'ESIMP' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Estado Registro',
					property: 'DESC_ESVVI' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Documento Compra',
					property: 'EBELN' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Documento Contable',
					property: '' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Orden Fabricación',
					property: '' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Observación',
					property: 'OBVVI' ,
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha de creación',
					property: 'FCVVI' ,
					type: EdmType.String,
					scale: 2
				}
				];
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
				this.oDialog = sap.ui.xmlfragment("com.tasa.valeviveres.view.Embarcacion", this);
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
			
				this.byId("inputId0_R").setValue(data);
				
				
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
			this.getModel("consultaMareas").setProperty("/TituloEmba", "");
			this.getModel("consultaMareas").setProperty("/embarcaciones","");
		},		
		onSearchHelp:async function(oEvent){
			let sIdInput = oEvent.getSource().getId(),
			oModel = this.getModel(),
			nameComponent="busqembarcaciones",
			idComponent="busqembarcaciones",
			urlComponent=HOST+"/9acc820a-22dc-4d66-8d69-bed5b2789d3c.AyudasBusqueda.busqembarcaciones-1.0.0",
			oView = this.getView(),
			oInput = this.getView().byId(sIdInput);
			oModel.setProperty("/input",oInput);
			oModel.setProperty("/help",{});

			if(!this.DialogComponent){
				this.DialogComponent = await Fragment.load({
					name:"com.tasa.valeviveres.view.fragments.BusqEmbarcacion",
					controller:this
				});
				oView.addDependent(this.DialogComponent);
			}
			oModel.setProperty("/idDialogComp",this.DialogComponent.getId());

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