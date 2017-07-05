sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.showPDFInvoice", {
handleBackButton: function() {
        		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        		var sPeriod = this.getOwnerComponent().getModel("settings").getProperty("/selected_period");
			oRouter.navTo("TestPrintInvoices", { Period : sPeriod});
        },
        
        
      
        
        
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.showPDFInvoice
		 */
			onInit: function() {
	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ShowPDFInvoice").attachMatched(this._onRouteMatched, this);
			},

 _onRouteMatched : function(oEvent) {
            	            	var sId  = oEvent.getParameter("arguments").Id;
            	var sPeriod  = oEvent.getParameter("arguments").Period;
            	this.getOwnerComponent().getModel("settings").setProperty("/selected_period",sPeriod);
            var sUrl = window.location.origin + "/sap/opu/odata/sap/ZFP_SRV/InvoicePDFSet(DebitorId=guid%27" + sId + "%27,Period=%27" +sPeriod+ "%27)/$value";
                 var oContainer = this.getView().byId("pdfContainer");
var oContent = "<iframe  width='100%' height='100%'  src='" + sUrl + "' frameborder='0'></iframe>";
           oContainer.setContent(oContent); 	
            }

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.showPDFInvoice
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.showPDFInvoice
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.showPDFInvoice
		 */
		//	onExit: function() {
		//
		//	}

	});

});