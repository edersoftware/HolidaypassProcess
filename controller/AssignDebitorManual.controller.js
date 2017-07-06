sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller, Dialog, Button, Text, MessageToast, MessageBox) {
	"use strict";
	var sSearchField = "";
	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.AssignDebitorManual", {

		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("AssignDebitorManualOverview");
		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.AssignDebitorManual
		 */
		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel({
				result: []
			});

			this.getView().setModel(oModel, "SearchResult");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("AssignDebitorManual").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var sDebitorId = oEvent.getParameter("arguments").debitorId;

			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var oSimpleFormDebitor = this.getView().byId("oSimpleFormDebitor");
			oSimpleFormDebitor.setModel(oModel);
			oSimpleFormDebitor.bindElement("/DebitorSet(guid'" + sDebitorId + "')");
			this.getView().byId("oFlexBoxStartSearch").setVisible(false);
			this.getView().getModel("SearchResult").setProperty("/result", []);

		},

		handleStartSearch: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var sSearchTerm = this.getView().byId("oInputSearchSearchText").getValue();
			oModel.callFunction("/findSAPDebitor", {
				method: "GET",
				urlParameters: {
					fieldname: sSearchField,
					searchterm: sSearchTerm
				},
				success: function(oData, response) {
					that.getView().getModel("SearchResult").setProperty("/result", oData.results);
					that.getView().byId("oTableDebitorSearchResult").removeSelections(true);
				},
				error: function(oError) {
					MessageBox.error("Es ist ein Fehler aufgetreten SAP CCC informieren");
				},
				async: false
			});
		},

		onSelectDebitorSearchResult: function(oEvent) {
			var selectedItemPath = oEvent.getParameter("listItem").getBindingContextPath();
			var iSAPDebitorNumber = this.getView().getModel("SearchResult").getProperty(selectedItemPath).SapDebitorId;
			var sFPDebitorNumber = this.getView().byId("oTextDebitorId").getText();
			var that = this;
			var oDialog = new Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new Text({
					text: 'Soll der Ferienpass-Debitor dem selektieren SAP Debitor zugewiesen werden ?'
				}),
				beginButton: new Button({
					text: 'Zuweisen',
					press: function() {

						var oModel = that.getOwnerComponent().getModel('ZFP_SRV');

						oModel.callFunction("/assignDebitorToSAPDebitor", {
							method: "GET",
							urlParameters: {
								FerienpassDebitorId: sFPDebitorNumber,
								SAPDebitorId: iSAPDebitorNumber
							},
							success: function(oData, response) {
								if (oData.ok) {
									MessageToast.show('Zuweisung erfolgreich durchgeführt!');
									var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
									oRouter.navTo("AssignDebitorManualOverview");

								} else {
									MessageToast.show('Technischer Fehler aufgetreten, bitte CCC SAP informieren');

								}

							},
							error: function(oError) {
								MessageToast.show('Technischer Fehler aufgetreten, bitte CCC SAP informieren');
							},
							async: false
						});

						MessageToast.show('Zuweisung erfolgreich durchgeführt!');
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: 'Abbrechen',
					press: function() {
						oDialog.close();
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},
		handleSearchSelection: function(oEvent) {
				var sfullId = oEvent.getSource().getId();
				var index = sfullId.lastIndexOf("--");
				var sIdButton = sfullId.substring(index + 2, sfullId.length);
				var sButtonText = "";
				var sSearchTerm = "";
				switch (sIdButton) {
					case 'oButtonSearchWithName':
						sButtonText = "Suche mit Namen starten";
						sSearchField = "name";
						sSearchTerm = this.getView().byId("oTextFirstname").getText() + " " + this.getView().byId("oTextLastname").getText();
						break;
					case 'oButtonSearchWithStreet':
						sButtonText = "Suche mit Strasse starten";
						sSearchTerm = this.getView().byId("oTextStreet").getText();
						sSearchField = "street";
						break;
				}

				this.getView().byId("oFlexBoxStartSearch").setVisible(true);
				this.getView().byId("oInputSearchSearchText").setValue(sSearchTerm);
				this.getView().byId("oButtonStartSearch").setText(sButtonText);

			}

	});

});