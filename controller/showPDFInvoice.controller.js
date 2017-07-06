sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.showPDFInvoice", {
		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sPeriod = this.getOwnerComponent().getModel("settings").getProperty("/selected_period");
			oRouter.navTo("TestPrintInvoices", {
				Period: sPeriod
			});
		},

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ShowPDFInvoice").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var sId = oEvent.getParameter("arguments").Id;
			var sPeriod = oEvent.getParameter("arguments").Period;
			this.getOwnerComponent().getModel("settings").setProperty("/selected_period", sPeriod);
			var sUrl = window.location.origin + "/sap/opu/odata/sap/ZFP_SRV/InvoicePDFSet(DebitorId=guid%27" + sId + "%27,Period=%27" + sPeriod +
				"%27)/$value";
			var oContainer = this.getView().byId("pdfContainer");
			var oContent = "<iframe  width='100%' height='100%'  src='" + sUrl + "' frameborder='0'></iframe>";
			oContainer.setContent(oContent);
		}
	});

});