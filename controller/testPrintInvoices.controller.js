sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.testPrintInvoices", {
		
   handleOnTestPrint : function(oEvent){
   	 var sId = oEvent.getSource().getIdForLabel();
            var sIndex = sId.substring(sId.lastIndexOf("oTableTestPrint-")+16,sId.length);	
            var oModel = this.getView().byId("oTableTestPrint").getModel("ZFP_SRV");            
            var oTable = this.getView().byId("oTableTestPrint");
            var sPath = oTable.getItems()[sIndex].getBindingContext("ZFP_SRV").sPath;

   	             var sDebitorId = oModel.getProperty(sPath).DebitorId;
            var sPeriod = this.getOwnerComponent().getModel("settings").getProperty("/selected_period");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
   	  oRouter.navTo("ShowPDFInvoice", {
   	  	Id : sDebitorId,
   	  	Period : sPeriod
   	  }
   	  );
   	 
   },
     handleBackButton: function() {
        		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        		
			oRouter.navTo("Main");
        },
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.testPrintInvoices
		 */
			onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("TestPrintInvoices").attachMatched(this._onRouteMatched, this);
			},
			
			
			_onRouteMatched: function(oEvent) {
			var sPeriod = oEvent.getParameter("arguments").Period;
			this.getOwnerComponent().getModel("settings").setProperty("/selected_period",sPeriod);

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.testPrintInvoices
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.testPrintInvoices
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.testPrintInvoices
		 */
		//	onExit: function() {
		//
		//	}

	});

});