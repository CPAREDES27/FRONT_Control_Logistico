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
	"sap/m/MessageToast"
], function (BaseController,
	JSONModel,
	formatter,
	Filter,
	FilterOperator,
	Fragment,
	MessageBox,
	ExportTypeCSV,
	Export,
	MessageToast) {
	"use strict";
	const mainUrlServices = 'https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com/api/';
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var centro=null;
	var codEmbarca=false;
	var planta="";
	return BaseController.extend("com.tasa.aceitesusados.controller.Worklist", {

		formatter: formatter,
		onInit : async function () {
			try{
				await this.loadCombos();
				this.planta=await this.llenarPlanta(this.centro);
				console.log(this.planta);
				
			}catch(error){
				MessageBox.error("Ocurrió un error en la carga, actualice el navegador");

			}
			
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
					ZD_FLESRNV= data.data.find(d => d.dominio == "ZD_FLESRNV").data;
					ZINPRP= data.data.find(d => d.dominio == "ZINPRP").data;
					ALMACEN= data.data.find(d => d.dominio == "ALMACEN").data;
					MATERIAL= data.data.find(d => d.dominio == "MATERIAL").data;
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
						  console.log(data.t_rpn);
						  this.getView().getModel("Aceite").setProperty("/listaAceite",data.t_rpn);
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
					exportType: new ExportTypeCSV({ // required from "sap/ui/core/util/ExportTypeCSV"
					  separatorChar: ";",
					  charset: "utf-8"
					}),
					//PoliticaPrecio>/listaPolitica
					models: this.getView().getModel("Aceite"),
					rows:{path:""},
					rows: { path: "/listaAceite" },
					columns: [
					  {
						name: "Reserva",
						template: {
						  content: "{NRRNV}"
						}
					  },
					  {
						name: "Embarcación",
						template: {
						  content: "{NMEMB}"
						}
					  },
					  {
						name: "Material",
						template: {
						  content: "{CDSUM}"
						}
					  },
					  {
						name: "Almacén",
						template: {
						  content: "{CDALM}"
						}
					  },
					  {
						name: "Fecha de reserva",
						template: {
						  content: "{FHCRN}"
						}
					  },
					  {
						name: "Total peso Kg",
						template: {
						  content: "{CNSUM}"
						}
					  },
					  {
						name: "Cant. galones",
						template: {
						  content: "{NRTGA}"
						}
					  },
					  {
						name: "UM",
						template: {
						  content: "{MSEHL}"
						}
					  },
					  {
						name: "Estado",
						template: {
						  content: "{ESRNV}"
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
							}

	});
});