sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.changeDebitor", {

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ChangeDebitor").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var sDebitorId = oEvent.getParameter("arguments").debitorId;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var oSimpleFormDebitor = this.getView().byId("oSimpleFormDebitorChange");
			oSimpleFormDebitor.setModel(oModel);
			oSimpleFormDebitor.bindElement("/DebitorSet(guid'" + sDebitorId + "')");
		},

		convertToNumber: function(sNumber) {
			return parseInt(sNumber);
		},

		handleCheckRefound: function(oEvent) {
			var sNewNumber = oEvent.getParameter("newValue");
			var oInput = oEvent.getSource();
			var iNewNumber = parseInt(sNewNumber);
			if (sNewNumber % iNewNumber === 0) {
				oInput.setValue(iNewNumber);
			} else {
				MessageBox.error("Nur ganze Zahlen erlaubt!");
			}
		},

		handleOnSaveAndReturn: function() {
			var oModel = this.getOwnerComponent().getModel("ZFP_SRV");
			var sPath = this.getView().byId("oSimpleFormDebitorChange").getBindingContext().sPath;
			var that = this;
			var oDebitorToUpdate = {
				Firstname: this.getView().byId("oInputFirstname").getValue(),
				Lastname: this.getView().byId("oInputLastname").getValue(),
				AdditionalName: this.getView().byId("oInputAdditionalName").getValue(),
				Street: this.getView().byId("oInputStreet").getValue(),
				Zip: this.getView().byId("oInputZip").getValue(),
				City: this.getView().byId("oInputCity").getValue(),
				Refound: this.getView().byId("oInputRefound").getValue(),
				SapDebitorId: this.getView().byId("oInputSapDebitorId").getValue()
			};
			sap.ui.core.BusyIndicator.show(0);
			oModel.update(sPath,
				oDebitorToUpdate, {
					success: function() {
						sap.ui.core.BusyIndicator.hide();
						that.goBackToOverview();
					},
					error: function(oError) {
						var sErrorMessage = JSON.parse(oError.responseText).error.message.value;
						MessageBox.error(sErrorMessage);
						sap.ui.core.BusyIndicator.hide();
					},
					asynch: true
				});
		},
		goBackToOverview: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ChangeDebitorOverview");
		}
	});

});