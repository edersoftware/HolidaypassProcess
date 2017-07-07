sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/mvc/Controller"
], function(MessageBox, Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.clearDebitorDoublets", {

		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ChangeDebitorOverview", {
				update: "DebitorChange"
			});
		},

		_mergeDebitors: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var that = this.oController;
			var sId = oEvent.getParameter("id");
			var iIndex = sId.substring(sId.lastIndexOf("oButtonCons_") + 12, sId.length);
			var sTableId = "oTableSapDebitorDoublet_" + iIndex;
			var sPathMasterFPDebitor = sap.ui.getCore().byId(sTableId).getSelectedItem().getBindingContext("debitor_doubl").getPath();
			var sMasterFPDebitorID = that.getView().getModel("debitor_doubl").getProperty(sPathMasterFPDebitor + "/FpDebitorId");
			that.getOwnerComponent().getModel('ZFP_SRV').callFunction("/mergeDoublet", {
				method: "GET",
				urlParameters: {
					master: sMasterFPDebitorID
				},
				success: function(oData) {
					if (oData.ok) {
						var oPanelToRemoveTable = sap.ui.getCore().byId("oPanelSapDebitorDoublet_" + iIndex);
						oPanelToRemoveTable.destroyContent();
						oPanelToRemoveTable.addContent(new sap.m.Text({
							text: "Doubletten aufgelöst"
						}));
					} else {
						MessageBox.error(oData.message);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function() {
					MessageBox.error("Technischer Fehler aufgetreten");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ClearDebitorDoublets").attachMatched(this._onRouteMatched, this);
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "debitor_doubl");
		},

		_onRouteMatched: function() {
			var that = this;
			var oVerticalLayoutToDrawItems = this.getView().byId("oVerticalLayoutDoubletsMatching");
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var aDebitorsToConsUI = [];
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/getDoublettes", {
				method: "GET",
				success: function(oData) {
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
					if (aDebitorsToConsUI.length === 0) {
						oVerticalLayoutToDrawItems.addContent(new sap.m.Title({
							level: "H3",
							text: "Keine Dubletten gefunden."
						}));
						sap.ui.core.BusyIndicator.hide();
					}
					for (i = 0; aDebitorsToConsUI.length > i; i++) {
						var oUIPanel = new sap.m.Panel("oPanelSapDebitorDoublet_" + i, {
							width: "auto",
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
									text: "Debitoren zusammenführen"
								}).attachPress(that._mergeDebitors, {
									oController: that
								})
							]
						});
						oVerticalLayoutToDrawItems.addContent(oUIPanel);
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function() {
					MessageBox.error("Technischer Fehler aufgetreten");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});
		}
	});
});