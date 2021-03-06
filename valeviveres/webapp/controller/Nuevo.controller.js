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
	"sap/ui/core/routing/History",
	"sap/ui/core/BusyIndicator",
	"./Utilities",
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,Fragment,MessageBox,MessageToast,ValidateException,Core,Popup,PDFViewer,History,BusyIndicator, Utilities) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var valeVivere=null;
	const HOST = "https://tasaqas.launchpad.cfapps.us10.hana.ondemand.com";
	return BaseController.extend("com.tasa.valeviveres.controller.Nuevo", {

		formatter: formatter,

	
		onInit : async function () {
			let ViewModel= new JSONModel(
				{}
				);
				this.setModel(ViewModel, "consultaMareas");
		this.currentInputEmba = "";
			this.primerOption = [];
			this.segundoOption = [];
			this.currentPage = "";
			this.lastPage = "";
            this.iniciaFecha();
			this.clean();
            this.getView().getModel("Temporada");
            this.getView().getModel("Almacen");
            this.getView().getModel("Planta");
            this.listaCocinero();
			this.poblarCocinero();
			this.loadCombos();
			this.userOperation = await this._getCurrentUser();
			
			
		},
		onAfterRendering: async function(){
			this.clean();
			await this._getCurrentUser();
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
				"p_user": this.usuario,
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
		setValue: function(evnt){
			var idArmadorIni = this.byId("idArmadorIni").getValue();
			var idFechaTravesiaIni =this.byId("idFechaTravesiaIni").getValue();
			var idFechaTravesiaFin =this.byId("idFechaTravesiaFin").getValue();
			var cboProveedor = this.byId("cboProveedor").getSelectedKey();
			if(cboProveedor){
				this.byId('cboProveedor').setValueState(); 	
			}
			if(idArmadorIni){
				this.byId('idArmadorIni').setValueState(); 
			}
			if(idFechaTravesiaIni){
				this.byId('idFechaTravesiaIni').setValueState(); 
			}
			if(idFechaTravesiaFin){
				this.byId('idFechaTravesiaFin').setValueState(); 
			}

		},
		
		loadCombos: function(){
			oGlobalBusyDialog.open();
			var SUMINISTRO=null;

	
			const body={
				"dominios": [
					{
					  "domname": "SUMINISTRO",
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
					SUMINISTRO= data.data.find(d => d.dominio == "SUMINISTRO").data;
					this.getModel("ComboSuministro").setProperty("/listaComboSuministro", SUMINISTRO);
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
				  );
		},
		clean: function(valor){
			console.log(this.userOperation);
			if(valor==='combo'){
				this.getView().getModel().setProperty("/help",{});
				this.byId('cboTemporada').setValueState(); 
				this.byId('idPlantaIni').setValueState(); 
				this.byId('idAlmacenIni').setValueState(); 
				this.byId('idArmadorIni').setValueState(); 
				this.byId('idFechaTravesiaIni').setValueState(); 
				this.byId('idFechaTravesiaFin').setValueState(); 
				this.byId('cboTemporada').setValueState(); 
				this.byId('cboProveedor').setValueState(); 
				this.byId("inputId1_R").setValueState(); 
				this.byId("idCocinero").setDescription("");
				this.byId("idPlantaIni").setValue("");
				this.byId("idAlmacenIni").setValue("");
				this.byId("inputId1_R").setValue("");
				this.byId("idMatricula").setValue("");
				this.byId("idArmadorIni").setValue("");
				this.byId("idFechaTravesiaIni").setValue("");
				this.byId("idFechaTravesiaFin").setValue("");
				this.byId("idNroTripu").setValue("");
				this.byId("idCocinero").setValue("");
				this.byId("idCostoVivere").setValue("");
				this.byId("cboProveedor").setValue("");
				this.byId("idObserva").setValue("");
				this.byId("idCentroText").setValue("");
				this.byId("idAlmacenExterno").setValue("");
				this.byId("idIndicador").setValue("");
				this.byId("idRucArmador").setValue("");
				this.byId("idDuracionTr").setValue("");
			}else{
				this.byId('cboTemporada').setValueState(); 
			this.byId('idPlantaIni').setValueState(); 
			this.byId('idAlmacenIni').setValueState(); 
			this.byId('idArmadorIni').setValueState(); 
			this.byId('idFechaTravesiaIni').setValueState(); 
			this.byId('idFechaTravesiaFin').setValueState(); 
			this.byId('cboTemporada').setValueState(); 
			this.byId('cboProveedor').setValueState(); 
			this.byId("inputId1_R").setValueState(); 
			this.byId("cboTemporada").setValue("");
			this.byId("idPlantaIni").setValue("");
			this.byId("idAlmacenIni").setValue("");
			this.byId("inputId1_R").setValue("");
			this.byId("idMatricula").setValue("");
			this.byId("idArmadorIni").setValue("");
			this.byId("idFechaTravesiaIni").setValue("");
			this.byId("idFechaTravesiaFin").setValue("");
			this.byId("idNroTripu").setValue("");
			this.byId("idCocinero").setValue("");
			this.byId("idCostoVivere").setValue("");
			this.byId("cboProveedor").setValue("");
			this.byId("idObserva").setValue("");
			this.byId("idCentroText").setValue("");
			this.byId("idAlmacenExterno").setValue("");
			this.byId("idIndicador").setValue("");
			this.byId("idRucArmador").setValue("");
			this.byId("idDuracionTr").setValue("");
			}
			
		},

        iniciaFecha: function(){
            var date = new Date();
            var mes= date.getMonth()+1;
            var anio= date.getFullYear();
            var dia=date.getDate();

            if(mes<10){
                mes=this.zeroFill(mes,2);
            }
            if(dia<10){
                dia=this.zeroFill(dia,2);
            }
            this.byId("idFecha").setValue(dia+"/"+mes+"/"+anio);
            
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
        _onOpenDialogArmador: function() {

			this._getDialogArmador().open();
		},

		_onCloseDialogArmador: function() {
			this._getDialogArmador().close();
			sap.ui.getCore().byId("idRuc2").setValue("");
			sap.ui.getCore().byId("idDescripcion").setValue("");
			sap.ui.getCore().byId("idCuentaProveedor").setValue("");
			sap.ui.getCore().byId("idListaArmador").setText("Lista de registros:");
			
		},

		_getDialogArmador : function () {
			if (!this._oDialogArmador) {
				this._oDialogArmador = sap.ui.xmlfragment("com.tasa.valeviveres.view.DlgArmador", this.getView().getController());
				this.getView().addDependent(this._oDialogArmador);
				sap.ui.getCore().byId("idAciertosPop").setValue("200");
			}
			
			return this._oDialogArmador;
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
				  
				],
				"no_data": "",
				"option": [
				 
				],
				"options": [
					{
						"cantidad": "10",
						"control": "INPUT",
						"key": "LIFNR",
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
				"p_user": this.userOperation,
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
        buscar: function(evt){
			console.log(evt);
			var indices = evt.mParameters.listItem.oBindingContexts.Armador.sPath.split("/")[2];
			console.log(indices);
			var data = this.getView().getModel("Armador").oData.listaArmador[indices].STCD1;
			var ruc = this.getView().getModel("Armador").oData.listaArmador[indices].STCD1
			this.byId("idRucArmador").setValue(ruc);
				this.byId("idArmadorIni").setValue(data);
			
			
			this._onCloseDialogArmador();	
		},
        listaCocinero: function(){
            oGlobalBusyDialog.open();
        },
		onNavBack : function() {
			this.clean();
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},
		poblarCocinero: function(){
			var body={
				"nombreAyuda": "BSQCOCINERO",
				"p_user": this.userOperation
			}
			oGlobalBusyDialog.open();
			fetch(`${Utilities.onLocation()}General/AyudasBusqueda/`,
				{
						  method: 'POST',
						  body: JSON.stringify(body)
				})
					  .then(resp => resp.json()).then(data => {
						console.log(data);
						this.getView().getModel("Cocinero").setProperty("/listaCocinero",data.data);
						oGlobalBusyDialog.close();
				}).catch(function(error){
					if(error){
						MessageBox.error(error.message);
						oGlobalBusyDialog.close();
					}
				});
		},
		traeCocinero:function(){
			var array=this.getView().getModel("Cocinero").getProperty("/listaCocinero");
			var idCocinero=this.byId("idCocinero").getValue();
			for(var i=0;i<array.length;i++){
				if(array[i].PERNR===idCocinero){
					this.byId("idCocinero").setDescription(array[i].NACHN+" "+array[i].NACH2+" "+array[i].VORNA)
				}
			}
		},
		traerProveedor: function(){
			var idPlantaIni=this.byId("idPlantaIni").getValue();
			var idAlmacen=this.byId("idAlmacenIni").getValue();
			var codPlanta=this.byId("idAlmacenIni").getValue();
			var array=this.getView().getModel("Almacen").getProperty("/listaAlmacen");
			for(var i=0;i<array.length;i++){
				if(array[i].CDALM===idAlmacen){
				
					this.byId("idAlmacenIni").setDescription(array[i].DSALM);
					this.byId("idAlmacenExterno").setValue(array[i].CDALE);
				}
			}
			if(idPlantaIni && idAlmacen){
				var body={
					"nombreConsulta": "CONSGENPROVEEDORES",
					"p_user": this.userOperation,
					"parametro1": idPlantaIni,
					"parametro2": idAlmacen,
					"parametro3": "",
					"parametro4": "",
					"parametro5": ""
				  }
				  oGlobalBusyDialog.open();
				  fetch(`${Utilities.onLocation()}General/ConsultaGeneral/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						console.log(data);
						this.getView().getModel("Proveedor").setProperty("/listaProveedor",data.data);
						oGlobalBusyDialog.close();
					  }).catch(function(error){
							if(error){
								MessageBox.error(error.message);
								oGlobalBusyDialog.close();
							}
					  });
			}else{
				this.getView().getModel("Proveedor").setProperty("/listaProveedor","");
				this.byId("idRucProveedor").setText()
			}
		},
		changePlanta: function(){
			this.byId("idAlmacenIni").setValue("");
			this.byId("idAlmacenIni").setDescription("");
			this.byId("idRucProveedor").setValue("");
			var codPlanta=this.byId("idPlantaIni").getValue();
			var array=this.getView().getModel("Planta").getProperty("/listaPlanta");
			for(var i=0;i<array.length;i++){
				if(array[i].CDPTA===codPlanta){
					this.byId("idCentroText").setValue(array[i].WERKS);
					this.byId("idPlantaIni").setDescription(array[i].DESCR);
				}
			}
			
			this.getView().getModel("Proveedor").setProperty("/listaProveedor","");
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
				this.oDialog = sap.ui.xmlfragment("com.tasa.valeviveres.view.Embarcacion", this);
				this.getView().addDependent(this.oDialog);
			}
			return this.oDialog;
		},
		onOpenEmba: function(evt){
			this.currentInputEmba = evt.getSource().getId();
			this.getDialog().open();
		},
		onFormat:function(){
			var control = this.getModel().getProperty("/inputId");
			if(control){
				if(control.split("--")[2]==="inputId1_R"){
					var data = this.getModel().getProperty("/help/CDEMB");
					var detail = this.getModel().getProperty("/help/NMEMB");
					var nroTRIP = this.getModel().getProperty("/help/NRTRI");
					var matricula= this.getModel().getProperty("/help/MREMB");
					var ruc= this.getModel().getProperty("/help/LIFNR");
					var NAME= this.getModel().getProperty("/help/NAME1");
					var indicadorP = this.getModel().getProperty("/help/DESC_INPRP");
			this.byId("idRucArmador").setValue(ruc);
			if(indicadorP==="Propia"){
				this.byId("idIndicador").setVisible(true);
				this.byId("idFormCocinero").setVisible(true);
				this.byId("idFormTripulante").setVisible(true);
				this.byId("idFormCostoVivere").setVisible(false);
			}else{
				this.byId("idIndicador").setVisible(true);
				this.byId("idFormCocinero").setVisible(false);
				this.byId("idFormTripulante").setVisible(false);
				this.byId("idFormCostoVivere").setVisible(true);
			}
				this.byId("inputId1_R").setValue(data);
				this.byId("idNroTripu").setValue(nroTRIP);
				this.byId("idMatricula").setValue(matricula);
				this.byId("idIndicador").setValue(indicadorP);
				
				if(ruc!=""){
					this.byId("idArmadorIni").setValue(ruc);
					this.byId("idArmadorIni").setEnabled(false);
					this.byId("idArmadorIni").setDescription(NAME)
				}else{
					this.byId("idArmadorIni").setValue("");
					this.byId("idArmadorIni").setEnabled(true);
					this.byId("idArmadorIni").setDescription("")
				}
				}
			}
		
		},
		
		buscarEmbarca: function(evt){
			console.log(evt);
			var indices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
			console.log(indices);
		
			var data = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].CDEMB;
			var detail = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].NMEMB;
			var nroTRIP = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].NRTRI;
			var matricula= this.getView().getModel("consultaMareas").oData.embarcaciones[indices].MREMB;
			var ruc= this.getView().getModel("consultaMareas").oData.embarcaciones[indices].LIFNR;
			var NAME= this.getView().getModel("consultaMareas").oData.embarcaciones[indices].NAME1;
			var indicadorP =this.getView().getModel("consultaMareas").oData.embarcaciones[indices].DESC_INPRP; 
			this.byId("idRucArmador").setValue(ruc);
			if(indicadorP==="Propia"){
				this.byId("idIndicador").setVisible(true);
				this.byId("idFormCocinero").setVisible(true);
				this.byId("idFormTripulante").setVisible(true);
				this.byId("idFormCostoVivere").setVisible(false);
			}else{
				this.byId("idIndicador").setVisible(true);
				this.byId("idFormCocinero").setVisible(false);
				this.byId("idFormTripulante").setVisible(false);
				this.byId("idFormCostoVivere").setVisible(true);
			}
				this.byId("idEmbarcacion").setValue(data);
				this.byId("idNroTripu").setValue(nroTRIP);
				this.byId("idMatricula").setValue(matricula);
				this.byId("idIndicador").setValue(indicadorP);
				
				if(ruc!=""){
					this.byId("idArmadorIni").setValue(ruc);
					this.byId("idArmadorIni").setEnabled(false);
					this.byId("idArmadorIni").setDescription(NAME)
				}else{
					this.byId("idArmadorIni").setValue("");
					this.byId("idArmadorIni").setEnabled(true);
					this.byId("idArmadorIni").setDescription("")
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
		validaFecha:function(){
			var idFechaTravesiaIni=this.byId("idFechaTravesiaIni").getValue();
		
			var dia =idFechaTravesiaIni.split("/")[0];
			var mes =idFechaTravesiaIni.split("/")[1];
			var anio =idFechaTravesiaIni.split("/")[2];
			var idFechaTravesiaIni = anio+"/"+mes+"/"+dia;
			// 	let fecha2 = new Date()
			// 	let fecha1 = new Date(fechaInicio);
			// var resta=fecha2-fecha1;
			// var dias=Math.round(resta/ (1000*60*60*24));
			// console.log(dias);
			
			
			let fecha2 = new Date()
			var resta = Date.parse(fecha2)-Date.parse(idFechaTravesiaIni)
			var dias=Math.round(resta/ (1000*60*60*24));
			var estado=false;
			if(dias>=3){
				estado=true;
			}
			return estado;			
		},
		validarValeFecha: async function(){
			var idFechaTravesiaIni=this.byId("idFechaTravesiaIni").getValue();
			var idEmbarcacion=this.byId("inputId1_R").getValue();
			var idFechaTravesiaFin=this.byId("idFechaTravesiaFin").getValue();
			var fechaI = this.castFecha(idFechaTravesiaIni);
			var fechaF = this.castFecha(idFechaTravesiaFin);
			var estadoVale=true;
			console.log(fechaI)
			console.log(fechaF)
			var body={
				"nombreConsulta": "CONSGENVIVERES",
				"p_user": "FGARCIA",
				"parametro1": idEmbarcacion,
				"parametro10": fechaI,
				"parametro2": fechaF,
				"parametro3": "",
				"parametro4": "",
				"parametro5": "",
				"parametro6": "",
				"parametro7": "",
				"parametro8": "",
				"parametro9": ""
			};
			await fetch(`${Utilities.onLocation()}General/ConsultaGeneral/`,
			  {
				  method: 'POST',
				  body: JSON.stringify(body)
			  })
			  .then(resp => resp.json()).then(data => {
				  console.log(data);
					if(data.mensaje==="true"){
						MessageBox.error("Ya existe un vale entre las fechas "+data.data[0].FITVS +" , "+data.data[0].FFTVS);
						estadoVale=false;
					}
			  }).catch(error => console.log(error)
			  );
			  return estadoVale;
		},
		validarCabecera: function(){
			var cboTemporada=this.byId("cboTemporada").getSelectedKey();
			var idPlantaIni=this.byId("idPlantaIni").getValue();
			var idAlmacenIni=this.byId("idAlmacenIni").getValue();
			var idEmbarcacion=this.byId("inputId1_R").getValue();
			var idArmadorIni=this.byId("idArmadorIni").getValue();
			var idFechaTravesiaIni=this.byId("idFechaTravesiaIni").getValue();
			var idFechaTravesiaFin=this.byId("idFechaTravesiaFin").getValue();
			var cboProveedor=this.byId("cboProveedor").getSelectedKey();
			var cadena="";
			var valida=false;
			if( this.validarValeFecha()){
				return false;
			}
			console.log("SEGUI");
			if(this.validaFecha()){
				var fechaAc = new Date();
				var annio = fechaAc.getFullYear();
				var month = fechaAc.getMonth();
				var day  = fechaAc.getDate();
				if(month<10){
					month=this.zeroFill(month+1,2);
				}
				if(day<10){
					day = this.zeroFill(day-1,2);
				}
				var FechaVale=day-1+"/"+month+"/"+annio;
				MessageBox.error("Solo puede generar vales a partir de la siguiente fecha: " +FechaVale)
				return true;
			}
			if(!cboTemporada){
				this.byId('cboTemporada').setValueState(sap.ui.core.ValueState.Error); 
				cadena+="El campo Temporada es obligatorio\n";
				valida=true;
			}
			if(!idPlantaIni){
				this.byId('idPlantaIni').setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Planta es obligatorio\n";
				valida=true;
			}
			if(!idAlmacenIni){
				this.byId('idAlmacenIni').setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Almac??n es obligatorio\n";
				valida=true;
			}
			if(!idEmbarcacion){
				this.byId("inputId1_R").setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Embarcaci??n es obligatorio\n";
				valida=true;
			}
			if(!idArmadorIni){
				this.byId('idArmadorIni').setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Armador es obligatorio\n";
				valida=true;
			}
			if(!idFechaTravesiaIni){
				this.byId('idFechaTravesiaIni').setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Fecha Inicio de traves??a es obligatorio\n";
				valida=true;
			}
			if(!idFechaTravesiaFin){
				this.byId('idFechaTravesiaFin').setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Fecha Fin de traves??a es obligatorio\n";
				valida=true;
			}
			if(!cboProveedor){
				this.byId('cboProveedor').setValueState(sap.ui.core.ValueState.Error);
				cadena+="El campo Proveedor es obligatorio\n";
				valida=true;
			}else{
				this.byId('cboProveedor').setValueState();
			}
			if(Date.parse(idFechaTravesiaIni) > Date.parse(idFechaTravesiaFin)){
				valida=true;
				cadena+="La fecha de fin no debe ser menor a la fecha de inicio"
			}

			if(valida){
				MessageBox.error(cadena);
			}else{
				var indicador = this.byId("idIndicador").getValue();
				console.log(indicador);
				if(indicador==="Tercera"){
					this.generaTablaTercera();
				}else{
					this.generaTablaPropio();
				}
				
			}
			
		},
		generaTablaTercera: function(){
			
			
			this.byId("colSuministro").setVisible(false);
			this.byId("colMedida").setVisible(false);
			this.byId("colRacion").setVisible(false);
			this.byId("idAgregar").setVisible(false);
			this.byId("idEliminar").setVisible(false);
			
			if(!this.generaFechas){
				return false;
			}
			var diffFechas = this.generaFechas();
			var idFechaTravesiaIni= this.byId("idFechaTravesiaIni").mProperties.dateValue;
			var idFechaTravesiaFin= this.byId("idFechaTravesiaFin").mProperties.dateValue;
			var idCostoVivere = this.byId("idCostoVivere").getValue();
			var fechaI = new Date(idFechaTravesiaIni);
			var d = fechaI.getDate();
			var m = fechaI.getMonth()+1;
			var a = fechaI.getFullYear();
			this.byId("idDuracionTr").setValue(diffFechas+1);
			if(m<10){
				m=this.zeroFill(m,2);
			}
			var numeroDias=this.generaFechas();
			if(numeroDias+1>7){
				MessageBox.error(" La duraci??n de la traves??a no debe ser mayor a la permitida: 7 d??a(s) ");
				oGlobalBusyDialog.close();
				return false;
			}
			var sumi=[];
			var fechas=[]
			for(var k=0;k<=numeroDias;k++){
				console.log(k);
				var dia = Number(d)+k;
				
				console.log(dia);
				if(dia<10){
					dia=this.zeroFill(dia,2);
				}
				 fechas[k] = dia+"/"+m+"/"+a;
	
			}
			console.log(fechas);
			for(var i=0;i<=numeroDias;i++){
				sumi.push({
					CDSUM:"",
					CDUMD:"",
					NRPOS:this.zeroFill(i+1,4),
					CUSUM:idCostoVivere,
					DSSUM:idCostoVivere,
					DSUMD:"",
					MATNR:"",
					fecha: fechas[i],
					estadoCombo:false,
					cantidadT:"",
					costoT :idCostoVivere ,
					generado:true,
					OBPVA:"",
					costo:true
				});
			}
			console.log(sumi);
			var total=0;
			for(var z=0;z<sumi.length;z++){
				total+=Number(sumi[z].costoT);
			}
			console.log(total);
			this.byId("idImporteVale").setText(total.toFixed(2));
			this.byId("onGuardarVale").setEnabled(true);
			console.log(sumi);			
			this.getView().getModel().setProperty("/dataC",sumi.length);
			this.getView().getModel("Suministros").setProperty("/listaSuministros",sumi);
		},
		
		
		generaTablaPropio: function(){
			
			if(!this.generaFechas()){
				return false;
			}
			var diffFechas = this.generaFechas();
			var idFechaTravesiaIni= this.byId("idFechaTravesiaIni").mProperties.dateValue;
			var idFechaTravesiaFin= this.byId("idFechaTravesiaFin").mProperties.dateValue;
			
			var fechaI = new Date(idFechaTravesiaIni);
			var d = fechaI.getDate();
			var m = fechaI.getMonth()+1;
			var a = fechaI.getFullYear();
			if(m<10){
				m=this.zeroFill(m,2);
			}
			var cantidad = this.byId("idNroTripu").getValue();
			cantidad=Number(cantidad);
			this.byId("idDuracionTr").setValue(diffFechas+1);
		
			console.log(cantidad);
			var numeroDias=this.generaFechas();
			if(numeroDias+1>7){
				MessageBox.error(" La duraci??n de la traves??a no debe ser mayor a la permitida: 7 d??a(s) ");
				oGlobalBusyDialog.close();
				return false;
			}
			console.log(numeroDias);
			var idCentroText = this.byId("idCentroText").getValue();
			var idRucProveedor = this.byId("idRucProveedor").getValue();
			var idFechaTravesiaIni= this.byId("idFechaTravesiaIni").getValue();
			var idFechaTravesiaFin= this.byId("idFechaTravesiaFin").getValue();
			var body={
				"fieldS_data": [
				],
				"options": [
				],
				"p_centro": idCentroText,
				"p_code": "",
				"p_proveedor": idRucProveedor,
				"p_user": this.userOperation
			}
			oGlobalBusyDialog.open();
			fetch(`${Utilities.onLocation()}valeviveres/CostoRacionValev/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					var sumi=[];
					var fechas=[]
					for(var k=0;k<=numeroDias;k++){
						console.log(k);
						var dia = Number(d)+k;
						
						console.log(dia);
						if(dia<10){
							dia=this.zeroFill(dia,2);
						}
						 fechas[k] = dia+"/"+m+"/"+a;
			
					}
					for(var i=0;i<=numeroDias;i++){
						sumi.push({
							CDSUM:data.s_data[0].CDSUM,
							CDUMD:data.s_data[0].CDUMD,
							//CDUMD:this.zeroFill(i+1,3),
							NRPOS:this.zeroFill(i+1,4),
							CUSUM:data.s_data[0].CUSUM,
							DSSUM:data.s_data[0].DSSUM,
							DSUMD:data.s_data[0].DSUMD,
							MATNR:data.s_data[0].MATNR,
							fecha: fechas[i],
							estadoCombo:false,
							cantidadT:cantidad,
							costoT : (data.s_data[0].CUSUM * cantidad).toFixed(2),
							generado:true,
							OBPVA:"",
							costo:false
						});
					}
					var total=0;
					for(var z=0;z<sumi.length;z++){
						total+=Number(sumi[z].costoT);
					}
					console.log(total);
					this.byId("idImporteVale").setText(total.toFixed(2));
					this.byId("onGuardarVale").setEnabled(true);
					console.log(sumi);
					this.getView().getModel().setProperty("/dataC",sumi.length);
					this.getView().getModel("Suministros").setProperty("/listaSuministros",sumi);
					oGlobalBusyDialog.close();
				  }).catch(function(error){
						if(error){
							MessageBox.error(error.message);
							oGlobalBusyDialog.close();
						}
				  });
		},
		generaFechas: function(){
			var idFechaTravesiaIni= this.byId("idFechaTravesiaIni").mProperties.dateValue;
			var idFechaTravesiaFin= this.byId("idFechaTravesiaFin").mProperties.dateValue;
			console.log(idFechaTravesiaFin);
			console.log(idFechaTravesiaIni);
			
			if(!this.getDifFechas(idFechaTravesiaIni,idFechaTravesiaFin)){
				return false;
			}else{
				var diff =this.getDifFechas(idFechaTravesiaIni,idFechaTravesiaFin);
			}
			return diff;
		},
		agregarSuministro: function(){
			console.log(this.byId("idIndicador").getValue());
			var estadoEmbarca =this.byId("idIndicador").getValue();
			var estadoCosto=true;
			console.log(estadoEmbarca);
			if(estadoEmbarca==="Propia"){
				estadoCosto=false;
			}else{
				estadoCosto=true;
			}
			var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
			this.getView().getModel("Suministros").setProperty("/listaSuministros",null);
			var arrayFinal=[];
			arrayFinal.push({
				CDSUM:array[0].CDSUM,
				CDUMD:"001",
				NRPOS:this.zeroFill(i+1,4),
				CUSUM:array[0].CUSUM,
				DSSUM:array[0].DSSUM,
				DSUMD:array[0].DSUMD,
				MATNR:array[0].MATNR,
				fecha: array[0].fecha,
				estadoCombo:true,
				cantidadT:"",
				costoT : "",
				generado:false,
				OBPVA:"",
				costo:estadoCosto
			})
			for(var i=0;i<array.length;i++){
				array[i].NRPOS=this.zeroFill(Number(array[i].NRPOS)+1,4);
			}
			var arrayFinal=[];
			arrayFinal.push({
				CDSUM:array[0].CDSUM,
				CDUMD:array[0].CDUMD,
				CUSUM:"",
				NRPOS:"0001",
				DSSUM:array[0].DSSUM,
				DSUMD:array[0].DSUMD,
				MATNR:array[0].MATNR,
				fecha: array[0].fecha,
				estadoCombo:true,
				cantidadT:"",
				costoT : "",
				generado:false,
				OBPVA:"",
				costo:estadoCosto
			})
			for(var i=0;i<array.length;i++){
				arrayFinal.push({
					CDSUM:array[i].CDSUM,
					CDUMD:array[i].CDUMD,
					NRPOS:array[i].NRPOS,
					CUSUM:array[i].CUSUM,
					DSSUM:array[i].DSSUM,
					DSUMD:array[i].DSUMD,
					MATNR:array[i].MATNR,
					fecha: array[i].fecha,
					estadoCombo:array[i].estadoCombo,
					cantidadT:array[i].cantidadT,
					costoT : array[i].costoT,
					generado: array[i].generado,
					OBPVA:array[i].OBPVA,
					costo:estadoCosto
				});
			}
			
			
			console.log(arrayFinal);
			this.getView().getModel("Suministros").setProperty("/listaSuministros",arrayFinal);
			console.log(this.getView().getModel("Suministros").getProperty("/listaSuministros"));
			this.getView().getModel("Suministros").refresh(true);
		},
		getDifFechas: function(fechaI,fechaF){
			var validaFechaI =new Date(fechaI);
			var validaFechaF = new Date(fechaF);
			console.log(validaFechaI.getFullYear())
			console.log(this.zeroFill(validaFechaI.getMonth()+1))
			var mesxAnio =this.diasEnUnMes(this.zeroFill(validaFechaI.getMonth()+1),validaFechaI.getFullYear());
			var fechaInicio = new Date(fechaI).getTime();
			var fechaFin    = new Date(fechaF).getTime();
			var mesI = new Date(fechaI).getMonth()+1;
			var mesF = new Date(fechaFin).getMonth()+1;
			if(mesI<10){
				mesI=this.zeroFill(mesI,2);
			}
			if(mesF<10){
				mesF= this.zeroFill(mesF,2);
			}
			if(fechaInicio>fechaFin){
				MessageBox.error("La fecha inicio no puede ser mayor a la fecha Fin");
				oGlobalBusyDialog.close();
				return false;
			}
			if(mesI!= mesF){
				MessageBox.error("La fecha final de traves??a no debe ser mayor a la fecha "+mesxAnio+"/"+mesI+"/"+validaFechaI.getFullYear());
				oGlobalBusyDialog.close();
				return false;
			}
			console.log(fechaInicio);
			console.log(fechaFin);
			var diff = fechaFin - fechaInicio;
			console.log(Math.floor((fechaFin - fechaInicio) / (1000*60*60*24)));
			return diff/(1000*60*60*24);
		},
		diasEnUnMes: function(mes,a??o){
			console.log(mes+" "+a??o)
			return new Date(a??o, mes, 0).getDate();
		},
		getFormat: function(fecha){
			var d = fecha.substring(0,2);
			var m = fecha.substring(2,4);
			var a = fecha.substring(4,8);
			var f =d+"/"+m+"/"+a;
			return f;
			
		},
		onEliminar: function(){
			var indices = this.byId("tbl_suministros").getSelectedIndices();
			console.log(indices);
			var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
			console.log(array[indices]);
			
			var array2 = array;
			var numeros=[];
			for (var i=0;i<indices.length;i++) {
				console.log(array2[indices[i]].NRPOS)
				if(!array2[indices[i]].generado){
					numeros[i]=array2[indices[i]].NRPOS;
				}
				
			}
			var estado=true;
			
			for(var j=0;j<numeros.length;j++){
				var oThisObj = numeros[j];
				var index = $.map(array2, function(obj, index) {
					if(obj.NRPOS === oThisObj) {
						return index;
					}
				})
				array2.splice(index, 1);
				estado=false;
			}		
			if(!estado){
				for(var z=0;z<array2.length;z++){
			
						var number = Number(z+1);
						array2[z].NRPOS=this.zeroFill(number,3);
				
				}
			}
			
			this.getView().getModel("Suministros").setProperty("/listaSuministros",array2);
			this.getView().getModel("Suministros").refresh(true);
		},
		onGuardar: function(){
			var idIndicador = this.byId("idIndicador").getValue();
			if(idIndicador==="Tercera"){
				this.onGuardarTercero();
			}else{
				var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
				var idPlantaIni = this.byId("idPlantaIni").getValue();
				var idEmbarcacion = this.byId("inputId1_R").getValue();
				var cboTemporada = this.byId("cboTemporada").getSelectedKey();
				var idNroTripu = this.byId("idNroTripu").getValue();
				var idDuracionTr = this.byId("idDuracionTr").getValue();
				var cboProveedor = this.byId("cboProveedor").getSelectedKey();
				var idObserva = this.byId("idObserva").getValue();
				var idAlmacenIni = this.byId("idAlmacenIni").getValue();
				var idArmadorIni = this.byId("idArmadorIni").getValue();
				var idCocinero = this.byId("idCocinero").getValue();
				var idFechaTravesiaIni = this.byId("idFechaTravesiaIni").mProperties.dateValue;
				var idFechaTravesiaFin = this.byId("idFechaTravesiaFin").mProperties.dateValue;
				var fechaI = this.regresaFecha(idFechaTravesiaIni);
				var fechaF = this.regresaFecha(idFechaTravesiaFin);
				console.log(fechaI);
				console.log(fechaF);
	
				var  ST_PVA=[];
				for(var i=0;i<array.length;i++){
					ST_PVA.push({
						NRVVI:"",
						NRPOS:array[i].NRPOS,
						FCPOS:this.castFecha(array[i].fecha),
						CDSUM:array[i].CDSUM,
						CNRAC:array[i].cantidadT,
						CDUMD:array[i].CDUMD,
						CUSUM:array[i].CUSUM,
						QTSUM:array[i].costoT,
						OBPVA:array[i].OBPVA
					})
				}
				var ST_VVI=[];
				ST_VVI.push({
					MANDT:"",
					NRVVI:"",
					CDPTA: idPlantaIni,
					CDEMB:idEmbarcacion,
					CDTPO:cboTemporada,
					NRTRI:idNroTripu,
					NRVIS:0,
					FITVS:fechaI,
					FFTVS:fechaF,
					DRTVS:idDuracionTr,
					CDPVE:cboProveedor,
					OBVVI:idObserva,
					EBELN:"",
					ESVVI:"",
					ESIMP:"",
					FCVVI:"",
					HCVVI:"000000",
					ACVVI:"",
					FMVVI:"",
					HMVVI:"000000",
					AMVVI:"",
					BELNR:"",
					CDALM:idAlmacenIni,
					ARCMC:idArmadorIni,
					PERNR:idCocinero,
					ESTRI:""
				});
	
				var body={
					"fieldsT_mensaje": [
					  
					],
					"p_user": this.userOperation,
					"st_pva": ST_PVA,
					"st_vvi": ST_VVI
				}
				oGlobalBusyDialog.open();
				fetch(`${Utilities.onLocation()}valeviveres/Guardar/`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						MessageBox.success(
							"Se ha creado el vale "+ data.p_vale+ " satisfactoriamente", {
								icon: MessageBox.Icon.SUCCESS,
								title: "Guardado Satisfactorio",
								actions: [MessageBox.Action.OK],
								emphasizedAction: MessageBox.Action.OK,
								onClose: function (oAction) { if(oAction=="OK"){
									this.onLimpiar();
									this.getRouter().navTo("worklist"); 
									oGlobalBusyDialog.close();
								}}.bind(this)
							}
						);
					
						oGlobalBusyDialog.close();
						this.onImprimir(data.p_vale);
					  }).catch(error => console.log(error)
					  );
			}
			

		},
		onLimpiar:function(){
			this.getView().getModel("Suministros").setProperty("/listaSuministros",{});
			this.byId("idPlantaIni").setValue("");
			this.byId("idAlmacenIni").setValue("");
			this.byId("inputId1_R").setValue("");
			this.byId("idMatricula").setValue("");
			this.byId("idArmadorIni").setValue("");
			this.byId("idFechaTravesiaIni").setValue("");
			this.byId("idFechaTravesiaFin").setValue("");
			this.byId("idNroTripu").setValue("");
			this.byId("idCocinero").setValue("");
			this.byId("idCostoVivere").setValue("");
			this.byId("idObserva").setValue("");
			this.byId("idFecha").setValue("");
			this.byId("idCentroText").setValue("");
			this.byId("idAlmacenExterno").setValue("");
			this.byId("idIndicador").setValue("");
			this.byId("idRucArmador").setValue("");
			this.byId("idDuracionTr").setValue("");
			this.byId("idRucProveedor").setValue("");
			
			this.byId("cboTemporada").setSelectedKey("");
			this.byId("cboProveedor").setSelectedKey("");

		},
		onImprimir: function(codigo){
			oGlobalBusyDialog.open();
			var body={
				"numValeVivere": codigo,
				"p_user": this.userOperation,
				"estadoImpresion": ""
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
					title: "Vale de V??veres",
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
	
		regresaFecha: function(fecha){
			var fechaI = new Date(fecha);
			var mes = fechaI.getMonth()+1;
			var dia = fechaI.getDate();
			var anio = fechaI.getFullYear();
			if(mes<10){
				mes=this.zeroFill(mes,2);
			}
			if(dia<10){
				dia=this.zeroFill(dia,2);
			}
			return anio+""+mes+""+dia;
		},
		castFecha: function(fecha){
			var dia =fecha.split("/")[0];
			var mes =fecha.split("/")[1];
			var anio =fecha.split("/")[2];
			return anio+""+mes+""+dia;
		},
		onGuardarTercero: function(){
			var ST_PVA=[];
			var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
			var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
			var idPlantaIni = this.byId("idPlantaIni").getValue();
			var idEmbarcacion = this.byId("inputId1_R").getValue();
			var cboTemporada = this.byId("cboTemporada").getSelectedKey();
			var idNroTripu = this.byId("idNroTripu").getValue();
			var idDuracionTr = this.byId("idDuracionTr").getValue();
			var cboProveedor = this.byId("cboProveedor").getSelectedKey();
			var idObserva = this.byId("idObserva").getValue();
			var idAlmacenIni = this.byId("idAlmacenIni").getValue();
			var idArmadorIni = this.byId("idArmadorIni").getValue();
			var idCocinero = this.byId("idCocinero").getValue();
			var idFechaTravesiaIni = this.byId("idFechaTravesiaIni").mProperties.dateValue;
			var idFechaTravesiaFin = this.byId("idFechaTravesiaFin").mProperties.dateValue;
			var fechaI = this.regresaFecha(idFechaTravesiaIni);
			var fechaF = this.regresaFecha(idFechaTravesiaFin);
		
			for(var i=0;i<array.length;i++){
				ST_PVA.push({
					NRVVI:"",
					NRPOS:array[i].NRPOS,
					FCPOS:this.castFecha(array[i].fecha),
					CDSUM:"",
					CNRAC:"1",
					CDUMD:"",
					CUSUM:array[i].CUSUM,
					QTSUM:array[i].costoT,
					OBPVA:array[i].OBPVA
				})
			}
			var ST_VVI=[]
			ST_VVI.push({
				MANDT:"",
				NRVVI:"",
				CDPTA:idPlantaIni,
				CDEMB:idEmbarcacion,
				CDTPO:cboTemporada,
				NRTRI:"0",
				NRVIS:"0",
				FITVS:fechaI,
				FFTVS:fechaF,
				DRTVS:idDuracionTr,
				CDPVE:cboProveedor,
				OBVVI:idObserva,
				EBELN:"",
				ESVVI:"",
				ESIMP:"",
				FCVVI:this.getFechaActual(),
				HCVVI:this.getHoraActual(),
				ACVVI:this.userOperation,
				FMVVI:"",
				HMVVI:"000000",
				AMVVI:"",
				BELNR:"",
				CDALM:idAlmacenIni,
				ARCMC:idArmadorIni,
				PERNR:"00000000",
				ESTRI:""
			})
			var body={
				"fieldsT_mensaje": [
				  
				],
				"p_user": this.userOperation,
				"st_pva": ST_PVA,
				"st_vvi": ST_VVI
			}
			console.log(body);
			oGlobalBusyDialog.open();
			fetch(`${Utilities.onLocation()}valeviveres/Guardar/`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					MessageBox.success(
						"Se ha creado el vale "+ data.p_vale+ " satisfactoriamente", {
							icon: MessageBox.Icon.SUCCESS,
							title: "Guardado Satisfactorio",
							actions: [MessageBox.Action.OK],
							emphasizedAction: MessageBox.Action.OK,
							onClose: function (oAction) { if(oAction=="OK"){
								this.getRouter().navTo("worklist"); 
							}}.bind(this)
						}
					);
				
					this.onImprimir(data.p_vale);
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
				  );
		},
		getHoraActual:function(){
			var horaActual=new Date();
			var hora=horaActual.getHours();
			var minuto=horaActual.getMinutes();
			var segundos=horaActual.getSeconds();
			if(hora<10){
				hora=this.zeroFill(hora,2);
			}
			if(minuto<10){
				minuto=this.zeroFill(minuto,2);
			}
			if(segundos<10){
				segundos=this.zeroFill(segundos,2);
			}
			return hora+":"+minuto+":"+segundos;
		},
		getFechaActual:function(){
			var fecha=new Date();
			var dia = fecha.getDate();
			var mes = fecha.getMonth()+1;
			var anio= fecha.getFullYear();
			if(dia<10){
				dia=this.zeroFill(dia,2);
			}
			if(mes<10){
				mes=this.zeroFill(mes,2);
			}
			return anio+""+mes+""+dia;
		},
		reload: function(){
			var idIndicador = this.byId("idIndicador").getValue();

			if(idIndicador==="Tercera"){
				var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
				for(var i=0;i<array.length;i++){
					array[i].costoT=array[i].CUSUM;
				}
				this.getView().getModel("Suministros").setProperty("/listaSuministros",array);
				this.getView().getModel("Suministros").refresh(true);
			}else{
				var array = this.getView().getModel("Suministros").getProperty("/listaSuministros");
				console.log(array);
				for(var i=0;i<array.length;i++){
					array[i].costoT=(array[i].cantidadT*array[i].CUSUM).toFixed(2);
				}
				this.getView().getModel("Suministros").setProperty("/listaSuministros",array);
				this.getView().getModel("Suministros").refresh(true);
			}
			
		},
		poblarRuc: function(){
			var proveedor= this.byId("cboProveedor").getSelectedKey();
			var array=this.getView().getModel("Proveedor").getProperty("/listaProveedor");
			if(proveedor){
				for(var i=0;i<array.length;i++){
					if(array[i].LIFNR===proveedor){
						this.byId("idRucProveedor").setValue(array[i].STCD1);
					}
				}
			}
		},
		
		onSearchHelp:async function(oEvent){
			let sIdInput = oEvent.getSource().getId(),
			oModel = this.getModel(),
			nameComponent="busqembarcaciones",
			idComponent="busqembarcaciones2",
			urlComponent=this.HOST_HELP+".AyudasBusqueda.busqembarcaciones-1.0.0",
			oView = this.getView(),
			oInput = this.getView().byId(sIdInput);
			oModel.setProperty("/inputId",sIdInput);
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