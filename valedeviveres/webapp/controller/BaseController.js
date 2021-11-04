  sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
   
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, UIComponent) {
		"use strict";

		return Controller.extend("tasa.com.valedeviveres.controller.BaseController", {
			// some basic functionalities
 
            // just this.getRouter() ...



            getRouter: function() {
            
            // ... instead of
            //return UIComponent.getRouterFor(this);
            return this.getOwnerComponent().getRouter();
        
            },
        
            // just this.getModel() ...
            getModel: function(sName) {
        
            // ... instead of
            return this.getView().getModel(sName);
        
            },
        

            
            // just this.setModel() ...
            setModel: function(oModel, sName) {
        
            // ... instead of
            return this.getView().setModel(oModel, sName);
        
            },
        
            // just this.getResoureBundle() ... 
            getResourceBundle: function () {
        
            // ... instead of
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        
            },
        
            // calculate something
            randomCalculations: function(fValue1, fValue2) {
        
            // do some calculations
        
            }
        
            
        

		}); 
	}); 

