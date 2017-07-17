sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox'
], function(Controller, MessageBox) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.maintainActivity", {

		onInit: function() {
			var that = this;
			this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate", []);
			this.getOwnerComponent().getModel("ZFP_SRV").read("/PartOfDaySet", {
				success: function(oData) {
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
				error: function() {
					MessageBox.error("Technischer Fehler, bitte SAP CCC informieren");
				}
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
								return that._partOfDayFormatter(sPartOfDayKey);
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
							templateShareable: false, 
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
			this.getView().byId("oPageMaintainActivity").setShowNavButton(false);
			this.rebindTable(this.oEditableTemplateTableTableActivities);
		},
		
		_storeActivity: function(_sActivityToUpdateId,_oActivityToUpDate,_isLastActivity) {
				this.getOwnerComponent().getModel("ZFP_SRV").update(_sActivityToUpdateId,
					_oActivityToUpDate, {
						success: function() {
							if(_isLastActivity) {
								sap.ui.core.BusyIndicator.hide();
							}
						},
						error: function() {
							MessageBox.error("Technischer Fehler, bitte SAP CCC informieren");
							
						},
						async : true
					});
		},
		onSaveActivity: function() {

			var aActivitiesToUpdate = this.getOwnerComponent().getModel("control").getProperty("/ActivityToUpdate");
			sap.ui.core.BusyIndicator.show(0);
			var bIsLast = false;
			for (var i = 0; aActivitiesToUpdate.length > i; i++) {
				var oActivityToUpdate = this.getOwnerComponent().getModel("ZFP_SRV").getProperty(aActivitiesToUpdate[i]);
				if(aActivitiesToUpdate.length === ( i + 1 )){
				   bIsLast = true;
				}
                this._storeActivity(aActivitiesToUpdate[i],oActivityToUpdate,bIsLast);
			}
			sap.ui.core.BusyIndicator.hide();
			this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate", []);
			this.getView().byId("oColumPartOfDay").setWidth("120px");
			this.getView().byId("saveButtonActivity").setVisible(false);
			this.getView().byId("cancelButtonActivity").setVisible(false);
			this.getView().byId("editButtonActivity").setVisible(true);
			this.getView().byId("oPageMaintainActivity").setShowNavButton(true);
			this.rebindTable(this.oReadOnlyTemplateTableActivities);
		},

		onCancelActivity: function() {
			this.getView().byId("oColumPartOfDay").setWidth("120px");
			this.getView().byId("cancelButtonActivity").setVisible(false);
			this.getView().byId("saveButtonActivity").setVisible(false);
			this.getView().byId("editButtonActivity").setVisible(true);
			this.getView().byId("oPageMaintainActivity").setShowNavButton(true);
			this.rebindTable(this.oReadOnlyTemplateTableActivities);
			this.getOwnerComponent().getModel("control").setProperty("/ActivityToUpdate",[]);
		},

		_partOfDayFormatter: function(sPartOfDayKey) {
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

		_onRouteMatched: function() {
			sap.ui.getCore().byId("oShellApp").setAppWidthLimited(false);
		}

	});

});