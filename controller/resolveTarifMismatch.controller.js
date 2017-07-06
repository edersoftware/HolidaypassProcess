sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.resolveTarifMismatch", {

		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ResolveTarifMismatch").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var oModelTarifMisMatch = this.getOwnerComponent().getModel('tarif_mismatch');
			var that = this;
			var oVerticalLayoutResolvTarifMismatch = this.getView().byId("oVerticalLayoutResolvTarifMismatch");
			var aDisplayCheckResult = oModelTarifMisMatch.getProperty("/tarifmismatch");
			for (var i = 0; aDisplayCheckResult.length > i; i++) {
				var sDebitorTitle = "Debitor Nr.  " + aDisplayCheckResult[i].DebitorId + " ,  " + aDisplayCheckResult[i].Fullname;
				var oUIPanel = new sap.m.Panel("oPanelResolvTarifMisMatch_" + i, {
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
											text: sDebitorTitle
										})
									]
								})
							]
						})
					],
					content: [
						new sap.m.Table("oTableResolvTarifMisMatch__" + i, {
							mode: "SingleSelectLeft",
							columns: [
								new sap.m.Column({
									header: [
										new sap.m.Label({
											text: "Name des Kindes"
										})
									]
								}), new sap.m.Column({
									header: [
										new sap.m.Label({
											text: "Tarif"
										})
									]
								})
							],
							items: {
								path: "tarif_mismatch>/tarifmismatch/" + i + "/Childs",
								template: new sap.m.ColumnListItem({
									cells: [

										new sap.m.Text({
											text: "{tarif_mismatch>Fullname}"
										}),
										new sap.m.Text({
											text: "{tarif_mismatch>Tarif}"
										})
									]
								})
							}
						}),
						new sap.m.Button("oButtonCons_" + i, {
							text: "Selektierten Tarif setzen",
							press: function(oEvent) {
								// TODO: Change if clearDebitorDoub work
								var sId = oEvent.getParameter("id");
								var iIndex = sId.substring(sId.lastIndexOf("oButtonCons_") + 12, sId.length);
								var sTableId = "oTableResolvTarifMisMatch__" + iIndex;
								var sPathSelectedChild = sap.ui.getCore().byId(sTableId).getSelectedItem().getBindingContext("tarif_mismatch").getPath();
								var sTarifToSet = that.getView().getModel("tarif_mismatch").getProperty(sPathSelectedChild + "/Tarif");
								var sDebitorId = that.getView().getModel("tarif_mismatch").getProperty("/tarifmismatch/" + iIndex + "/DebitorId");

								that.getOwnerComponent().getModel('ZFP_SRV').callFunction("/setNewTarif", {
									method: "GET",
									urlParameters: {
										debitorId: sDebitorId,
										tarifId: sTarifToSet
									},
									success: function(oData, response) {
										if (oData.ok) {
											var oPanelToRemoveTable = sap.ui.getCore().byId("oPanelResolvTarifMisMatch_" + iIndex);
											oPanelToRemoveTable.destroyContent();
											oPanelToRemoveTable.addContent(new sap.m.Text({
												text: "Missmatch aufgelöst"
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

				oVerticalLayoutResolvTarifMismatch.addContent(oUIPanel);

			}


		},

		handleBackButton: function() {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("Main");
			}
	});

});