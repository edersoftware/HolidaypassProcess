sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox'
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.maintainActivity", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.MaintainActivity
		 */
		onInit: function() {
			var that = this;

			this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate", []);

			this.getOwnerComponent().getModel("ZFP_SRV").read("/PartOfDaySet", {
				success: function(oData, response) {

					var aAllPartOfDays = [];

					for (var i = 0; i < oData.results.length; i++) {
						var oPartOfDays = {
							id: oData.results[i].Id,
							text: oData.results[i].TitleD
						};
						aAllPartOfDays.push(oPartOfDays);
					}
					that.getOwnerComponent().getModel("settings").setProperty("/PartOfDays", aAllPartOfDays);
				},
				error: function(oError) {}
			});

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("MaintainActivity").attachMatched(this._onRouteMatched, this);

			this.oReadOnlyTemplateTableActivities = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{ZFP_SRV>Activitynumber}"
					}), new sap.m.Text({
						text: "{path : 'ZFP_SRV>StartDate' , type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', UTC: true, strictParsing: true} }",
						displayFormat: "long"
					}), new sap.m.Text({
						text: "{path : 'ZFP_SRV>EndDate' , type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', UTC: true, strictParsing: true} }",
						displayFormat: "long"
					}), new sap.m.Text({
						text: "{=${ZFP_SRV>NotInPeriod} ? 'Ja' : 'Nein'}"
					}), new sap.m.Text({
						text: "{ZFP_SRV>ActivityTitleD}"
					}), new sap.m.Text({
						text: "{ZFP_SRV>ActivityTitleF}"
					}), new sap.m.Text({
						text: {
							path: 'ZFP_SRV>PartOfDay',
							formatter: function(sPartOfDayKey) {
								return that.PartOfDayFormatter(sPartOfDayKey);

							}
						}
					})
				]
			});
			this.rebindTable(this.oReadOnlyTemplateTableActivities);
			this.oEditableTemplateTableTableActivities = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{ZFP_SRV>Activitynumber}"
					}), new sap.m.DatePicker({
						value: "{path : 'ZFP_SRV>StartDate' , type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', UTC: true, strictParsing: true} }",
						displayFormat: "long",
						enabled: true,
						change: function(oEvent) {
							that.onChangeActivity(oEvent);
						}
					}), new sap.m.DatePicker({
						value: "{path : 'ZFP_SRV>EndDate' , type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', UTC: true, strictParsing: true} }",
						displayFormat: "long",
						enabled: true,
						change: function(oEvent) {
							that.onChangeActivity(oEvent);
						}
					}), new sap.m.CheckBox({
						value: "{ZFP_SRV>NotInPeriod}",
						select: function(oEvent) {
							that.onChangeActivity(oEvent);
						}
					}),
					new sap.m.Input({
						value: "{ZFP_SRV>ActivityTitleD}",
						liveChange: function(oEvent) {
							that.onChangeActivity(oEvent);
						}
					}), new sap.m.Input({
						value: "{ZFP_SRV>ActivityTitleF}",
						liveChange: function(oEvent) {
							that.onChangeActivity(oEvent);
						}
					}), new sap.m.Select({
						forceSelection: true,
						change: function(oEvent) {
							that.onChangeActivity(oEvent);
						},
						selectedKey: "{ZFP_SRV>PartOfDay}",
						items: {
							path: "settings>/PartOfDays",
							templateShareable: false, //no curly brackets here!
							template: new sap.ui.core.Item({
								key: "{settings>id}",
								text: "{settings>text}"
							})
						}
					})
				]
			});
		},

		onChangeActivity: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext("ZFP_SRV").getPath();
			var aActivityToUpdate = this.getOwnerComponent().getModel("control").getProperty("/ActivityToUpdate");
			if (aActivityToUpdate.indexOf(sPath) === -1) {
				aActivityToUpdate.push(sPath);
				this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate", aActivityToUpdate);
			}
		},
		onEditActivity: function() {
			this.getView().byId("oColumPartOfDay").setWidth("160px");
			this.getView().byId("editButtonActivity").setVisible(false);
			this.getView().byId("saveButtonActivity").setVisible(true);
			this.getView().byId("cancelButtonActivity").setVisible(true);
			this.rebindTable(this.oEditableTemplateTableTableActivities);
		},

		onSaveActivity: function() {

			var aActivitiesToUpdate = this.getOwnerComponent().getModel("control").getProperty("/ActivityToUpdate");
			var oModel = this.getOwnerComponent().getModel("ZFP_SRV");
			for (var i = 0; aActivitiesToUpdate.length > i; i++) {

				var oActivityToUpdate = oModel.getProperty(aActivitiesToUpdate[i]);
				oModel.update(aActivitiesToUpdate[i],
					oActivityToUpdate, {
						success: function(oData, response) {
							MessageBox.success("Erfolgreich gesichert");
						},
						error: function(oError) {
							MessageBox.error("Technischer Fehler, bitte SAP CCC informieren");
							
						}
					});

			}
			this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate", []);
			this.getView().byId("oColumPartOfDay").setWidth("120px");
			this.getView().byId("saveButtonActivity").setVisible(false);
			this.getView().byId("cancelButtonActivity").setVisible(false);
			this.getView().byId("editButtonActivity").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplateTableActivities);
		},

		onCancelActivity: function() {
			this.getView().byId("oColumPartOfDay").setWidth("120px");
			this.getView().byId("cancelButtonActivity").setVisible(false);
			this.getView().byId("saveButtonActivity").setVisible(false);
			this.getView().byId("editButtonActivity").setVisible(true);
			this.rebindTable(this.oReadOnlyTemplateTableActivities);
			this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate",[]);
		},

		PartOfDayFormatter: function(sPartOfDayKey) {
			var aAllPartOfDays = this.getOwnerComponent().getModel("settings").getProperty("/PartOfDays");
			for (var i = 0; i < aAllPartOfDays.length; i++) {
				if (aAllPartOfDays[i].id === sPartOfDayKey) {
					return aAllPartOfDays[i].text;
				}
			}
			return "FEHLER_NICHT_GEFUNDEN";
		},
		rebindTable: function(oTemplate) {

			this.getView().byId("oTableTableActivities").bindItems({
				path: "ZFP_SRV>/ActivitySet",
				template: oTemplate
			});
		},

		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sap.ui.getCore().byId("oShellApp").setAppWidthLimited(true);
			oRouter.navTo("Main");
		},

		_onRouteMatched: function(oEvent) {
			sap.ui.getCore().byId("oShellApp").setAppWidthLimited(false);
		}

	});

});