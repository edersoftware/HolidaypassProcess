sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller"
], function(MessageBox, Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.clearDebitorDoublets", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.clearDebitorDoublets
		 */

		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ChangeDebitorOverview", {
				update: "DebitorChange"
			});
		},
		_doMatching: function() {

			// oVerticalLayoutDoubletsMatching
			var that = this;
			var oVerticalLayoutToDrawItems = this.getView().byId("oVerticalLayoutDoubletsMatching");
			
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var aDebitorsToConsUI = [];

			oModel.callFunction("/getDoublettes", {
				method: "GET",
				success: function(oData, response) {
					var aDebitorsToCons = oData.results;

					function _indexOfSapDebitor(sSapDebitorId, aArrayToCheck) {
						for (var i = 0; aArrayToCheck.length > i; i++) {
							if (aArrayToCheck[i].SapDebitorId === sSapDebitorId) {
								return i;
							}
						}
						return -1;
					}
					var iIndexOfSapDebitor = -1;
					for (var i = 0; aDebitorsToCons.length > i; i++) {
						iIndexOfSapDebitor = _indexOfSapDebitor(aDebitorsToCons[i].SapDebitorId, aDebitorsToConsUI);
						if (iIndexOfSapDebitor === -1) {
							var oNewDebitor = {
								SapDebitorId: aDebitorsToCons[i].SapDebitorId,
								FullnameSap: aDebitorsToCons[i].FullnameSap,
								StreetSap: aDebitorsToCons[i].StreetSap,
								ZipSap: aDebitorsToCons[i].ZipSap,
								CitySap: aDebitorsToCons[i].CitySap,
								IsSolved: false,
								FpDebitors: []
							};
							aDebitorsToConsUI.push(oNewDebitor);
							iIndexOfSapDebitor = aDebitorsToConsUI.length - 1;
						}
						var oFpDebitor = {
							FpDebitorId: aDebitorsToCons[i].FpDebitorId,
							FirstnameFp: aDebitorsToCons[i].FirstnameFp,
							LastnameFp: aDebitorsToCons[i].LastnameFp,
							AdditionalNameFp: aDebitorsToCons[i].AdditionalNameFp,
							StreetFp: aDebitorsToCons[i].StreetFp,
							ZipFp: aDebitorsToCons[i].ZipFp,
							CityFp: aDebitorsToCons[i].CityFp
						};
						aDebitorsToConsUI[iIndexOfSapDebitor].FpDebitors.push(oFpDebitor);
					}

					that.getView().getModel("debitor_doubl").setProperty("/", aDebitorsToConsUI);
					// Draw UI
					oVerticalLayoutToDrawItems.destroyContent();
					if(aDebitorsToConsUI.length === 0){
						oVerticalLayoutToDrawItems.addContent(new sap.m.Title({
													level: "H3",
													text: "Keine Dubletten gefunden."
												}));
					}
					for (var i = 0; aDebitorsToConsUI.length > i; i++) {
						var sSapDebitorTitle = "SAP Debitor Nr.  " + aDebitorsToConsUI[i].SapDebitorId +
							" ,    " + aDebitorsToConsUI[i].FullnameSap + " ,    " + aDebitorsToConsUI[i].StreetSap + " , " + aDebitorsToConsUI[i].ZipSap +
							" " + aDebitorsToConsUI[i].CitySap;
						var oUIPanel = new sap.m.Panel("oPanelSapDebitorDoublet_" + i, {
							width: "auto",
							class: "sapUiResponsiveMargin",
							accessibleRole: "Region",
							headerToolbar: [
								new sap.m.Toolbar({
									height: "80px",
									content: [
										new sap.ui.layout.VerticalLayout({
											content: [
												new sap.m.Title({
													level: "H3",
													text: aDebitorsToConsUI[i].FullnameSap + "(SAP-Debitoren Nr : " + aDebitorsToConsUI[i].SapDebitorId + ")"
												}),
												new sap.m.Text({
													text: aDebitorsToConsUI[i].StreetSap + " " + aDebitorsToConsUI[i].ZipSap + " " + aDebitorsToConsUI[i].CitySap
												})
											]
										})
									]
								})
							],
							content: [
								new sap.m.Table("oTableSapDebitorDoublet_" + i, {
									mode: "SingleSelectLeft",
									columns: [
										new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "Id"
												})
											]
										}), new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "Vorname"
												})
											]
										}), new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "Nachname"
												})
											]
										}), new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "Namenszusatz"
												})
											]
										}), new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "Strasse"
												})
											]
										}), new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "PLZ"
												})
											]
										}), new sap.m.Column({
											header: [
												new sap.m.Label({
													text: "Ort"
												})
											]
										})
									],
									items: {
										path: "debitor_doubl>/" + i + "/FpDebitors",
										template: new sap.m.ColumnListItem({
											cells: [

												new sap.m.Text({
													text: "{debitor_doubl>FpDebitorId}"
												}),
												new sap.m.Text({
													text: "{debitor_doubl>FirstnameFp}"
												}),
												new sap.m.Text({
													text: "{debitor_doubl>LastnameFp}"
												}),
												new sap.m.Text({
													text: "{debitor_doubl>AdditionalNameFp}"
												}),
												new sap.m.Text({
													text: "{debitor_doubl>StreetFp}"
												}),
												new sap.m.Text({
													text: "{debitor_doubl>ZipFp}"
												}),
												new sap.m.Text({
													text: "{debitor_doubl>CityFp}"
												})
											]
										})
									}
								}),
								new sap.m.Button("oButtonCons_" + i, {
									text: "Debitoren zusammenführen",
									press: function(oEvent) {
										var sId = oEvent.getParameter("id");
										var iIndex = sId.substring(sId.lastIndexOf("oButtonCons_") + 12, sId.length);
										var sTableId = "oTableSapDebitorDoublet_" + iIndex;
										var sPathMasterFPDebitor = sap.ui.getCore().byId(sTableId).getSelectedItem().getBindingContext("debitor_doubl").getPath();
										var sMasterFPDebitorID = that.getView().getModel("debitor_doubl").getProperty(sPathMasterFPDebitor + "/FpDebitorId");
										var oModelBackEnd = that.getOwnerComponent().getModel('ZFP_SRV');

										oModel.callFunction("/mergeDoublet", {
											method: "GET",
											urlParameters: {
												master: sMasterFPDebitorID
											},
											success: function(oData, response) {
												var x = sPathMasterFPDebitor;
												if (oData.ok) {
													var oPanelToRemoveTable = sap.ui.getCore().byId("oPanelSapDebitorDoublet_" + iIndex);
													oPanelToRemoveTable.destroyContent();
													oPanelToRemoveTable.addContent(new sap.m.Text({
														text: "Doubletten aufgelöst"
													}));
												} else {
													MessageBox.error(oData.message);
												}
											},
											error: function(oError) {
												MessageBox.error("Technischer Fehler aufgetreten");
											},
											async: false
										});

									}
								})
							]
						});

						oVerticalLayoutToDrawItems.addContent(oUIPanel);

					}

				},
				error: function(oError) {
					MessageBox.error("Technischer Fehler aufgetreten");
				},
				async: false
			});
		},
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ClearDebitorDoublets").attachMatched(this._onRouteMatched, this);

			var oModel = new sap.ui.model.json.JSONModel();

			this.getView().setModel(oModel, "debitor_doubl");

		},

		_onRouteMatched: function(oEvent) {
			this._doMatching();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.clearDebitorDoublets
		 */
		onBeforeRendering: function() {

		}

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.clearDebitorDoublets
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.clearDebitorDoublets
		 */
		//	onExit: function() {
		//
		//	}

	});

});