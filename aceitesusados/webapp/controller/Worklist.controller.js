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
	"sap/ui/core/BusyIndicator",
	"./Utilities",
	"../service/ServiceImpl",
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
	BusyIndicator,
	Utilities,
	ServiceImpl) {
	"use strict";
	var oGlobalBusyDialog = new sap.m.BusyDialog();
	var EdmType = exportLibrary.EdmType;
	var centro = null;
	var codEmbarca = false;
	var planta = "";
	var exportarExcel = false;
	var materialDesc = [];
	var almacenDesc = [];
	return BaseController.extend("com.tasa.aceitesusados.controller.Worklist", {

		formatter: formatter,
		onInit: async function () {
			let ViewModel = new JSONModel(
				{}
			);
			this.setModel(ViewModel, "consultaMareas");
			this.currentInputEmba = "";
			this.primerOption = [];
			this.segundoOption = [];
			this.currentPage = "";
			this.lastPage = "";
			try {
				await this.onLoadCombos();
				this.planta = await this.onLlenarPlanta(this.centro);

			} catch (error) {
				MessageBox.error("Ocurrió un error en la carga, actualice el navegador");

			}
			let sFecha = this.onGetFechaActual();
			let sFechaActual = sFecha + " - " + sFecha;
			this.byId("idFecha").setValue(sFechaActual);
		},
		onAfterRendering: async function () {
			this.userOperation = await this.onGetCurrentUser();
			this.objetoHelp = this.onGetHelpSearch();
			this.parameter = this.objetoHelp[0].parameter;
			this.url = this.objetoHelp[0].url;
			
			await this.onCallConstantes();
		},

		onCallConstantes: async function () {
			oGlobalBusyDialog.open();
			let oBody = {
				"nombreConsulta": "CONSGENCONST",
				"p_user": this.userOperation,
				"parametro1": this.parameter,
				"parametro2": "",
				"parametro3": "",
				"parametro4": "",
				"parametro5": ""
			}
			let aData = await ServiceImpl.onCallConstantesService(oBody);
			this.HOST_HELP = this.url + aData.data[0].LOW;
			let oModel = new JSONModel();
			this.getView().setModel(oModel);

		},
		onGetFechaActual: function () {
			let oFecha = new Date();
			let oDia = oFecha.getDate();
			let oMes = oFecha.getMonth() + 1;
			let oAnio = oFecha.getFullYear();
			if (oDia < 10) {
				oDia = this.onZeroFill(oDia, 2);
			}
			if (oMes < 10) {
				oMes = this.onZeroFill(oMes, 2);
			}
			return oAnio + "" + oMes + "" + oDia;
		},

		/**
		 *onLoadCombos: Método que llena los combos de los datos de selección.
		 */
		onLoadCombos: async function () {
			oGlobalBusyDialog.open();
			let sZD_FLESRNV = null;
			let sZINPRP = null;
			let sALMACEN = null;
			let sCENTRO = null;
			let sMATERIAL = null;
			let sTIPOMATERIAL = null;
			let oBody = {
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
			let aData = await ServiceImpl.onLoadCombosService(oBody);

			sZD_FLESRNV = aData.data.find(d => d.dominio == "ZD_FLESRNV").data;
			sZINPRP = aData.data.find(d => d.dominio == "ZINPRP").data;
			sALMACEN = aData.data.find(d => d.dominio == "ALMACEN").data;
			sMATERIAL = aData.data.find(d => d.dominio == "MATERIAL").data;
			this.materialDesc = aData.data.find(d => d.dominio == "MATERIAL").data;
			this.almacenDesc = aData.data.find(d => d.dominio == "ALMACEN").data;
			sTIPOMATERIAL = aData.data.find(d => d.dominio == "TIPOMATERIAL").data;
			this.getModel("Estado").setProperty("/ZD_FLESRNV", sZD_FLESRNV);
			this.getModel("Propiedad").setProperty("/ZINPRP", sZINPRP);
			this.getModel("Almacen").setProperty("/ALMACEN", sALMACEN);
			this.getModel("Material").setProperty("/MATERIAL", sMATERIAL);
			this.getModel("TipoMaterial").setProperty("/TIPOMATERIAL", sTIPOMATERIAL);
			this.centro = aData.data.find(d => d.dominio == "CENTRO").data[0].id;
			oGlobalBusyDialog.close();

		},
		onOpenDialogEmbarcacion: function (nuevo) {

			this.getView().getModel("Embarcacion").setProperty("/listaEmbarcacion", "");

			if (nuevo === "hola") {
				this.codEmbarca = true;
			}
			this.onGetDialogEmbarcacion().open();

		},

		onCloseDialogEmbarcacion: function () {
			this.onGetDialogEmbarcacion().close();
		},

		onGetDialogEmbarcacion: function () {
			if (!this._oDialogEmbarcacion) {
				this._oDialogEmbarcacion = sap.ui.xmlfragment("com.tasa.aceitesusados.view.Embarcacion", fthis.getView().getController());
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
		onBuscar: function (evt) {
			let iIndices = evt.mParameters.listItem.oBindingContexts.Embarcacion.sPath.split("/")[2];
			let sData = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[iIndices].CDEMB;
			let sDetail = this.getView().getModel("Embarcacion").oData.listaEmbarcacion[iIndices].NMEMB;
			if (this.codEmbarca) {
				sap.ui.getCore().byId("inputId1_R").setValue(sData);
				sap.ui.getCore().byId("txtEmbarcaNew").setText(sDetail);
			} else {
				this.byId("idEmbarcacion2").setValue(sData);
				this.byId("txtEmbarca").setText(sDetail);
			}

			this.onCloseDialogEmbarcacion();
		},
		onListaEmbarcacion: async function () {
			oGlobalBusyDialog.open();
			let sIdEmbarcacion = sap.ui.getCore().byId("idEmbarcacion").getValue();
			let sIdEmbarcacionDesc = sap.ui.getCore().byId("idEmbarcacionDesc").getValue();
			let sIdMatricula = sap.ui.getCore().byId("idMatricula").getValue();
			let sIdRuc = sap.ui.getCore().byId("idRuc").getValue();
			let sIdArmador = sap.ui.getCore().byId("idArmador").getValue();
			let sIdPropiedad = sap.ui.getCore().byId("idPropiedad").getSelectedKey();

			let aOptions = [];
			let aOptions2 = [];
			aOptions.push({
				"cantidad": "20",
				"control": "COMBOBOX",
				"key": "ESEMB",
				"valueHigh": "",
				"valueLow": "O"
			})
			if (sIdEmbarcacion) {
				aOptions.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": sIdEmbarcacion

				});
			}
			if (sIdEmbarcacionDesc) {
				aOptions.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": sIdEmbarcacionDesc

				});
			}
			if (sIdMatricula) {
				aOptions.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "MREMB",
					"valueHigh": "",
					"valueLow": sIdMatricula
				})
			}
			if (sIdPropiedad) {
				aOptions.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "INPRP",
					"valueHigh": "",
					"valueLow": sIdPropiedad
				})
			}
			if (sIdRuc) {
				aOptions2.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": sIdRuc
				})
			}
			if (sIdArmador) {
				aOptions2.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NAME1",
					"valueHigh": "",
					"valueLow": sIdArmador
				})
			}

			let oBody = {
				"option": [

				],
				"option2": [

				],
				"options": aOptions,
				"options2": aOptions2,
				"p_user": "BUSQEMB"
			}
			let aData = await ServiceImpl.onListaEmbarcacionService(oBody);
			let aDataPuerto = aData.data;
					
					sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: " + aDataPuerto.length);
					if (aDataPuerto.length <= 0) {
						sap.ui.getCore().byId("titleEmbarca").setText("Lista de registros: No se encontraron resultados");
					}
					oGlobalBusyDialog.close();

			
		},
		/**
		 *onBusqueda: Método que busca los precios.
		 */
		onBusqueda: async function () {
			oGlobalBusyDialog.open();
			let sIdAlmacen = this.byId("idAlmacen").getSelectedKey();
			let sIdEmbarcacion = this.byId("idEmbarcacion2").getValue();
			let sIdEstado = this.byId("idEstado").getSelectedKey();
			let sIdReserva = this.byId("idReserva").getValue();
			let sIdFechaIni = this.byId("idFecha").mProperties.dateValue;
			let sIdFechaFin = this.byId("idFecha").mProperties.secondDateValue;
			let sError = "";
			let bValido = true;
			if (sIdEstado === "" || sIdEstado === null) {
				sError += "El campo Estados de la Reserva no debe estar vacío\n";
				oGlobalBusyDialog.close();
				bValido = false;

			}
			if (!this.byId("idFecha").mProperties.dateValue) {
				sError += "Debe ingresar una fecha de reserva"
				oGlobalBusyDialog.close();
				bValido = false;
			}
			if (!bValido) {
				MessageBox.error(sError);
				return false;
			}
			let sDateIni = new Date(sIdFechaIni);
			let sMesIni;
			let sDiaIni;
			sMesIni = sDateIni.getMonth() + 1;
			sDiaIni = sDateIni.getDate();
			if (sMesIni < 10) {
				sMesIni = this.onZeroFill(sMesIni, 2);
			}
			if (sDiaIni < 10) {
				sDiaIni = this.onZeroFill(sDiaIni, 2);
			}
			let sFechaIni = sDateIni.getFullYear() + "" + sMesIni + "" + sDiaIni;
			let sDateFin = new Date(sIdFechaFin);
			let sMesFin;
			let sDiaFin;
			sMesFin = sDateFin.getMonth() + 1;
			sDiaFin = sDateFin.getDate();
			if (sMesFin < 10) {
				sMesFin = this.onZeroFill(sMesFin, 2);
			}
			if (sDiaFin < 10) {
				sDiaFin = this.onZeroFill(sDiaFin, 2);
			}
			let sFechaFin = sDateFin.getFullYear() + "" + sMesFin + "" + sDiaFin;


			let oBody = {
				"fieldsEt_mensj": [

				],
				"fieldsT_rnv": [

				],
				"fieldsT_rpn": [

				],
				"ip_cdalm": sIdAlmacen,
				"ip_cdemb": sIdEmbarcacion,
				"ip_esrnv": sIdEstado,
				"ip_fhrnvf": sFechaFin,
				"ip_fhrnvi": sFechaIni,
				"ip_nrrnv": sIdReserva,
				"ip_tope": "FR"
			};
			let aData = await ServiceImpl.onBusquedaService(oBody);
			let aDataAceite = aData;
			for (let i = 0; i < aData.t_rpn.length; i++) {
				aData.t_rpn[i].NRTGA = String(aData.t_rpn[i].NRTGA)
				aData.t_rpn[i].CNSUM = String(aData.t_rpn[i].CNSUM)
				aData.t_rpn[i].CDSUMDESC = this.onTraeMaterial(aData.t_rpn[i].CDSUM);
				aData.t_rpn[i].CDALMDESC = this.onTraeAlmacen(aData.t_rpn[i].CDALM);

			}
			aDataAceite.t_rpn.total = aDataAceite.t_rpn.length;
			if (aData.t_rpn) {
				exportarExcel = true;
			}
			this.getView().getModel("Aceite").setProperty("/listaAceite", aData.t_rpn);
			this.byId("title").setText("Lista de registros: " + aDataAceite.t_rpn.total);
			oGlobalBusyDialog.close();


		},
		onTraeAlmacen: function (almacen) {
			let sAlmacenD = "";
			for (let i = 0; i < this.almacenDesc.length; i++) {
				if (this.almacenDesc[i].id === almacen) {
					sAlmacenD = this.almacenDesc[i].descripcion;
				}
			}
			return sAlmacenD;
		},
		onTraeMaterial: function (material) {
			let sMaterialD = "";
			for (let i = 0; i < this.materialDesc.length; i++) {
				if (this.materialDesc[i].id === material) {
					sMaterialD = this.materialDesc[i].descripcion;
				}
			}
			return sMaterialD;
		},
		onZeroFill: function (number, width) {
			width -= number.toString().length;
			if (width > 0) {
				return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
			}
			return number + ""; // siempre devuelve tipo cadena
		},

		onCreateColumnConfig5: function () {
			return [
				{
					label: 'Reserva',
					property: 'NRRNV',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Embarcación',
					property: 'NMEMB',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Material',
					property: 'CDSUM',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Almacén',
					property: 'CDALM',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Fecha de reserva',
					property: 'FHCRN',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Total peso Kg',
					property: 'CNSUM',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Cant. galones',
					property: 'NRTGA',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'UM',
					property: 'MSEHL',
					type: EdmType.String,
					scale: 2
				},
				{
					label: 'Estado',
					property: 'DESC_ESRNV',
					type: EdmType.String,
					scale: 2
				}
			];
		},
		/**
		 * onDataExport: Método que exporta en excel la data de la grilla.
		*/
		onDataExport: function () {
			oGlobalBusyDialog.open();
			if (!exportarExcel) {
				MessageBox.error("Porfavor, realizar una búsqueda antes de exportar");
				oGlobalBusyDialog.close();
				return false;
			}
			let aCols, aProducts, oSettings, oSheet;

			aCols = this.onCreateColumnConfig5();
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
				fileName: "Reporte de Aceites Usados"
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function () {
					MessageToast.show('El Archivo ha sido exportado correctamente');
				})
				.finally(oSheet.destroy);
			oGlobalBusyDialog.close();
		},
		onFilterGlobally: function (oEvent) {
			let sQuery = oEvent.getParameter("query");
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

			this.onFilter();
		},
		onFilter: function () {
			let oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("table").getBinding().filter(oFilter, "Application");
		},

		onDetail: function (oEvent) {
			let iCadena = oEvent.getSource().getBindingContext("Aceite").getPath().split("/")[2];
			this.getView().bindElement({ path: "Aceite>/listaAceite/" + iCadena });
			this.getView().getModel("Aceite").oData.listaAceite[iCadena];
			//console.log(this.getView().bindElement({ path: "Aceite>/listaAceite/" + iCadena }));
			//console.log(this.getView().getModel("Aceite").oData.listaAceite[iCadena]);
			this.onOpenDialogAceite();
		},
		onOpenNuevoAceite: function () {
			this.onGetNuevoAceite().open();
			this.onLimpiarNuevo();
		},
		onCloseNuevoAceite: function () {
			this.onGetNuevoAceite().close();
		},
		onGetNuevoAceite: function () {
			if (!this._oNuevoAceite) {
				this._oNuevoAceite = sap.ui.xmlfragment("com.tasa.aceitesusados.view.DlgNuevoAceite", this.getView().getController());
				this.getView().addDependent(this._oNuevoAceite);
				sap.ui.getCore().byId("idCentroNew").setValue(this.centro);

			}
			return this._oNuevoAceite;
		},
		onOpenDialogAceite: function () {
			this.onGetDialogAceite().open();

		},

		onCloseDialogAceite: function () {
			this.onGetDialogAceite().close();
		},

		onGetDialogAceite: function () {
			if (!this._oDialogAceite) {
				this._oDialogAceite = sap.ui.xmlfragment("com.tasa.aceitesusados.view.DlgDetalleAceite", this.getView().getController());
				this.getView().addDependent(this._oDialogAceite);
				sap.ui.getCore().byId("idCentro").setValue(this.centro);
			}

			return this._oDialogAceite;
		},
		onLimpiar: function () {
			this.byId("idReserva").setValue("");
			this.byId("idEstado").setSelectedKey("");
			this.byId("idAlmacen").setValue("");
			this.byId("idEmbarcacion2").setValue("");
			this.byId("idFecha").setValue("");
			this.byId("txtEmbarca").setText("");
			this.getView().getModel("Aceite").setProperty("/listaAceite", "");
		},
		onCastFecha: function (fecha) {
			if (fecha === "null" || fecha === "") {
				return "";
			}
			let aFechaFinal = fecha.split("/");			
			return aFechaFinal[2] + aFechaFinal[1] + aFechaFinal[0];
		},
		onCastHora: function (hora) {

			let aFechaFinal = hora.split(":");			
			return aFechaFinal[2] + aFechaFinal[1] + aFechaFinal[0];
		},
		
		onAnular: function () {

			let aIndice = this.byId("table").getSelectedIndices();
			if (aIndice.length === 0) {
				MessageBox.error("Debe seleccionar un elemento");
				return false;
			}
			let aArreglo = this.getView().byId("table").getModel("Aceite").oData.listaAceite;
			for (let i = 0; i < aIndice.length; i++) {
				if (aArreglo[i].ESRNV === "A") {
					MessageBox.error("No se puede anular un registro con estado Anulado");
					return false;
				}
			}
			let aArray = [];
			let aData = [];
			MessageBox.warning(
				"Desea anular el registro?", {
				icon: MessageBox.Icon.WARNING,
				title: "Anular",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				emphasizedAction: MessageBox.Action.YES,
				onClose: function (oAction) {
					if (oAction == "YES") {
						for (let j = 0; j < aIndice.length; j++) {
							for (let i = 0; i < aArreglo.length; i++) {
								if (i == aIndice[j]) {
									aArray = {
										"atcrn": aArreglo[i].ATCRN,
										"atmfn": aArreglo[i].ATMFN,
										"cdalm": aArreglo[i].CDALM,
										"cdemb": aArreglo[i].CDEMB,
										"cdpta": aArreglo[i].CDPTA,
										"cdsum": aArreglo[i].CDSUM,
										"cdumd": aArreglo[i].CDUMD,
										"cnbar": aArreglo[i].CNBAR,
										"cnsum": aArreglo[i].CNSUM,
										"demat": aArreglo[i].DEMAT,
										"dsest": aArreglo[i].DSEST,
										"dswks": aArreglo[i].DSWKS,
										"esrnv": aArreglo[i].ESRNV,
										"fhcrn": this.onCastFecha(aArreglo[i].FHCRN),
										"fhmfn": this.onCastFecha(aArreglo[i].FHMFN),
										"fhrnv": this.onCastFecha(aArreglo[i].FHRNV),
										"hrcrn": aArreglo[i].HRCRN,
										"hrmfn": aArreglo[i].HRMFN,
										"lgobe": aArreglo[i].LGOBE,
										"mandt": aArreglo[i].MANDT,
										"msehl": aArreglo[i].MSEHL,
										"nmemb": aArreglo[i].NMEMB,
										"nrgrm": aArreglo[i].NRGRM,
										"nrpos": aArreglo[i].NRPOS,
										"nrrnv": aArreglo[i].NRRNV,
										"nrtga": aArreglo[i].NRTGA,
										"nrtkp": aArreglo[i].NRTKP
									}
								}
							}
							aData.push(aArray);
						}
						this.onAnularPrecio(aData);
						oGlobalBusyDialog.close();
					} else { oGlobalBusyDialog.close(); }
				}.bind(this)
			}
			);
		},
		/**
		 *onAnular: Método que anula un precio seleccionado de la grilla.
		 *		 		 		 */
		onAnularPrecio: async function (array) {

			oGlobalBusyDialog.open();
			let oBody = {
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
			let aData = await ServiceImpl.onAnularPrecioService(oBody);
			let aMensaje = aData;
			let sTextMessage = "";
			for (let i = 0; i < array.length; i++) {
				sTextMessage += "Reserva " + array[i].nrrnv + " borrada\n";
			}
			this.onBusqueda();
			oGlobalBusyDialog.close();

		},
		onNuevo: function () {

			this.onOpenNuevoAceite();
			let sFecha = this.onGetFechaActual();
			sap.ui.getCore().byId("idFechaReservaNew").setValue(sFecha);
		},
		onLimpiarNuevo: function () {

			sap.ui.getCore().byId("inputId1_R").setValue("");
			sap.ui.getCore().byId("idMaterialNew").setValue("");
			sap.ui.getCore().byId("idAlmacenNew").setValue("");
			sap.ui.getCore().byId("idGalonesNew").setValue("");
			sap.ui.getCore().byId("idBarrilesNew").setValue("");
			sap.ui.getCore().byId("idTipoMaterialNew").setValue("");
			sap.ui.getCore().byId("idNroTicketNew").setValue("");
			sap.ui.getCore().byId("idRemisionNew").setValue("");
			sap.ui.getCore().byId("idKilosNew").setValue("");
			this.getView().getModel().setProperty("/help", {});
		},
		/**
		 *onGuardar: Método que registra un nuevo precio.
		 */
		onGuardar: async function () {
			oGlobalBusyDialog.open();
			let sIdFechaReservaNew = sap.ui.getCore().byId("idFechaReservaNew").getValue();
			let sIdEmbarcacionNew = sap.ui.getCore().byId("inputId1_R").getValue();
			let sIdMaterialNew = sap.ui.getCore().byId("idMaterialNew").getSelectedKey();
			let sIdCentroNew = sap.ui.getCore().byId("idCentroNew").getValue();
			let sIdAlmacenNew = sap.ui.getCore().byId("idAlmacenNew").getSelectedKey();
			let sIdGalonesNew = sap.ui.getCore().byId("idGalonesNew").getValue();
			let sIdBarrilesNew = sap.ui.getCore().byId("idBarrilesNew").getValue();
			let sIdTipoMaterialNew = sap.ui.getCore().byId("idTipoMaterialNew").getSelectedKey();
			let sIdNroTicketNew = sap.ui.getCore().byId("idNroTicketNew").getValue();
			let sIdRemisionNew = sap.ui.getCore().byId("idRemisionNew").getValue();
			let sIdKilosNew = sap.ui.getCore().byId("idKilosNew").getValue();
			sIdNroTicketNew = this.onZeroFill(idNroTicketNew, 10);
			
			let sMessage = "";
			let bEstado = false;
			if (!sIdEmbarcacionNew) {
				bEstado = true;
				sMessage += "El campo Embarcación no debe estar vacio\n"
			}
			if (!sIdMaterialNew) {
				bEstado = true;
				sMessage += "El campo no debe estar vacio\n";
			}
			if (!sIdAlmacenNew) {
				bEstado = true;
				sMessage += "El campo Embarcación no debe estar vacio\n";
			}
			if (!sIdKilosNew) {
				bEstado = true;
				sMessage += "El campo Total Peso en Kilos no debe estar vacio\n"
			}
			if (!sIdTipoMaterialNew) {
				bEstado = true;
				sMessage += "El campo Tipo Material no debe estar vacío\n"
			}
			if (bEstado) {
				MessageBox.error(sMessage);
				oGlobalBusyDialog.close();
				return false;
			}

			let oBody = {
				"fhrnv": sIdFechaReservaNew,
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
						"atcrn": this.userOperation,
						"atmfn": "",
						"cdalm": sIdAlmacenNew,
						"cdemb": sIdEmbarcacionNew,
						"cdpta": this.planta,
						"cdsum": sIdMaterialNew,
						"cdumd": "",
						"cnbar": sIdBarrilesNew,
						"cnsum": sIdKilosNew,
						"demat": sIdTipoMaterialNew,
						"dsest": "",
						"dswks": "",
						"esrnv": "",
						"fhcrn": "",
						"fhmfn": "",
						"fhrnv": sIdFechaReservaNew,
						"hrcrn": "000000",
						"hrmfn": "000000",
						"lgobe": "",
						"mandt": "",
						"msehl": "",
						"nmemb": "",
						"nrgrm": sIdRemisionNew,
						"nrpos": "0000",
						"nrrnv": "0000000000",
						"nrtga": sIdGalonesNew,
						"nrtkp": sIdNroTicketNew
					}
				]
			};
			let aData = await ServiceImpl.onGuardarService(oBody);
			if (aData && aData.ep_nrrnv != "0000000000") {
				MessageBox.warning(
					aData.et_mensj, {
					icon: MessageBox.Icon.SUCCESS,
					title: "Registro satisfactorio",
					actions: [MessageBox.Action.OK],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction == "OK") {
							this.onCloseNuevoAceite();
						}
					}.bind(this)
				}
				);

			} else {
				MessageBox.error(aData.et_mensj);
			}
			oGlobalBusyDialog.close();

		},

		onLlenarPlanta: async function (centro) {
			oGlobalBusyDialog.open();
			let sPlanta = "";
			let oBody = {
				"delimitador": "|",
				"fields": [
					"CDPTA"
				],
				"no_data": "",
				"option": [

				],
				"options": [
					{
						"cantidad": "10",
						"control": "INPUT",
						"key": "WERKS",
						"valueHigh": "",
						"valueLow": centro
					}
				],
				"order": "",
				"p_user": this.userOperation,
				"rowcount": 0,
				"rowskips": 0,
				"tabla": "ZFLPTA"
			}
			let aData = await ServiceImpl.onLlenarPlantaService(oBody);
			sPlanta = aData.data[0].CDPTA;
			oGlobalBusyDialog.close();
			return sPlanta;
		},
		onSelectEmba: function (evt) {
			let oObjeto = evt.getParameter("rowContext").getObject();
			if (oObjeto) {
				let sCdemb = oObjeto.CDEMB;
				if (this.currentInputEmba.includes("embarcacionLow")) {
					this.byId("embarcacionLow").setValue(sCdemb);
				} else if (this.currentInputEmba.includes("embarcacionHigh")) {
					this.byId("embarcacionHigh").setValue(sCdemb);
				}
				this.onGetDialog().close();
			}
		},

		onSearchEmbarcacion: async function (evt) {
			BusyIndicator.show(0);
			let sIdEmbarcacion = sap.ui.getCore().byId("idEmba").getValue();
			let sIdEmbarcacionDesc = sap.ui.getCore().byId("idNombEmba").getValue();
			let sIdMatricula = sap.ui.getCore().byId("idMatricula").getValue();
			let sIdRuc = sap.ui.getCore().byId("idRucArmador").getValue();
			let sIdArmador = sap.ui.getCore().byId("idDescArmador").getValue();
			let sIdPropiedad = sap.ui.getCore().byId("indicadorPropiedad").getSelectedKey();
			let aOptions = [];
			let aOptions2 = [];
			let aEmbarcaciones = [];
			aOptions.push({
				"cantidad": "20",
				"control": "COMBOBOX",
				"key": "ESEMB",
				"valueHigh": "",
				"valueLow": "O"
			})
			if (sIdEmbarcacion) {
				aOptions.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "CDEMB",
					"valueHigh": "",
					"valueLow": sIdEmbarcacion

				});
			}
			if (sIdEmbarcacionDesc) {
				aOptions.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NMEMB",
					"valueHigh": "",
					"valueLow": sIdEmbarcacionDesc.toUpperCase()

				});
			}
			if (sIdMatricula) {
				aOptions.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "MREMB",
					"valueHigh": "",
					"valueLow": sIdMatricula
				});
			}
			if (sIdPropiedad) {
				aOptions.push({
					"cantidad": "20",
					"control": "COMBOBOX",
					"key": "INPRP",
					"valueHigh": "",
					"valueLow": sIdPropiedad
				});
			}
			if (sIdRuc) {
				aOptions2.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "STCD1",
					"valueHigh": "",
					"valueLow": sIdRuc
				});
			}
			if (sIdArmador) {
				aOptions2.push({
					"cantidad": "20",
					"control": "INPUT",
					"key": "NAME1",
					"valueHigh": "",
					"valueLow": sIdArmador.toUpperCase()
				});
			}

			this.primerOption = sOptions;
			this.segundoOption = sOptions2;

			let oBody = {
				"option": [

				],
				"option2": [

				],
				"options": sOptions,
				"options2": sOptions2,
				"p_user": "BUSQEMB",
				//"p_pag": "1" //por defecto la primera parte
			};
			let aData = await ServiceImpl.onSearchEmbarcacionService(oBody);
			aEmbarcaciones = aData.data;

					this.getModel("consultaMareas").setProperty("/embarcaciones", embarcaciones);
					this.getModel("consultaMareas").refresh();

					if (!isNaN(aData.p_totalpag)) {
						if (Number(aData.p_totalpag) > 0) {
							sap.ui.getCore().byId("goFirstPag").setEnabled(true);
							sap.ui.getCore().byId("goPreviousPag").setEnabled(true);
							sap.ui.getCore().byId("comboPaginacion").setEnabled(true);
							sap.ui.getCore().byId("goLastPag").setEnabled(true);
							sap.ui.getCore().byId("goNextPag").setEnabled(true);
							let tituloTablaEmba = "Página 1/" + Number(aData.p_totalpag);
							this.getModel("consultaMareas").setProperty("/TituloEmba", tituloTablaEmba);
							let iNumPag = Number(aData.p_totalpag) + 1;
							let aPaginas = [];
							for (let index = 1; index < iNumPag; index++) {
								aPaginas.push({
									numero: index
								});
							}
							this.getModel("consultaMareas").setProperty("/NumerosPaginacion", aPaginas);
							sap.ui.getCore().byId("comboPaginacion").setSelectedKey("1");
							this.currentPage = "1";
							this.lastPage = aData.p_totalpag;
						} else {
							let sTituloTablaEmba = "Página 1/1";
							this.getModel("consultaMareas").setProperty("/TituloEmba", sTituloTablaEmba);
							this.getModel("consultaMareas").setProperty("/NumerosPaginacion", []);
							sap.ui.getCore().byId("goFirstPag").setEnabled(false);
							sap.ui.getCore().byId("goPreviousPag").setEnabled(false);
							sap.ui.getCore().byId("comboPaginacion").setEnabled(false);
							sap.ui.getCore().byId("goLastPag").setEnabled(false);
							sap.ui.getCore().byId("goNextPag").setEnabled(false);
							this.currentPage = "1";
							this.lastPage = aData.p_totalpag;
						}
					}

				BusyIndicator.hide();
		},


		onChangePag: function (evt) {
			let sId = evt.getSource().getId();
			let oControl = sap.ui.getCore().byId(sId);
			let sPagina = oControl.getSelectedKey();
			this.currentPage = sPagina;
			this.onNavPage();
		},

		onSetCurrentPage: function (evt) {
			let sId = evt.getSource().getId();
			if (sId == "goFirstPag") {
				this.currentPage = "1";
			} else if (sId == "goPreviousPag") {
				if (!isNaN(this.currentPage)) {
					if (this.currentPage != "1") {
						let iPreviousPage = Number(this.currentPage) - 1;
						this.currentPage = iPreviousPage.toString();
					}
				}
			} else if (sId == "goNextPag") {
				if (!isNaN(this.currentPage)) {
					if (this.currentPage != this.lastPage) {
						let iNextPage = Number(this.currentPage) + 1;
						this.currentPage = iNextPage.toString();
					}
				}
			} else if (sId == "goLastPag") {
				this.currentPage = this.lastPage;
			}
			this.onNavPage();
		},

		onNavPage: async function () {
			BusyIndicator.show(0);
			let aEmbarcaciones = [];
			let oBody = {
				"option": [

				],
				"option2": [

				],
				"options": this.primerOption,
				"options2": this.segundoOption,
				"p_user": "BUSQEMB",
				"p_pag": this.currentPage
			};

			let aData = await ServiceImpl.onListaEmbarcacionService(oBody);
					aEmbarcaciones = aData.data;

					this.getModel("consultaMareas").setProperty("/embarcaciones", aEmbarcaciones);
					this.getModel("consultaMareas").refresh();
					let sTituloTablaEmba = "Página " + this.currentPage + "/" + Number(oData.p_totalpag);
					this.getModel("consultaMareas").setProperty("/TituloEmba", sTituloTablaEmba);
					sap.ui.getCore().byId("comboPaginacion").setSelectedKey(this.currentPage);
					BusyIndicator.hide();
			
		},
		onGetDialog: function () {
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("com.tasa.aceitesusados.view.Embarcacion", this);
				this.getView().addDependent(this.oDialog);
			}
			return this.oDialog;
		},
		onOpenEmba: function (evt) {
			this.currentInputEmba = evt.getSource().getId();
			this.onGetDialog().open();
		},

		onBuscarEmbarca: function (evt) {
			let iIndices = evt.mParameters.listItem.oBindingContexts.consultaMareas.sPath.split("/")[2];
			let sData = this.getView().getModel("consultaMareas").oData.embarcaciones[iIndices].CDEMB;
			let sDetail = this.getView().getModel("consultaMareas").oData.embarcaciones[iIndices].NMEMB;
			if (this.currentInputEmba.includes("idEmbarcacion2")) {
				this.byId("idEmbarcacion2").setValue(sData);
			} else if (this.currentInputEmba.includes("inputId1_R")) {
				sap.ui.getCore().byId("inputId1_R").setValue(sData);
				sap.ui.getCore().byId("txtEmbarcaNew").setText(sDetail);
			}
			this.onCerrarEmba();

		},

		onCerrarEmba: function () {
			this.onClearFilterEmba();
			this.onGetDialog().close();
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
		onClearFilterEmba: function () {
			sap.ui.getCore().byId("idEmba").setValue("");
			sap.ui.getCore().byId("idNombEmba").setValue("");
			sap.ui.getCore().byId("idRucArmador").setValue("");
			sap.ui.getCore().byId("idMatricula").setValue("");
			sap.ui.getCore().byId("indicadorPropiedad").setValue("");
			sap.ui.getCore().byId("idDescArmador").setValue("");
			this.getModel("consultaMareas").setProperty("/embarcaciones", "");
		},
		onSearch: function (oEvent) {
			// add filter for search
			let aFilters = [];
			let sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				let filter = new Filter([
					new Filter("NRRNV", FilterOperator.Contains, sQuery),
					new Filter("NMEMB", FilterOperator.Contains, sQuery),
					new Filter("CDSUM", FilterOperator.Contains, sQuery),
					new Filter("CDALM", FilterOperator.Contains, sQuery),
					new Filter("FHCRN", FilterOperator.Contains, sQuery),
					new Filter("MSEHL", FilterOperator.Contains, sQuery),
					new Filter("ESRNV", FilterOperator.Contains, sQuery),
					new Filter("NRTGA", FilterOperator.Contains, sQuery),
					new Filter("CNSUM", FilterOperator.Contains, sQuery),
					new Filter("DESC_ESRNV", FilterOperator.Contains, sQuery),
					new Filter("CDALMDESC", FilterOperator.Contains, sQuery),



				]);
				aFilters.push(filter);
			}

			// update list binding
			let oList = this.byId("table");
			let oBinding = oList.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},
		onSearchHelp: function (oEvent) {
			let sIdInput = oEvent.getSource().getId(),
				oModel = this.getModel(),
				sNameComponent = "busqembarcaciones",
				sIdComponent = "busqembarcaciones",
				sUrlComponent = this.HOST_HELP + ".AyudasBusqueda.busqembarcaciones-1.0.0",
				oView = this.getView(),
				oInput = sap.ui.getCore().byId(sIdInput);
			oModel.setProperty("/input", oInput);

			if (!this.DialogComponent) {
				this.DialogComponent = new sap.m.Dialog({
					title: "Búsqueda de embarcaciones",
					icon: "sap-icon://search",
					state: "Information",
					endButton: new sap.m.Button({
						icon: "sap-icon://decline",
						text: "Cerrar",
						type: "Reject",
						press: function (oEvent) {
							this.onCloseDialog(oEvent);
						}.bind(this)
					})
				});
				oView.addDependent(this.DialogComponent);
				oModel.setProperty("/idDialogComp", this.DialogComponent.getId());
			}

			let comCreateOk = function (oEvent) {
				BusyIndicator.hide();
			};


			if (this.DialogComponent.getContent().length === 0) {
				BusyIndicator.show(0);
				let oComponent = new sap.ui.core.ComponentContainer({
					id: sIdComponent,
					name: sNameComponent,
					url: sUrlComponent,
					settings: {},
					componentData: {},
					propagateModel: true,
					componentCreated: comCreateOk,
					height: '100%',
					// manifest:true,
					async: false
				});

				this.DialogComponent.addContent(oComponent);
			}

			this.DialogComponent.open();
		},
		onCloseDialog: function (oEvent) {
			oEvent.getSource().getParent().close();
		}

	});
});