sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.testPrintInvoices", {

		handleOnTestPrint: function(oEvent) {
			var sId = oEvent.getSource().getIdForLabel();
			var sIndex = sId.substring(sId.lastIndexOf("oTableTestPrint-") + 16, sId.length);
			var oModel = this.getView().byId("oTableTestPrint").getModel("ZFP_SRV");
			var oTable = this.getView().byId("oTableTestPrint");
			var sPath = oTable.getItems()[sIndex].getBindingContext("ZFP_SRV").sPath;

			var sDebitorId = oModel.getProperty(sPath).DebitorId;
			var sPeriod = this.getOwnerComponent().getModel("settings").getProperty("/selected_period");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ShowPDFInvoice", {
				Id: sDebitorId,
				Period: sPeriod
			});

		},
		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main");
		},
	
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("TestPrintInvoices").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var sPeriod = oEvent.getParameter("arguments").Period;
			this.getOwnerComponent().getModel("settings").setProperty("/selected_period", sPeriod);
		}

	});

});