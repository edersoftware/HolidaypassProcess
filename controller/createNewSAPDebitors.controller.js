sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller"
], function(MessageBox, Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.createNewSAPDebitors", {

		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main");
		},

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CreateNewSAPDebitors").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function() {
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			oModel.callFunction("/createNewSAPDebitorNumbers", {
				method: "GET",
				success: function(oData) {
					if (oData.ok) {
						MessageBox.success(oData.message);
						that.getOwnerComponent().getModel('ZFP_SRV').refresh(true);
					} else {
						MessageBox.error(oData.message);
					}
				sap.ui.core.BusyIndicator.hide();
				},
				error: function() {
					MessageBox.error("Technischer Fehler aufgetreten, bitte SAP CCC informieren");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		}
	});

});