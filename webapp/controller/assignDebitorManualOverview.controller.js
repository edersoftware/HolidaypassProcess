sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.assignDebitorManualOverview", {

		/**
		 * Wird aufgerufen, wenn ein Debitor in der Übersichtstabelle ausgewählt wurde.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.assignDebitorManualOverview
		 * @param {sap.ui.base.Event} oEvent  Event Object, welches in diesem Fall die Selection enthält
		 */
		handleSelectDebitorToMap: function(oEvent) {
		var oSelectedItem = oEvent.getSource().getSelectedItem();
			var iIndex = oEvent.getSource().indexOfItem(oSelectedItem);
			var sDebitorId = this.getOwnerComponent().getModel('debitorsToMapManual').getProperty("/" + iIndex + "/DebitorId");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("AssignDebitorManual", {
				debitorId: sDebitorId,
				index : iIndex
			});
		},
		
		/**
		 * Wird aufgerufen, wenn im Header der BackButton gedrückt wird. Es wird zur Startseite zurück navigiert
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.assignDebitorManualOverview
		 */
		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Main");
		},
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.assignDebitorManualOverview
		 */
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("AssignDebitorManualOverview").attachMatched(this._onRouteMatched, this);
		},

		/**
		 * Wird aufgerufen, wenn auf diese Seite navigiert wird. Es wird damit die Selektion der Übersichtstabelle gelöscht
		 * und die Tabelle neu mit Daten versorgt
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.assignDebitorManualOverview
		 */
		_onRouteMatched: function() {
			var oTable = this.getView().byId("oTableDebitorManualMapping");
			oTable.removeSelections(true);

		}
	});

});