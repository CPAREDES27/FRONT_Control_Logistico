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
	"sap/m/MessageToast",
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
	MessageToast,
	BusyIndicator) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var EdmType = exportLibrary.EdmType;
	var centro=null;
	var codEmbarca=false;
	var planta="";
	var exportarExcel=false;
	var materialDesc=[];
	var almacenDesc=[];
	return BaseController.extend("com.tasa.aceitesusados.controller.Worklist", {
		
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
			try{
				await this.loadCombos();
				this.planta=await this.llenarPlanta(this.centro);
				console.log(this.planta);
				
			}catch(error){
				MessageBox.error("Ocurrió un error en la carga, actualice el navegador");

			}
			var fecha=this.getFechaActual();
			var fechaActual = fecha+" - "+fecha;
			this.byId("idFecha").setValue(fechaActual);
			
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

		loadCombos:async function(){
			oGlobalBusyDialog.open();
			var ZD_FLESRNV=null;
			var ZINPRP=null;
			var ALMACEN=null;
			var CENTRO=null;
			var MATERIAL=null;
			var TIPOMATERIAL=null;
			var body={
				"dominios": [
				  {
					"domname": "ZD_FLESRNV",
					"status": "A"
				  },
				  {
					"domname": "ZINPRP",
					"status": "A"
				  },
				  {
					"domname": "ALMACEN",
					"status": "A"
				  },
				  {
					"domname": "CENTRO",
					"status": "A"
				  },
				  {
					"domname": "MATERIAL",
					"status": "A"
				  },
				  {
					"domname": "TIPOMATERIAL",
					"status": "A"
				  }
				  
				]
			};
			await fetch(`${mainUrlServices}dominios/Listar`,
				  {
					  method: 'POST',
					  body: JSON.stringify(body)
				  })
				  .then(resp => resp.json()).then(data => {
					var dataPuerto=data;
					console.log(dataPuerto);
					console.log(data);
					ZD_FLESRNV= data.data.find(d => d.dominio == "ZD_FLESRNV").data;
					ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
					ALMACEN= data.data.find(d => d.dominio == "ALMACEN").data;
					MATERIAL= data.data.find(d => d.dominio == "MATERIAL").data;
					this.materialDesc=data.data.find(d => d.dominio == "MATERIAL").data;
					this.almacenDesc= data.data.find(d => d.dominio == "ALMACEN").data;
					console.log(this.materialDesc);
					TIPOMATERIAL = data.data.find(d=>d.dominio=="TIPOMATERIAL").data;
					this.getModel("Estado").setProperty("/ZD_FLESRNV", ZD_FLESRNV);
					this.getModel("Propiedad").setProperty("/ZINPRP", ZINPRP);
					this.getModel("Almacen").setProperty("/ALMACEN", ALMACEN);
					this.getModel("Material").setProperty("/MATERIAL", MATERIAL);
					this.getModel("TipoMaterial").setProperty("/TIPOMATERIAL",TIPOMATERIAL);
					this.centro=data.data.find(d => d.dominio == "CENTRO").data[0].id;
					oGlobalBusyDialog.close();
				  }).catch(error => console.log(error)
			);

		},
		_onOpenDialogEmbarcacion: function(nuevo) {
						
			this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion","");
			
			if(nuevo==="hola"){
				this.codEmbarca=true;
			}
			this._getDialogEmbarcacion().open();
			
			},

			_onCloseDialogEmbarcacion: function() {
				this._getDialogEmbarcacion().close();
			},

			_getDialogEmbarcacion : function () {
				if (!this._oDialogEmbarcacion) {
					this._oDialogEmbarcacion = sap.ui.xmlfragment("com.tasa.aceitesusados.view.DlgEmbarcacion", this.getView().getController());
					this.getView().addDependent(this._oDialogEmbarcacion);
				}
				sap.ui.getCore().byId("idEmbarcacion").setValue("");
				sap.ui.getCore().byId("idEmbarcacionDesc").setValue("");
				sap.ui.getCore().byId("idMatricula").setValue("");
				sap.ui.getCore().byId("idRuc").setValue("");
				sap.ui.getCore().byId("idArmador").setValue("");
				sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: ");
				return this._oDialogEmbarcacion;
			},
			buscar: function(evt){
				var indices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
				var data = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].CDEMB;
				var detail = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[indices].NMEMB;
				if(this.codEmbarca){
					sap.ui.getCore().byId("idEmbarcacionNew").setValue(data);	
					sap.ui.getCore().byId("txtEmbarcaNew").setText(detail);
				}else{
					this.byId("idEmbarcacion2").setValue(data);
					this.byId("txtEmbarca").setText(detail);
				}
				
				this._onCloseDialogEmbarcacion();
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
			onBusqueda: function(){
				oGlobalBusyDialog.open();
				var idAlmacen=this.byId("idAlmacen").getSelectedKey();
				var idEmbarcacion= this.byId("idEmbarcacion2").getValue();
				var idEstado=this.byId("idEstado").getSelectedKey();
				var idReserva=this.byId("idReserva").getValue();
				var idFechaIni = this.byId("idFecha").mProperties.dateValue;
				var idFechaFin = this.byId("idFecha").mProperties.secondDateValue;
				console.log(this.byId("idFecha"));
				var error="";
				var valido=true;
				if(idEstado==="" || idEstado===null){
					error+="El campo Estados de la Reserva no debe estar vacío\n";
					oGlobalBusyDialog.close();
					valido=false;
				
				}
				if(!this.byId("idFecha").mProperties.dateValue){
					error+="Debe ingresar una fecha de reserva"
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
			
				console.log(fechaIni);
				console.log(fechaFin);
			
				var body={
					"fieldsEt_mensj": [
					  
					],
					"fieldsT_rnv": [
					  
					],
					"fieldsT_rpn": [
					  
					],
					"ip_cdalm": idAlmacen,
					"ip_cdemb": idEmbarcacion,
					"ip_esrnv": idEstado,
					"ip_fhrnvf": fechaFin,
					"ip_fhrnvi": fechaIni,
					"ip_nrrnv": idReserva,
					"ip_tope": "FR"
				};
				console.log(body);
				fetch(`${mainUrlServices}aceitesusados/Listar`,
					  {
						  method: 'POST',
						  body: JSON.stringify(body)
					  })
					  .then(resp => resp.json()).then(data => {
						var dataAceite = data;
						for(var i=0;i<data.t_rpn.length;i++){
							data.t_rpn[i].NRTGA=String(data.t_rpn[i].NRTGA)
							data.t_rpn[i].CNSUM=String(data.t_rpn[i].CNSUM)
							console.log(data.t_rpn[i].CDSUM);
							data.t_rpn[i].CDSUMDESC=this.traeMaterial(data.t_rpn[i].CDSUM);
							data.t_rpn[i].CDALMDESC=this.traeAlmacen(data.t_rpn[i].CDALM);
							
						}
						  console.log(data.t_rpn);
						  dataAceite.t_rpn.total=dataAceite.t_rpn.length;
						  if(data.t_rpn){
							exportarExcel=true;
						  }
						  this.getView().getModel("Aceite").setProperty("/listaAceite",data.t_rpn);
						  this.byId("title").setText("Lista de registros: "+dataAceite.t_rpn.total);
						oGlobalBusyDialog.close();
					  }).catch(error => console.log(error)
				);
			},
			traeAlmacen: function(almacen){
				var almacenD="";
				for(var i=0;i<this.almacenDesc.length;i++){
					if(this.almacenDesc[i].id===almacen)
					{
						almacenD=this.almacenDesc[i].descripcion;
					}
				}
				return almacenD;
			},
			traeMaterial: function(material){
				var materialD="";
				for(var i=0;i<this.materialDesc.length;i++){
					if(this.materialDesc[i].id===material)
					{
						materialD=this.materialDesc[i].descripcion;
					}
				}
				return materialD;
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
			
				createColumnConfig5: function() {
					return [
						{
							label: 'Reserva',
							property: 'NRRNV' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Embarcación',
							property: 'NMEMB' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Material',
							property: 'CDSUM' ,
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
							label: 'Fecha de reserva',
							property: 'FHCRN' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Total peso Kg',
							property: 'CNSUM' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Cant. galones',
							property: 'NRTGA' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'UM',
							property: 'MSEHL' ,
							type: EdmType.String,
							scale: 2
						},
						{
							label: 'Estado',
							property: 'DESC_ESRNV' ,
							type: EdmType.String,
							scale: 2
						}
						];
				},
				onDataExport: function() {
					oGlobalBusyDialog.open();
					if(!exportarExcel){
						MessageBox.error("Porfavor, realizar una búsqueda antes de exportar");
						oGlobalBusyDialog.close();
						return false;
					}
					var aCols, aProducts, oSettings, oSheet;
		
					aCols = this.createColumnConfig5();
					console.log(this.getView().getModel("Aceite"));
					aProducts = this.getView().getModel("Aceite").getProperty('/listaAceite');
		
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
						fileName:"Reporte de Aceites Usados"
					};
		
					oSheet = new Spreadsheet(oSettings);
					oSheet.build()
						.then( function() {
							MessageToast.show('El Archivo ha sido exportado correctamente');
						})
						.finally(oSheet.destroy);
						oGlobalBusyDialog.close();
				},
				filterGlobally : function(oEvent) {
					var sQuery = oEvent.getParameter("query");
					this._oGlobalFilter = null;
		  
						  if (sQuery) {
							  this._oGlobalFilter = new Filter([
								  new Filter("NRRNV", FilterOperator.Contains, sQuery),
								  new Filter("NMEMB", FilterOperator.Contains, sQuery),
								  new Filter("CDSUM", FilterOperator.Contains, sQuery),
								  new Filter("CDALM", FilterOperator.Contains, sQuery),
								  new Filter("FHCRN", FilterOperator.Contains, sQuery),
								  new Filter("MSEHL", FilterOperator.Contains, sQuery),
								  new Filter("ESRNV", FilterOperator.Contains, sQuery)
								  
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

						  onDetail : function(oEvent) {
							var cadena=oEvent.getSource().getBindingContext("Aceite").getPath().split("/")[2];
							console.log(cadena);
							console.log(this.getView().bindElement({path: "Aceite>/listaAceite/"+ cadena}));
							console.log(this.getView().getModel("Aceite").oData.listaAceite[cadena]);
							this._onOpenDialogAceite();
						},
						_openNuevoAceite: function(){
							this._getNuevoAceite().open();
							this.onLimpiarNuevo();
						},
						_onCloseNuevoAceite: function(){
							this._getNuevoAceite().close();
						},
						_getNuevoAceite: function(){
							if (!this._oNuevoAceite) {
								this._oNuevoAceite = sap.ui.xmlfragment("com.tasa.aceitesusados.view.DlgNuevoAceite", this.getView().getController());
								this.getView().addDependent(this._oNuevoAceite);
								sap.ui.getCore().byId("idCentroNew").setValue(this.centro);
								
							}
							return this._oNuevoAceite;
						},
						_onOpenDialogAceite: function() {
							this._getDialogAceite().open();
							
							},
				
							_onCloseDialogAceite: function() {
								this._getDialogAceite().close();
							},
				
							_getDialogAceite : function () {
								if (!this._oDialogAceite) {
									this._oDialogAceite = sap.ui.xmlfragment("com.tasa.aceitesusados.view.DlgDetalleAceite", this.getView().getController());
									this.getView().addDependent(this._oDialogAceite);
									sap.ui.getCore().byId("idCentro").setValue(this.centro);
								}
								
								return this._oDialogAceite;
							},
							onLimpiar: function(){
								this.byId("idReserva").setValue("");
								this.byId("idEstado").setValue("");
								this.byId("idAlmacen").setValue("");
								this.byId("idEmbarcacion2").setValue("");
								this.byId("idFecha").setValue("");
								this.byId("txtEmbarca").setText("");
								this.getView().getModel("Aceite").setProperty("/listaAceite","");
							},
							castFecha: function(fecha){
								if(fecha==="null" || fecha===""){
									return "";
								}
								var fechaFinal = fecha.split("/");
								console.log(fechaFinal);
								console.log(fechaFinal[2]+fechaFinal[1]+fechaFinal[0]);
								return fechaFinal[2]+fechaFinal[1]+fechaFinal[0];
							},
							castHora: function(hora){
								
								var fechaFinal = hora.split(":");
								console.log(fechaFinal);
								console.log(fechaFinal[2]+fechaFinal[1]+fechaFinal[0]);
								return fechaFinal[2]+fechaFinal[1]+fechaFinal[0];
							},
							onAnular: function(){
								
								var indice = this.byId("table").getSelectedIndices();
								var data ;
								console.log(indice);
								var arreglo=this.getView().byId("table").getModel("Aceite").oData.listaAceite;
								for(var i=0;i<indice.length;i++){
									if(arreglo[i].ESRNV==="A"){
										MessageBox.error("No se puede anular un registro con estado Anulado");
										return false;
									}
								}
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
														"atcrn": arreglo[i].ATCRN,
														"atmfn": arreglo[i].ATMFN,
														"cdalm": arreglo[i].CDALM,
														"cdemb": arreglo[i].CDEMB,
														"cdpta": arreglo[i].CDPTA,
														"cdsum": arreglo[i].CDSUM,
														"cdumd": arreglo[i].CDUMD,
														"cnbar": arreglo[i].CNBAR,
														"cnsum": arreglo[i].CNSUM,
														"demat": arreglo[i].DEMAT,
														"dsest": arreglo[i].DSEST,
														"dswks": arreglo[i].DSWKS,
														"esrnv": arreglo[i].ESRNV,
														"fhcrn": this.castFecha(arreglo[i].FHCRN),
														"fhmfn": this.castFecha(arreglo[i].FHMFN),
														"fhrnv": this.castFecha(arreglo[i].FHRNV),
														"hrcrn": arreglo[i].HRCRN,
														"hrmfn": arreglo[i].HRMFN,
														"lgobe": arreglo[i].LGOBE,
														"mandt": arreglo[i].MANDT,
														"msehl": arreglo[i].MSEHL,
														"nmemb": arreglo[i].NMEMB,
														"nrgrm": arreglo[i].NRGRM,
														"nrpos": arreglo[i].NRPOS,
														"nrrnv": arreglo[i].NRRNV,
														"nrtga": arreglo[i].NRTGA,
														"nrtkp": arreglo[i].NRTKP
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
							},
							anularPrecio: function(array){
								console.log(array);
								oGlobalBusyDialog.open();
								var bodyGuardar={
									"fhrnv": "",
									"fieldsEt_mensj": [
									  
									],
									"fieldsT_rnv": [
									  
									],
									"fieldsT_rpn": [
									  
									],
									"ip_cdalm": "",
									"ip_cdemb": "",
									"ip_esrnv": "",
									"ip_fhrnvf": "",
									"ip_fhrnvi": "",
									"ip_nrrnv": "",
									"ip_tope": "",
									"t_rpn": array
								}
								console.log(bodyGuardar);
							 
								 fetch(`${mainUrlServices}aceitesusados/Anular`,
									{
										method: 'POST',
										body: JSON.stringify(bodyGuardar)
									})
									.then(resp => resp.json()).then(data => {
									
										console.log(data.length);
										var mensaje = data;
										console.log(mensaje);
										var textMessage="";
										for(var i=0;i<array.length;i++){
											textMessage+="Reserva "+array[i].nrrnv +" borrada\n";
										}
										MessageBox.success(textMessage);
										this.onBusqueda();
										oGlobalBusyDialog.close();
									}).catch(error => MessageBox.error("El servicio no está disponible")
									);
					
							},
							onNuevo: function(){
								
								this._openNuevoAceite();
								var fecha=this.getFechaActual();
								sap.ui.getCore().byId("idFechaReservaNew").setValue(fecha);
							},
							onLimpiarNuevo: function(){
								sap.ui.getCore().byId("idFechaReservaNew").setValue("");
								sap.ui.getCore().byId("idEmbarcacionNew").setValue("");
								sap.ui.getCore().byId("idMaterialNew").setValue("");
								sap.ui.getCore().byId("idAlmacenNew").setValue("");
								sap.ui.getCore().byId("idGalonesNew").setValue("");
								sap.ui.getCore().byId("idBarrilesNew").setValue("");
								sap.ui.getCore().byId("idTipoMaterialNew").setValue("");
								sap.ui.getCore().byId("idNroTicketNew").setValue("");
								sap.ui.getCore().byId("idRemisionNew").setValue("");
								sap.ui.getCore().byId("idKilosNew").setValue("");
								sap.ui.getCore().byId("txtEmbarcaNew").setText("");
							},
							onGuardar:  function(){
								oGlobalBusyDialog.open();
								var idFechaReservaNew=sap.ui.getCore().byId("idFechaReservaNew").getValue();
								var idEmbarcacionNew=sap.ui.getCore().byId("idEmbarcacionNew").getValue();
								var idMaterialNew=sap.ui.getCore().byId("idMaterialNew").getSelectedKey();
								var idCentroNew=sap.ui.getCore().byId("idCentroNew").getValue();
								var idAlmacenNew=sap.ui.getCore().byId("idAlmacenNew").getSelectedKey();
								var idGalonesNew=sap.ui.getCore().byId("idGalonesNew").getValue();
								var idBarrilesNew=sap.ui.getCore().byId("idBarrilesNew").getValue();
								var idTipoMaterialNew=sap.ui.getCore().byId("idTipoMaterialNew").getSelectedKey();
								var idNroTicketNew=sap.ui.getCore().byId("idNroTicketNew").getValue();
								var idRemisionNew=sap.ui.getCore().byId("idRemisionNew").getValue();
								var idKilosNew=sap.ui.getCore().byId("idKilosNew").getValue();
								idNroTicketNew=this.zeroFill(idNroTicketNew,10);
								console.log(idFechaReservaNew);
								console.log(idEmbarcacionNew);
								console.log(idMaterialNew);
								console.log(idCentroNew);
								console.log(idAlmacenNew);
								console.log(idGalonesNew);
								console.log(idBarrilesNew);
								console.log(idTipoMaterialNew);
								console.log(idNroTicketNew);
								console.log(idRemisionNew);
								console.log(idKilosNew);
							
							
								var body={
									"fhrnv": idFechaReservaNew,
									"fieldsEt_mensj": [
									  
									],
									"fieldsT_rnv": [
									  
									],
									"fieldsT_rpn": [
									  
									],
									"ip_cdalm": "",
									"ip_cdemb": "",
									"ip_esrnv": "",
									"ip_fhrnvf": "",
									"ip_fhrnvi": "",
									"ip_nrrnv": "",
									"ip_tope": "NR",
									"t_rpn": [
									  {
										"atcrn": "FGARCIA",
										"atmfn": "",
										"cdalm": idAlmacenNew,
										"cdemb": idEmbarcacionNew,
										"cdpta": this.planta,
										"cdsum": idMaterialNew,
										"cdumd": "",
										"cnbar": idBarrilesNew,
										"cnsum": idKilosNew,
										"demat": idTipoMaterialNew,
										"dsest": "",
										"dswks": "",
										"esrnv": "",
										"fhcrn": "",
										"fhmfn": "",
										"fhrnv": idFechaReservaNew,
										"hrcrn": "000000",
										"hrmfn": "000000",
										"lgobe": "",
										"mandt": "",
										"msehl": "",
										"nmemb": "",
										"nrgrm": idRemisionNew,
										"nrpos": "0000",
										"nrrnv": "0000000000",
										"nrtga": idGalonesNew,
										"nrtkp": idNroTicketNew
									  }
									]
								  };
								  console.log(body);
								  fetch(`${mainUrlServices}aceitesusados/Nuevo`,
									{
										method: 'POST',
										body: JSON.stringify(body)
									})
									.then(resp => resp.json()).then(data => {
									
										console.log(data);
										if(data && data.ep_nrrnv!="0000000000"){
											MessageBox.warning(
												data.et_mensj, {
													icon: MessageBox.Icon.SUCCESS,
													title: "Registro satisfactorio",
													actions: [MessageBox.Action.OK],
													emphasizedAction: MessageBox.Action.YES,
													onClose: function (oAction) { if(oAction=="OK"){
													   this._onCloseNuevoAceite();
													}}.bind(this)
												}
											); 
											
										}else{
											MessageBox.error(data.et_mensj);
										}
										oGlobalBusyDialog.close();
										
										
									}).catch(error => MessageBox.error("El servicio no está disponible")
									);

							},

							llenarPlanta: async function (centro){
								console.log(centro);
								oGlobalBusyDialog.open();
								var planta="";
								var body={
									"delimitador": "|",
									"fields": [
									  "CDPTA"
									],
									"no_data": "",
									"option": [
									  
									],
									"options": [
										{
											"cantidad":"10",
											"control":"INPUT",
											"key":"WERKS",
											"valueHigh":"",
											"valueLow":centro
										}
									],
									"order": "",
									"p_user": "FGARCIA",
									"rowcount": 0,
									"rowskips": 0,
									"tabla": "ZFLPTA"
								  }
								  await	 fetch(`${mainUrlServices}General/Read_Table/`,
									{
										method: 'POST',
										body: JSON.stringify(body)
									})
									.then(resp => resp.json()).then(data => {
										
										planta=data.data[0].CDPTA;	
										oGlobalBusyDialog.close();
										
									}).catch((error)=>{
										MessageBox.error("Ocurrió un error en la carga, favor de actualizar")
										oGlobalBusyDialog.close();
									}
								);
								
								return planta;
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
									this.oDialog = sap.ui.xmlfragment("com.tasa.aceitesusados.view.Embarcacion", this);
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
								var detail = this.getView().getModel("consultaMareas").oData.embarcaciones[indices].NMEMB;
								if (this.currentInputEmba.includes("idEmbarcacion2")) {
									this.byId("idEmbarcacion2").setValue(data);
								}else if(this.currentInputEmba.includes("idEmbarcacionNew")){
									sap.ui.getCore().byId("idEmbarcacionNew").setValue(data);
									sap.ui.getCore().byId("txtEmbarcaNew").setText(detail);
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
										new Filter("NRRNV", FilterOperator.Contains, sQuery),
										new Filter("NMEMB", FilterOperator.Contains, sQuery),
										new Filter("CDSUM", FilterOperator.Contains, sQuery),
										new Filter("CDALM", FilterOperator.Contains, sQuery),
										new Filter("FHCRN", FilterOperator.Contains, sQuery),
										new Filter("MSEHL", FilterOperator.Contains, sQuery),
										new Filter("ESRNV", FilterOperator.Contains, sQuery),
										new Filter("NRTGA", FilterOperator.Contains, sQuery),
										new Filter("CNSUM", FilterOperator.Contains, sQuery),
										new Filter("DESC_ESRNV", FilterOperator.Contains, sQuery)
										
										  
									
									]);
									aFilters.push(filter);
								}
					
								// update list binding
								var oList = this.byId("table");
								var oBinding = oList.getBinding("rows");
								oBinding.filter(aFilters, "Application");
							}

	});
});