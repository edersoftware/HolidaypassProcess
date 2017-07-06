sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.changeDebitorOverview", {

		handleOnMerge: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ClearDebitorDoublets");
		},

		handleBackButton: function() {
			sap.ui.getCore().byId("oShellApp").setAppWidthLimited(true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main");
		},

		convertToNumber: function(sNumber) {
			return parseInt(sNumber);
		},

		handleOnChangeDebitor: function(oEvent) {
			var sId = oEvent.getSource().getIdForLabel();
			var sIndex = sId.substring(sId.lastIndexOf("oTableDebitorToChange-") + 22, sId.length);
			var oModel = this.getView().byId("oTableDebitorToChange").getModel("ZFP_SRV");
			var oTable = this.getView().byId("oTableDebitorToChange");
			var sPath = oTable.getItems()[sIndex].getBindingContext("ZFP_SRV").sPath;
			var sDebitorId = oModel.getProperty(sPath).DebitorId;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ChangeDebitor", {
				debitorId: sDebitorId
			});
		},
		handleOnCorrectBielCityName: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			oModel.callFunction("/correctBielCityName", {
				method: "GET",
				success: function(oData) {
					if (oData.ok) {
						MessageBox.success(oData.message);
						var oTable = that.getView().byId("oTableDebitorToChange");
						oTable.getModel("ZFP_SRV").refresh(true);
						oTable.removeSelections(true);
					} else {
						MessageBox.error(oData.message);
					}
				},
				error: function() {
					MessageBox.error("Es ist ein technischer Fehler aufgetreten. Informieren Sie das SAP CCC");
				},
				async: false
			});
		},
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.changeDebitorOverview
		 */
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ChangeDebitorOverview").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function() {
			sap.ui.getCore().byId("oShellApp").setAppWidthLimited(false);
			var oTable = this.getView().byId("oTableDebitorToChange");
			oTable.getModel("ZFP_SRV").refresh(true);
			oTable.removeSelections(true);
		}
	});

});