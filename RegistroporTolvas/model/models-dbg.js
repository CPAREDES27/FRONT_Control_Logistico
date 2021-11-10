sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
    
        createDeviceModel : function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createFLPModel : function () {
            var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
                bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
                oModel = new JSONModel({
                    isShareInJamActive: bIsShareInJamActive
                });
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createFilterModel : function(){
            var dataFilter = {
                "CentroDescarga": "",
                "CentroDescripcion": "",
                "CentroCodigo": "",
			    "FechaInicioDescarga": "",
			    "HoraInicioDescarga": "",
                "CantidadFilas": "200" 
            };
            var oModel = new JSONModel(dataFilter);
            return oModel;
        },

        createCombosModel : function(){
            var model = {
                Centros: [],
                Embarcaciones: [],
                IndProp: []
            };
            var oModel = new JSONModel(model);
            return oModel;
        }



	};
});