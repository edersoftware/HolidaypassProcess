sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller"
], function(MessageBox, Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.createNewSAPDebitors", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.createNewSAPDebitors
		 */
		//	onInit: function() {
		//
		//	},
   
   handleBackButton: function() {
        		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main");
        },
        
        	onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateNewSAPDebitors").attachMatched(this._onRouteMatched, this);
			
				var oModel = new sap.ui.model.json.JSONModel();

			this.getView().setModel(oModel);

			

		},

		_onRouteMatched: function(oEvent) {
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var sToDisplay = "";
			var bOk = false;
			oModel.callFunction("/createNewSAPDebitorNumbers", {
				method: "GET",
				success: function(oData, response) {
					if(oData.ok) {
							MessageBox.success(oData.message);
							that.getOwnerComponent().getModel('ZFP_SRV').refresh(true);
					} else {
							MessageBox.error(oData.message);
					}
				},
				error: function(oError) {
				MessageBox.error("Technischer Fehler aufgetreten, bitte SAP CCC informieren");
				},
				async: false
			});
			
			
		}
	});

});