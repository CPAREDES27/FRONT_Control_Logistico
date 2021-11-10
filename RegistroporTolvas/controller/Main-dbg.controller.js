sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    //	"./BusquedaDeEmpresas",
    "./utilities",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,
        MessageBox,
        //        BusquedaDeEmpresas, 
        Utilities,
        History,
        JSONModel,
        BusyIndicator,
        Filter,
        FilterOperator,
        exportLibrary,
        Spreadsheet
    ) {
        "use strict";

        var EdmType = exportLibrary.EdmType;

        return BaseController.extend("com.tasa.tolvas.registrotolvas.controller.Main", {

            dataTableKeys: [
				'NRDES',
				'WERKS',
				'TICKE',
				'CDEMB',
				'NMEMB',
				'MREMB',
				'CPPMS',
				'FIDES',
				'HIDES',
				'FFDES',
				'HFDES',
				'CNPDS'
			],



            handleRouteMatched: function (oEvent) {
                var sAppId = "App60f18d59421c8929c54cd9bf";

                var oParams = {};

                if (oEvent.mParameters.data.context) {
                    this.sContext = oEvent.mParameters.data.context;

                } else {
                    if (this.getOwnerComponent().getComponentData()) {
                        var patternConvert = function (oParam) {
                            if (Object.keys(oParam).length !== 0) {
                                for (var prop in oParam) {
                                    if (prop !== "sourcePrototype" && prop.includes("Set")) {
                                        return prop + "(" + oParam[prop][0] + ")";
                                    }
                                }
                            }
                        };

                        this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

                    }
                }

                var oPath;

                if (this.sContext) {
                    oPath = {
                        path: "/" + this.sContext,
                        parameters: oParams
                    };
                    this.getView().bindObject(oPath);
                }

                this.requestListaRegistroTolvas();

            },

            requestListaRegistroTolvas: function () {
                BusyIndicator.show(0);
                let sTableName = "",
                    oView = this.getView(),
                    oModel = this.getOwnerComponent().getModel("FilterModel"),
                    aField = [],
                    aOption = [],
                    sCDPTA = oModel.getProperty("/CentroDescarga"),
                    sFIDES = oModel.getProperty("/FechaInicioDescarga"),
                    sHIDES = oModel.getProperty("/HoraInicioDescarga"),
                    iRowCount = oModel.getProperty("/CantidadFilas"),
                    sOrder = "";

                aField = [];

                if (!Utilities.isEmpty(sCDPTA)) {
                    aOption.push(
                        {
                            "wa": `CDPTA LIKE '${sCDPTA}'`
                        }
                    )
                }
                if (!Utilities.isEmpty(sFIDES)) {
                    aOption.push(
                        {
                            "wa": `FIDES LIKE '${sFIDES}'`
                        }
                    )
                }
                if (!Utilities.isEmpty(sHIDES)) {
                    aOption.push(
                        {
                            "wa": `HIDES LIKE '${sHIDES}'`
                        }
                    )
                }


                //oView.getModel("FormSearchModel").setProperty("/busyIndicatorTableDescargaTolvas", true);
                Utilities.getDataFromRegistroTolvas(aOption, aField, iRowCount.toString())
                    .then(data => {
                        console.log("Data: ", data);
                        let oResp1 = data;

                        let aWERKS = [];
                        let aCDPTA = [];
                        // let iIndex = 0;
                        oResp1.forEach(element => {
                            if (aCDPTA.findIndex((elem) => elem === element.CDPTA) === -1) {
                                aCDPTA.push(element.CDPTA);
                            }
                        });
                        // console.log(aCDPTA);
                        sTableName = "ZFLPTA";
                        aField = ["WERKS"];
                        // aOption = [],
                        let aAjax = []
                        aCDPTA.forEach(element => {
                            // aOption = [
                            //     {
                            //         "wa": `CDPTA LIKE '${element}'`
                            //     }
                            // ];
                            aOption = [
                                {
                                    "control": "INPUT",
                                    "key": "CDPTA",
                                    "valueLow": element,
                                    "valueHigh": "",
                                    "Longitud": "10"
                                }
                            ];

                            aAjax.push(Utilities.getDataFromReadTable(sTableName, aOption, aField, sOrder, iRowCount)
                                .then(data => {
                                    // let oResp2 = data;
                                    aWERKS.push(data[0].WERKS);
                                    // console.log(oResp2);
                                }));
                        });
                        let sIndexFound = 0;
                        $.when.apply(undefined, aAjax).then(resp => {
                            // oResp1.forEach((element, index) => {
                            //     if(element.NRMAR === 0){
                            //         oResp1.splice(index, 1);
                            //     } else {
                            //         sIndexFound = aCDPTA.findIndex((elem) => elem === element.CDPTA);
                            //         if (sIndexFound !== -1){
                            //             element.WERKS = aWERKS[sIndexFound];
                            //         }
                            //     }
                            // });

                            let element = null;
                            for (let index = 0; index < oResp1.length; index++) {
                                element = oResp1[index];
                                if (element.NRMAR > 0) {
                                    oResp1.splice(index, 1);
                                    index--;
                                } else {
                                    sIndexFound = aCDPTA.findIndex((elem) => elem === element.CDPTA);
                                    if (sIndexFound !== -1) {
                                        element.WERKS = aWERKS[sIndexFound];
                                    }
                                }
                            }
                            oView.setModel(new JSONModel(oResp1), "RegistroTolvasModel");
                            //oView.getModel("FormSearchModel").setProperty("/busyIndicatorTableDescargaTolvas", false);
                        });
                        BusyIndicator.hide();
                    });
            },

            _onInputValueHelpRequest: function (oEvent) {

                var sDialogName = "BusquedaDeEmpresas";
                this.mDialogs = this.mDialogs || {};
                var oDialog = this.mDialogs[sDialogName];
                if (!oDialog) {
                    oDialog = new BusquedaDeEmpresas(this.getView());
                    this.mDialogs[sDialogName] = oDialog;

                    // For navigation.
                    oDialog.setRouter(this.oRouter);
                }

                var context = oEvent.getSource().getBindingContext();
                oDialog._oControl.setBindingContext(context);

                oDialog.open();

            },
            _onButtonPress: function (oEvent) {

                var oBindingContext = oEvent.getSource().getBindingContext();

                return new Promise(function (fnResolve) {

                    this.doNavigate("EdicionRegistroTolva", oBindingContext, fnResolve, "");
                }.bind(this)).catch(function (err) {
                    if (err !== undefined) {
                        MessageBox.error(err.message);
                    }
                });

            },

            _onButtonPress1: function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext("RegistroTolvasModel");
                return new Promise(function (fnResolve) {
                    this.doNavigate("EdicionRegistroTolva", oBindingContext, fnResolve, "");
                }.bind(this)).catch(function (err) {
                    if (err !== undefined) {
                        MessageBox.error(err.message);
                    }
                });
            },

            doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
                var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
                var oModel = (oBindingContext) ? oBindingContext.getModel() : null;
                this.getOwnerComponent().getModel("passModel").setProperty("/data", oModel.getProperty(sPath));

                this.oRouter.navTo(sRouteName);
                if (typeof fnPromiseResolve === "function") {
                    fnPromiseResolve();
                }
            },
            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getTarget("TargetMain").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
                var oView = this.getView();
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        if (sap.ui.Device.system.phone) {
                            var oPage = oView.getContent()[0];
                            if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
                                oPage.setShowNavButton(true);
                                oPage.attachNavButtonPress(function () {
                                    this.oRouter.navTo("", {}, true);
                                }.bind(this));
                            }
                        }
                    }.bind(this)
                });
                // this.requestListaRegistroTolvas();

                this.cargarInitData();


                /*let oModel = new JSONModel(sap.ui.require.toUrl("com/tasa/tolvas/registrotolvas/mock/formFiltrosRegistro.json"));
                oModel.setDefaultBindingMode("two-way");
                this.getView().setModel(oModel, "FormSearchModel");*/
            },

            cargarInitData: function () {
                //cargar centros
                var usuario = this.getCurrentUser();
                var oView = this.getView();
                var oModel = this.getOwnerComponent().getModel("CombosModel");
                Utilities.obtenerCentros(usuario)
                    .then(data => {
                        console.log("Centros: ", data);
                        oModel.setProperty("/Centros", data);
                    });

                //cargar indicador de propiedad
                var dominios = ["ZINPRP"];
                Utilities.getDataFromDominios(dominios)
                    .then(data => {
                        console.log("IndProp: ", data);
                        oModel.setProperty("/IndProp", data[0].data);
                    });
            },

            filterGlobally: function (oEvent) {
				let sQuery = oEvent.getSource().getValue();
				const table = this.byId('tableData');
				const tableItemsBinding = table.getBinding('rows');
				const dataTable = tableItemsBinding.oList;
				let filters = [];

				this.dataTableKeys.forEach(k => {
					const typeValue = typeof dataTable[0][k];
					let vOperator = null;

					switch (typeValue) {
						case 'string':
							vOperator = FilterOperator.Contains;
							break;
						case 'number':
							vOperator = FilterOperator.EQ;
							break;
					}

					const filter = new Filter(k, vOperator, sQuery);
					filters.push(filter);
				});

				const oFilters = new Filter({
					filters: filters
				});

				/**
				 * Actualizar tabla
				 */
				tableItemsBinding.filter(oFilters, "Application");
			},

            createColumnConfig: function () {
				var aCols = [];
				const title = [];
				const table = this.byId('tableData');
				let tableColumns = table.getColumns();
				const dataTable = table.getBinding('rows').oList;

				/**
				 * Obtener solo las opciones que se exportarán
				 */
				for (let i = 0; i < tableColumns.length; i++) {
					let header = tableColumns[i].getAggregation('template');
					if (header) {
						let headerColId = header.getId();
						let headerCol = sap.ui.getCore().byId(headerColId);
						let headerColValue = headerCol.getText();

						title.push(headerColValue);
					}

				}
				title.splice(title.length - 2, 1);
				title.pop();

				/**
				 * Combinar los títulos y los campos de la cabecera
				 */
				const properties = title.map((t, i) => {
					return {
						column: t,
						key: this.dataTableKeys[i]
					}
				});

				properties.forEach(p => {
					const typeValue = typeof dataTable[0][p.key];
					let propCol = {
						label: p.column,
						property: p.key
					};

					switch (typeValue) {
						case 'number':
							propCol.type = EdmType.Number;
							propCol.scale = 0;
							break;
						case 'string':
							propCol.type = EdmType.String;
							propCol.wrap = true;
							break;
					}

					aCols.push(propCol);
				});

				return aCols;
			},

            exportarExcel: function (event) {
				var aCols, oRowBinding, oSettings, oSheet, oTable;

				if (!this._oTable) {
					this._oTable = this.byId('tableData');
				}

				oTable = this._oTable;
				oRowBinding = oTable.getBinding('rows');
				aCols = this.createColumnConfig();

				oSettings = {
					workbook: { 
						columns: aCols,
						context: {
							sheetName: "CONSULTA DE DESCARGAS"
						} 
					},
					dataSource: oRowBinding,
					fileName: 'Consulta de pesca descargada.xlsx',
					worker: false // We need to disable worker because we are using a Mockserver as OData Service
				};

				oSheet = new Spreadsheet(oSettings);
				oSheet.build().finally(function () {
					oSheet.destroy();
				});
			}, 

            getCurrentUser: function(){
                return "FGARCIA";
            }

        });
    }, /* bExport= */ true);
