sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/m/MessageBox"
], function(Controller, Filter, MessageBox) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.printInvoices", {
		handleBackButton: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("Main");
		},

		onClosePrintStatus: function() {
			this._oPopover.close();
		},
		_checkIfPrindPDFOnly: function() {
			var sId = this.getView().byId("oRadioButtonGroupPrinting").getSelectedButton().getId();
			var iIndex = sId.lastIndexOf("oRadioButton");
			if( sId.substring(iIndex + 12, sId.length) === "Filesystem" ) {
				return true;
		    } else {
		    	return false;
		    }
		},
		_checkIfPrintDirect: function() {
			var sId = this.getView().byId("oRadioButtonGroupPrinting").getSelectedButton().getId();
			var iIndex = sId.lastIndexOf("oRadioButton");
			switch (sId.substring(iIndex + 12, sId.length)) {
				case "Direct":
					return true;
				case "Spool":
					return false;
			    default:
			        return false;
			}
		},
		handleChangePrintType: function(oEvent) {
			var bState = oEvent.getParameter("state");
			if (bState) {
				this.getView().byId("oTextPrintInOnePart").setVisible(false);
				this.getView().byId("oSimpleFormPrintInParts").setVisible(true);
			} else {
				this.getView().byId("oTextPrintInOnePart").setVisible(true);
				this.getView().byId("oSimpleFormPrintInParts").setVisible(false);
			}
		},
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("PrintInvoices").attachMatched(this._onRouteMatched, this);

			var oModel = new sap.ui.model.json.JSONModel({
				PrintStateText: "",
				PrintStateBusyIndicatorVisible: true
			});

			this.getView().setModel(oModel, "WebSocket_Updates");
		},

		_onRouteMatched: function(oEvent) {
			var sPeriod = oEvent.getParameter("arguments").Period;
			this.getOwnerComponent().getModel("settings").setProperty("/selected_period", sPeriod);

		},

		handlePrintSingleInvoice: function() {
			if (!this._oDialo_oDialogSelectSingleInvoiceToPrint) {
				this._oDialog = sap.ui.xmlfragment("ch.bielbienne.HolidayPassHolidayPassProcessing.fragments.selectSingleDebitorToPrint", this);
			}

			this.getView().addDependent(this._oDialog);

			this._oDialog.open();
		},

		onExit: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},
		handleStartPrint: function(oEvent) {
			var bIsPrintInParts = this.getView().byId("oSwitchPrintType").getState();
			var iAmountInMainParts = this.getView().byId("oInputOtherParts").getValue();
			var iAmountInFirstPart = this.getView().byId("oInputFirstPart").getValue();
			var sSapDebitorId = '00000000-0000-0000-0000-000000000000';
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("ch.bielbienne.HolidayPassHolidayPassProcessing.fragments.printStatus", this);
				this.getView().addDependent(this._oPopover);
			}
			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this._oPopover.openBy(oButton);
			});
			this._printInvoices(iAmountInMainParts, iAmountInFirstPart, bIsPrintInParts, sSapDebitorId);
		},
		handleSearchSingleInvoiceToPrint: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Fullname", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		_printInvoices: function(iAmountInMainParts, iAmountInFirstPart, bIsPrintInParts, sSapDebitorId) {

			var hostLocation = window.location,
				socket, socketHostURI, webSocketURI;
			if (hostLocation.protocol === "https:") {
				socketHostURI = "wss:";
			} else {
				socketHostURI = "ws:";
			}

			socketHostURI += "//" + hostLocation.host;
			webSocketURI = socketHostURI + '/sap/bc/apc/sap/zfp_apc_ferienpass/state_print';
			try {
				socket = new WebSocket(webSocketURI);
				socket.onopen = function() {};
				var that = this;
				//Create function for handling websocket messages
				
				socket.onmessage = function(oMessage) {
					var oModelWS = that.getView().getModel("WebSocket_Updates");
					var aState = oMessage.data.split(":");
					var bVisibleState = (aState[0] === "true");
					oModelWS.setProperty("/PrintStateBusyIndicatorVisible", bVisibleState);
					var sText = oModelWS.getProperty("/PrintStateText");
					var sTextNew = sText + "\n" + aState[1];
					oModelWS.setProperty("/PrintStateText",sTextNew);
				};
				socket.onclose = function() {
					socket.close();
				};
				this.socket = socket;
			} catch (exception) {
				MessageBox.error("Fehler beim Setup des Websockets" + exception);
			}

			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var sPeriod = this.getOwnerComponent().getModel("settings").getProperty("/selected_period");
			var bIsPrintSingleInvoice = false;
			if (iAmountInFirstPart === 1 && iAmountInMainParts === 1) {
				bIsPrintSingleInvoice = true;
			}
			var bPrintDirect = this._checkIfPrintDirect();
			var bPrindToFileSystemOnly = this._checkIfPrindPDFOnly();
			oModel.callFunction("/printInvoices", {
				method: "GET",
				urlParameters: {
					PeriodId: sPeriod,
					IsPrintSingleInvoice: bIsPrintSingleInvoice,
					DebitorId: sSapDebitorId,
					AmountInMainParts: iAmountInMainParts,
					AmountInFirstPart: iAmountInFirstPart,
					IsPrintInParts: bIsPrintInParts,
					IsPrintDirect: bPrintDirect,
					IsPrintToFileSystemOnly : bPrindToFileSystemOnly
				},
				success: function(oData, response) {
					if (oData.ok) {
						that.getView().getModel("WebSocket_Updates").setProperty("/PrintStateBusyIndicatorVisible", false);
					}
				},
				error: function(oError) {
					that.getView().getModel("WebSocket_Updates").setProperty("/PrintStateText",
						"Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					that.getView().getModel("WebSocket_Updates").setProperty("/PrintStateBusyIndicatorVisible", false);
				},
				async: false
			});
		},

		handleCloseSingleInvoiceToPrint: function(oEvent) {
				var aContexts = oEvent.getParameter("selectedContexts");
				if (aContexts && aContexts.length) {
					var sSapDebitorId = aContexts[0].oModel.getProperty(aContexts[0].sPath + "/DebitorId");
					if (!this._oPopover) {
						this._oPopover = sap.ui.xmlfragment("ch.bielbienne.HolidayPassHolidayPassProcessing.fragments.printStatus", this);
						this.getView().addDependent(this._oPopover);
					}
					// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
					var oButton = this.getView().byId("oButtonPrintSingleInvoice");
					jQuery.sap.delayedCall(0, this, function() {
						this._oPopover.openBy(oButton);
					});
					this._printInvoices(1, 1, false, sSapDebitorId);
				}
			}
	});
});