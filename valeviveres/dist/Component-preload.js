//@ui5-bundle com/tasa/valeviveres/Component-preload.js
jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"com/tasa/valeviveres/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","./model/models","./controller/ErrorHandler"],function(t,e,s,i){"use strict";return t.extend("com.tasa.valeviveres.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this._oErrorHandler=new i(this);this.setModel(s.createDeviceModel(),"device");this.getRouter().initialize()},destroy:function(){this._oErrorHandler.destroy();t.prototype.destroy.apply(this,arguments)},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!e.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});
},
	"com/tasa/valeviveres/controller/App.controller.js":function(){sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel"],function(e,t){"use strict";return e.extend("com.tasa.valeviveres.controller.App",{onInit:function(){var e,a,o=this.getView().getBusyIndicatorDelay();e=new t({busy:true,delay:0});this.setModel(e,"appView");a=function(){e.setProperty("/busy",false);e.setProperty("/delay",o)};this.getOwnerComponent().getModel().dataLoaded().then(a);this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());let s=this.getModel();s.setProperty("/data",[{vale:"0000029904",emb:"TASA 12 JC",armd:"TECNOLOGICA DE ALIMENTOS S.A",almc:"CALLAO",estado:"Válido"},{vale:"0000029905",emb:"TASA 12 JC",armd:"CHIMBOTE NORTE",almc:"CALLAO",estado:"Válido"},{vale:"0000029906",emb:"TASA 43 JC1",armd:"TECNOLOGICA DE ALIMENTOS S.A",almc:"CALLAO",estado:"Válido"}])}})});
},
	"com/tasa/valeviveres/controller/BaseController.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/m/library"],function(e,t,r){"use strict";var o=r.URLHelper;return e.extend("com.tasa.valeviveres.controller.BaseController",{getRouter:function(){return t.getRouterFor(this)},getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},onShareEmailPress:function(){var e=this.getModel("objectView")||this.getModel("worklistView");o.triggerEmail(null,e.getProperty("/shareSendEmailSubject"),e.getProperty("/shareSendEmailMessage"))}})});
},
	"com/tasa/valeviveres/controller/ErrorHandler.js":function(){sap.ui.define(["sap/ui/base/Object","sap/m/MessageBox"],function(e,s){"use strict";return e.extend("com.tasa.valeviveres.controller.ErrorHandler",{constructor:function(e){this._oResourceBundle=e.getModel("i18n").getResourceBundle();this._oComponent=e;this._oModel=e.getModel();this._bMessageOpen=false;this._sErrorText=this._oResourceBundle.getText("errorText");this._oModel.attachRequestFailed(function(e){var s=e.getParameters();if(s.response.statusCode!=="404"||s.response.statusCode===404&&s.response.responseText.indexOf("Cannot POST")===0){this._showServiceError(s.response)}},this)},_showServiceError:function(e){if(this._bMessageOpen){return}this._bMessageOpen=true;s.error(this._sErrorText,{id:"serviceErrorMessageBox",details:e,styleClass:this._oComponent.getContentDensityClass(),actions:[s.Action.CLOSE],onClose:function(){this._bMessageOpen=false}.bind(this)})}})});
},
	"com/tasa/valeviveres/controller/NotFound.controller.js":function(){sap.ui.define(["./BaseController"],function(e){"use strict";return e.extend("com.tasa.valeviveres.controller.NotFound",{onLinkPressed:function(){this.getRouter().navTo("worklist")}})});
},
	"com/tasa/valeviveres/controller/Object.controller.js":function(){sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","../model/formatter"],function(e,t,n,i){"use strict";return e.extend("com.tasa.valeviveres.controller.Object",{formatter:i,onInit:function(){var e,n=new t({busy:true,delay:0});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);e=this.getView().getBusyIndicatorDelay();this.setModel(n,"objectView");this.getOwnerComponent().getModel().dataLoaded().then(function(){n.setProperty("/delay",e)})},onNavBack:function(){var e=n.getInstance().getPreviousHash();if(e!==undefined){history.go(-1)}else{this.getRouter().navTo("worklist",{},true)}},_onObjectMatched:function(e){var t=e.getParameter("arguments").objectId;this.getModel().dataLoaded().then(function(){this._bindView("/"+t)}.bind(this))},_bindView:function(e){var t=this.getModel("objectView"),n=this.getModel();this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){n.dataLoaded().then(function(){t.setProperty("/busy",true)})},dataReceived:function(){t.setProperty("/busy",false)}}})},_onBindingChange:function(){var e=this.getView(),t=this.getModel("objectView"),n=e.getElementBinding();if(!n.getBoundContext()){this.getRouter().getTargets().display("objectNotFound");return}t.setProperty("/busy",false)}})});
},
	"com/tasa/valeviveres/controller/Worklist.controller.js":function(){sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","../model/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment"],function(e,t,i,a,o,n){"use strict";return e.extend("com.tasa.valeviveres.controller.Worklist",{formatter:i,onInit:function(){var e,i,a=this.byId("table");i=a.getBusyIndicatorDelay();this._aTableSearchState=[];e=new t({worklistTableTitle:this.getResourceBundle().getText("worklistTableTitle"),tableNoDataText:this.getResourceBundle().getText("tableNoDataText"),tableBusyDelay:0});this.setModel(e,"worklistView");a.attachEventOnce("updateFinished",function(){e.setProperty("/tableBusyDelay",i)})},onUpdateFinished:function(e){var t,i=e.getSource(),a=e.getParameter("total");if(a&&i.getBinding("items").isLengthFinal()){t=this.getResourceBundle().getText("worklistTableTitleCount",[a])}else{t=this.getResourceBundle().getText("worklistTableTitle")}this.getModel("worklistView").setProperty("/worklistTableTitle",t)},onPress:function(e){this._showObject(e.getSource())},onNavBack:function(){history.go(-1)},onSearch:function(e){if(e.getParameters().refreshButtonPressed){this.onRefresh()}else{var t=[];var i=e.getParameter("query");if(i&&i.length>0){t=[new a("CategoryName",o.Contains,i)]}this._applySearch(t)}},onRefresh:function(){var e=this.byId("table");e.getBinding("items").refresh()},_showObject:function(e){let t=e.getBindingContext().getPath();if(!this.oDetailVale){this.oDetailVale=n.load({name:"com.tasa.valeviveres.fragments.DetailVale",controller:this}).then(e=>{this.getView().addDependent(e);return e})}this.oDetailVale.then(e=>{e.bindElement(t);e.open()})},_applySearch:function(e){var t=this.byId("table"),i=this.getModel("worklistView");t.getBinding("items").filter(e,"Application");if(e.length!==0){i.setProperty("/tableNoDataText",this.getResourceBundle().getText("worklistNoDataWithSearchText"))}},onClose:function(e){let t=e.getSource().getParent();t.close()}})});
},
	"com/tasa/valeviveres/fragments/DetailVale.fragment.xml":'<core:FragmentDefinition\r\n\txmlns="sap.m"\r\n    xmlns:form="sap.ui.layout.form"\r\n\txmlns:core="sap.ui.core"><Dialog\r\n        contentHeight="100%"\r\n        contentWidth="85%"\r\n        showHeader="false"><subHeader><OverflowToolbar><ObjectStatus\r\n                    state="Information"\r\n                    text="{vale}"\r\n                    title="Vale Nro. "\r\n                /></OverflowToolbar></subHeader><content><IconTabBar\r\n                selectedKey="01"><items><IconTabFilter\r\n                        icon="sap-icon://form"\r\n                        key="01"><content><form:Form editable="true"><form:formContainers><form:FormContainer><form:formElements><form:FormElement><form:label><Label text="Temporada"/></form:label><form:fields><Input value="{DSTPO}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Fecha de creación"/></form:label><form:fields><Input value="{FCVVI}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Estado de registro" /></form:label><form:fields><Input value="{DESC_ESVVI}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Planta" /></form:label><form:fields><Input \r\n                                                        value="{CDPTA}" \r\n                                                        editable="false" \r\n                                                        description="{DESCR}"\r\n                                                        tooltip="{DESCR}" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Centro" /></form:label><form:fields><Input \r\n                                                        value="{WERKS}" \r\n                                                        description="{NAME3}" \r\n                                                        editable="false"\r\n                                                        tooltip="{NAME3}" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Almacén" /></form:label><form:fields><Input \r\n                                                        value="{CDALM}" \r\n                                                        description="{DSALM}" \r\n                                                        editable="false" \r\n                                                        tooltip="{DSALM}"/></form:fields></form:FormElement><form:FormElement><form:label><Label text="Almacén externo" /></form:label><form:fields><Input value="{LGORT}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Embarcación" /></form:label><form:fields><Input \r\n                                                        value="{CDEMB}" \r\n                                                        editable="false" \r\n                                                        description="{NMEMB}"\r\n                                                        tooltip="{NMEMB}"/></form:fields></form:FormElement><form:FormElement><form:label><Label text="Matrícula" /></form:label><form:fields><Input value="{MREMB}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Indicador de propiedad" /></form:label><form:fields><Input value="{DESC_INPRP}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Armador comercial" /></form:label><form:fields><Input value="{ARCMC}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="RUC armador comerc." /></form:label><form:fields><Input value="{STCD1}" editable="false" /></form:fields></form:FormElement></form:formElements></form:FormContainer><form:FormContainer><form:formElements><form:FormElement><form:label><Label text="Inicio de travesía" /></form:label><form:fields><Input value="{FITVS}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Fin de travesía" /></form:label><form:fields><Input value="{FFTVS}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Duración de travesía" /></form:label><form:fields><Input value="{DRTVS}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Nro tripulantes" /></form:label><form:fields><Input value="{NRTRI}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Cocinero" /></form:label><form:fields><Input \r\n                                                        value="{DATOSMAESTRO>PERNR}" \r\n                                                        description="{DATOSMAESTRO>NMPER}"\r\n                                                        tooltip="{DATOSMAESTRO>NMPER}" \r\n                                                        editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Proveedor" /></form:label><form:fields><Input \r\n                                                        value="{DATOSMAESTRO>CDPVE}" \r\n                                                        description="{DATOSMAESTRO>NAME2}" \r\n                                                        editable="false"\r\n                                                        tooltip="{DATOSMAESTRO>NAME2}"  /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Nro. orden de compra" /></form:label><form:fields><Input value="{DATOSMAESTRO>EBELN}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Observaciones" /></form:label><form:fields><TextArea value="{DATOSMAESTRO>OBVVI}" rows="3" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Importe de víveres incluido IGV S/." /></form:label><form:fields><Input value="{DATOSMAESTRO>QTSUM}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="RUC proveedor" /></form:label><form:fields><Input value="{DATOSMAESTRO>RUCCP}" editable="false" /></form:fields></form:FormElement><form:FormElement><form:label><Label text="Nro. documento" /></form:label><form:fields><Input value="{DATOSMAESTRO>BELNR}" editable="false" /></form:fields></form:FormElement></form:formElements></form:FormContainer></form:formContainers><form:layout><form:ResponsiveGridLayout\r\n                                        adjustLabelSpan="true"\r\n                                        breakpointL="1024"\r\n                                        breakpointM="600"\r\n                                        breakpointXL="1440"\r\n                                        columnsL="2"\r\n                                        columnsM="2"\r\n                                        columnsXL="-1"\r\n                                        emptySpanL="0"\r\n                                        emptySpanM="0"\r\n                                        emptySpanS="0"\r\n                                        emptySpanXL="-1"\r\n                                        labelSpanL="4"\r\n                                        labelSpanM="3"\r\n                                        labelSpanS="12"\r\n                                        labelSpanXL="-1"\r\n                                        singleContainerFullSize="true"/></form:layout></form:Form></content></IconTabFilter><IconTabFilter\r\n                        icon="sap-icon://table-view"\r\n                        key="02"><content><Table\r\n                                items="{/detailVale}"><columns><Column width="6rem"><Label text="Posición" /></Column><Column demandPopin="true" minScreenWidth="Tablet" ><Label text="Fecha" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Suministro" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Ración" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Fecha" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Unidad de medida" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Costo unitario" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Costo total" /></Column><Column demandPopin="true" minScreenWidth="Tablet"><Label text="Observaciones" /></Column></columns><items><ColumnListItem ><cells><Text text="{NRPOS}"/><Text text="{FECHA}"/><Text text="{DSSUM}"/><Text text="{CNRAC}"/><Text text="{DSUMD}"/><Text text="{CUSUM}"/><Text text="{QTSUM}"/><Text text="{OBPVA}"/></cells></ColumnListItem></items></Table></content></IconTabFilter></items></IconTabBar></content><beginButton><Button text="Imprimir" icon="sap-icon://print" type="Emphasized" press="onPrintVale" /></beginButton><endButton><Button text="Cerrar" icon="sap-icon://decline" type="Reject" press="onClose"/></endButton></Dialog></core:FragmentDefinition>',
	"com/tasa/valeviveres/i18n/i18n.properties":'# This is the resource bundle for Vale de V\\u00edveres\r\n\r\n#XTIT: Application name\r\nappTitle=Vale de V\\u00edveres\r\n\r\n#YDES: Application description\r\nappDescription=App de control log\\u00edstico\r\n\r\n#~~~ Worklist View ~~~~~~~~~~~~~~~~~~~~~~~~~~\r\n#XTIT: Worklist view title\r\nworklistViewTitle=Manage <CategoriesPlural>\r\n\r\n#XTIT: Worklist page title\r\nworklistTitle=Vale de V\\u00edveres\r\n\r\n#XTIT: Table view title\r\nworklistTableTitle=<CategoriesPlural>\r\n\r\n#XTOL: Tooltip for the search field\r\nworklistSearchTooltip=Enter an <Categories> name or a part of it.\r\n\r\n#XBLI: text for a table with no data with filter or search\r\nworklistNoDataWithSearchText=No matching <CategoriesPlural> found\r\n\r\n#XTIT: Table view title with placeholder for the number of items\r\nworklistTableTitleCount=Lista de Vales ({0})\r\n\r\n#XTIT: The title of the column containing the CategoryName of Categories\r\ntableNameColumnTitle=<CategoryName>\r\n\r\n#XTIT: The title of the column containing the  and the unit of measure\r\ntableUnitNumberColumnTitle=<>\r\n\r\n#XBLI: text for a table with no data\r\ntableNoDataText=No <CategoriesPlural> are currently available\r\n\r\n#XLNK: text for link in \'not found\' pages\r\nbackToWorklist=Show Vale de V\\u00edveres\r\n\r\n#~~~ Object View ~~~~~~~~~~~~~~~~~~~~~~~~~~\r\n#XTIT: Object view title\r\nobjectViewTitle=<Categories> Details\r\n\r\n#XTIT: Object page title\r\nobjectTitle=<Categories>\r\n\r\n\r\n#XTIT: Label for the CategoryName\r\nCategoryNameLabel=CategoryName\r\n\r\n#XTIT: Label for the \r\nLabel=\r\n\r\n\r\n#~~~ Share Menu Options ~~~~~~~~~~~~~~~~~~~~~~~\r\n\r\n#XTIT: Send E-Mail subject\r\nshareSendEmailWorklistSubject=<Email subject PLEASE REPLACE ACCORDING TO YOUR USE CASE>\r\n\r\n#YMSG: Send E-Mail message\r\nshareSendEmailWorklistMessage=<Email body PLEASE REPLACE ACCORDING TO YOUR USE CASE>\\r\\n{0}\r\n\r\n#XTIT: Send E-Mail subject\r\nshareSendEmailObjectSubject=<Email subject including object identifier PLEASE REPLACE ACCORDING TO YOUR USE CASE> {0}\r\n\r\n#YMSG: Send E-Mail message\r\nshareSendEmailObjectMessage=<Email body PLEASE REPLACE ACCORDING TO YOUR USE CASE> {0} (id: {1})\\r\\n{2}\r\n\r\n\r\n#~~~ Not Found View ~~~~~~~~~~~~~~~~~~~~~~~\r\n\r\n#XTIT: Not found view title\r\nnotFoundTitle=Not Found\r\n\r\n#YMSG: The Categories not found text is displayed when there is no Categories with this id\r\nnoObjectFoundText=This <Categories> is not available\r\n\r\n#YMSG: The Categories not available text is displayed when there is no data when starting the app\r\nnoObjectsAvailableText=No <CategoriesPlural> are currently available\r\n\r\n#YMSG: The not found text is displayed when there was an error loading the resource (404 error)\r\nnotFoundText=The requested resource was not found\r\n\r\n#~~~ Error Handling ~~~~~~~~~~~~~~~~~~~~~~~\r\n\r\n#YMSG: Error dialog description\r\nerrorText=Sorry, a technical error occurred! Please try again later.\r\nflpTitle=Vale de V\\u00edveres\r\nflpSubtitle=',
	"com/tasa/valeviveres/manifest.json":'{"_version":"1.32.0","sap.app":{"id":"com.tasa.valeviveres","type":"application","i18n":"i18n/i18n.properties","title":"{{appTitle}}","description":"{{appDescription}}","applicationVersion":{"version":"1.0.0"},"resources":"resources.json","dataSources":{"mainService":{"uri":"V2/Northwind/Northwind.svc/","type":"OData","settings":{"odataVersion":"2.0","localUri":"localService/metadata.xml"}}},"crossNavigation":{"inbounds":{"com-tasa-valeviveres-inbound":{"signature":{"parameters":{},"additionalParameters":"allowed"},"semanticObject":"ValeViveres","action":"Display","title":"{{flpTitle}}","subTitle":"{{flpSubtitle}}","icon":""}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"sap-icon://task","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"rootView":{"viewName":"com.tasa.valeviveres.view.App","type":"XML","async":true,"id":"app"},"dependencies":{"minUI5Version":"1.96.0","libs":{"sap.ui.core":{},"sap.m":{},"sap.f":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"com.tasa.valeviveres.i18n.i18n"}},"":{"type":"sap.ui.model.json.JSONModel","preload":true}},"routing":{"config":{"routerClass":"sap.m.routing.Router","viewType":"XML","viewPath":"com.tasa.valeviveres.view","controlId":"app","controlAggregation":"pages","bypassed":{"target":["notFound"]},"async":true},"routes":[{"pattern":"","name":"worklist","target":["worklist"]},{"pattern":"Vale/{objectId}","name":"object","target":["object"]}],"targets":{"worklist":{"viewName":"Worklist","viewId":"worklist","viewLevel":1,"title":"{i18n>worklistViewTitle}"},"object":{"viewName":"Object","viewId":"object","viewLevel":2,"title":"{i18n>objectViewTitle}"},"objectNotFound":{"viewName":"ObjectNotFound","viewId":"objectNotFound"},"notFound":{"viewName":"NotFound","viewId":"notFound"}}}},"sap.cloud":{"public":true,"service":"ControlLogistico"}}',
	"com/tasa/valeviveres/model/formatter.js":function(){sap.ui.define([],function(){"use strict";return{numberUnit:function(n){if(!n){return""}return parseFloat(n).toFixed(2)}}});
},
	"com/tasa/valeviveres/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"com/tasa/valeviveres/view/App.view.xml":'<mvc:View\n\tcontrollerName="com.tasa.valeviveres.controller.App"\n\tdisplayBlock="true"\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"><Shell><App\n\t\tid="app"\n\t\tbusy="{appView>/busy}"\n\t\tbusyIndicatorDelay="{appView>/delay}"/></Shell></mvc:View>',
	"com/tasa/valeviveres/view/NotFound.view.xml":'<mvc:View\n\tcontrollerName="com.tasa.valeviveres.controller.NotFound"\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"><MessagePage\n\t\ttitle="{i18n>notFoundTitle}"\n\t\ttext="{i18n>notFoundText}"\n\t\ticon="sap-icon://document"\n\t\tid="page"\n\t\tdescription=""><customDescription><Link id="link" text="{i18n>backToWorklist}" press=".onLinkPressed"/></customDescription></MessagePage></mvc:View>',
	"com/tasa/valeviveres/view/Object.view.xml":'<mvc:View\n\tcontrollerName="com.tasa.valeviveres.controller.Object"\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns:semantic="sap.f.semantic"><semantic:SemanticPage\n\t\tid="page"\n\t\theaderPinnable="false"\n\t\ttoggleHeaderOnTitleClick="false"\n\t\tbusy="{objectView>/busy}"\n\t\tbusyIndicatorDelay="{objectView>/delay}"><semantic:titleHeading><Title\n\t\t\t\ttext="{CategoryName}"\n\t\t\t\tlevel="H2"/></semantic:titleHeading><semantic:headerContent><ObjectNumber\n\t\t\t/></semantic:headerContent><semantic:sendEmailAction><semantic:SendEmailAction id="shareEmail" press=".onShareEmailPress"/></semantic:sendEmailAction></semantic:SemanticPage></mvc:View>',
	"com/tasa/valeviveres/view/ObjectNotFound.view.xml":'<mvc:View\n\tcontrollerName="com.tasa.valeviveres.controller.NotFound"\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"><MessagePage\n\t\ttitle="{i18n>objectTitle}"\n\t\ttext="{i18n>noObjectFoundText}"\n\t\ticon="sap-icon://product"\n\t\tdescription=""\n\t\tid="page"><customDescription><Link id="link" text="{i18n>backToWorklist}" press=".onLinkPressed" /></customDescription></MessagePage></mvc:View>',
	"com/tasa/valeviveres/view/Worklist.view.xml":'<mvc:View xmlns:core="sap.ui.core"\n\tcontrollerName="com.tasa.valeviveres.controller.Worklist"\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns:form="sap.ui.layout.form"\n\txmlns:semantic="sap.f.semantic"><semantic:SemanticPage\n\t\tid="page"><semantic:titleHeading><Title\n\t\t\t\ttext="{i18n>worklistTitle}"\n\t\t\t\tlevel="H2"/></semantic:titleHeading><semantic:headerContent><form:Form \n\t\t\t\ttitle="Datos de selección"\n\t\t\t\teditable="true"><form:formContainers><form:FormContainer><form:formElements><form:FormElement label="Vale"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese vale desde"/><Input\n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese vale hasta" /></form:fields></form:FormElement><form:FormElement label="Fecha"><form:fields><DateRangeSelection /></form:fields></form:FormElement><form:FormElement label="Armador comercial"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese Armador comercial"\n\t\t\t\t\t\t\t\t\t\tshowValueHelp="true"/><Input /></form:fields></form:FormElement><form:FormElement label="Embarcación"><form:fields><Input\n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese Embarcación"\n\t\t\t\t\t\t\t\t\t\tshowValueHelp="true" /></form:fields></form:FormElement><form:FormElement label="Planta"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese Planta"/></form:fields></form:FormElement><form:FormElement label="Centro"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\teditable="false"/></form:fields></form:FormElement></form:formElements></form:FormContainer></form:formContainers><form:formContainers><form:FormContainer><form:formElements><form:FormElement label="Alamcén"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese Alamcén"\n\t\t\t\t\t\t\t\t\t\tshowValueHelp="true"/></form:fields></form:FormElement><form:FormElement label="Alamcén externo"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tvalue="{}"\n\t\t\t\t\t\t\t\t\t\teditable="false"/></form:fields></form:FormElement><form:FormElement label="Temporada"><form:fields><Select items="{}"><core:Item key="{}" text="{}"/></Select></form:fields></form:FormElement><form:FormElement label="Indicador de propiedad"><form:fields><Select items="{}"><core:Item key="{}" text="{}"/></Select></form:fields></form:FormElement><form:FormElement label="Cantidad de aciertos"><form:fields><Input \n\t\t\t\t\t\t\t\t\t\tvalue="200"\n\t\t\t\t\t\t\t\t\t\tplaceholder="Ingrese Cantidad de aciertos"/></form:fields></form:FormElement><form:FormElement label=""><form:fields><Button text="Buscar" icon="sap-icon://search" press="" type="Emphasized" /><Button text="Limpiar" icon="sap-icon://clear-filter" press="" type="Ghost" /></form:fields></form:FormElement></form:formElements></form:FormContainer></form:formContainers><form:layout><form:ResponsiveGridLayout\n\t\t\t\t\t\tadjustLabelSpan="true"\n\t\t\t\t\t\tbreakpointL="1024"\n\t\t\t\t\t\tbreakpointM="600"\n\t\t\t\t\t\tbreakpointXL="1440"\n\t\t\t\t\t\tcolumnsL="2"\n\t\t\t\t\t\tcolumnsM="1"\n\t\t\t\t\t\tcolumnsXL="-1"\n\t\t\t\t\t\temptySpanL="0"\n\t\t\t\t\t\temptySpanM="0"\n\t\t\t\t\t\temptySpanS="0"\n\t\t\t\t\t\temptySpanXL="-1"\n\t\t\t\t\t\tlabelSpanL="4"\n\t\t\t\t\t\tlabelSpanM="2"\n\t\t\t\t\t\tlabelSpanS="12"\n\t\t\t\t\t\tlabelSpanXL="-1"\n\t\t\t\t\t\tsingleContainerFullSize="true"/></form:layout></form:Form></semantic:headerContent><semantic:content><Table\n\t\t\t\tid="table"\n\t\t\t\twidth="auto"\n\t\t\t\tmode="SingleSelectLeft"\n\t\t\t\titems="{\n\t\t\t\t\tpath: \'/data\',\n\t\t\t\t\tsorter: {\n\t\t\t\t\t\tpath: \'vale\',\n\t\t\t\t\t\tdescending: false\n\t\t\t\t\t}\n\t\t\t\t}"\n\t\t\t\tnoDataText="{worklistView>/tableNoDataText}"\n\t\t\t\tbusyIndicatorDelay="{worklistView>/tableBusyDelay}"\n\t\t\t\tgrowing="true"\n\t\t\t\tgrowingScrollToLoad="true"\n\t\t\t\tupdateFinished=".onUpdateFinished"><headerToolbar><OverflowToolbar><Title\n\t\t\t\t\t\t\tid="tableHeader"\n\t\t\t\t\t\t\ttext="{worklistView>/worklistTableTitle}"\n\t\t\t\t\t\t\tlevel="H3"/><ToolbarSpacer /><Button text="Imprimir" icon="sap-icon://print" type="Ghost" press="onPrintVale" /><Button text="Anular" icon="sap-icon://decline" type="Reject" press="onAnularVale" /><Button text="Exportar" icon="sap-icon://excel-attachment" type="Ghost" press="onExportTable" /><Button text="Nuevo" icon="sap-icon://add" type="Emphasized" press="onNewVale" /><SearchField\n\t\t\t\t\t\t\tid="searchField"\n\t\t\t\t\t\t\ttooltip="{i18n>worklistSearchTooltip}"\n\t\t\t\t\t\t\tliveChange=".onSearch"><layoutData><OverflowToolbarLayoutData\n\t\t\t\t\t\t\t\t\tmaxWidth="200px"\n\t\t\t\t\t\t\t\t\tpriority="NeverOverflow"/></layoutData></SearchField></OverflowToolbar></headerToolbar><columns><Column><Text text="Vale"/></Column><Column ><Text text="Embarcación"/></Column><Column><Text text="Armador"/></Column><Column ><Text text="Almacén"/></Column><Column><Text text="Ind. propiedad"/></Column><Column ><Text text="Temporada"/></Column><Column><Text text="Fecha"/></Column><Column ><Text text="Estado"/></Column><Column><Text text="Orden extracción"/></Column><Column ><Text text="Planta"/></Column><Column ><Text text="Centro costo"/></Column><Column hAlign="Center"><Text text="Ver detalle"/></Column></columns><items><ColumnListItem\n\t\t\t\t\t\tpress=".onPress"><cells><ObjectStatus\n\t\t\t\t\t\t\t\ttext="{vale}"\n\t\t\t\t\t\t\t\tstate="Information" /><Text text="{emb}"/><Text text="{armd}"/><Text text="{almc}"/><Text text="{}"/><Text text="{}"/><Text text="{}"/><ObjectStatus\n\t\t\t\t\t\t\t\ttext="{estado}"\n\t\t\t\t\t\t\t\ticon="sap-icon://validate"\n\t\t\t\t\t\t\t\tstate="Success"/><Text text="{}"/><Text text="{}"/><Text text="{}"/><Button icon="sap-icon://show" press="onPress" type="Ghost" /></cells></ColumnListItem></items></Table></semantic:content></semantic:SemanticPage></mvc:View>'
}});