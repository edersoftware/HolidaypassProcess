sap.ui.define([
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/ui/core/mvc/Controller"
], function(Button, Link, Dialog, MessageBox, Text, Controller) {
	"use strict";

	return Controller.extend("ch.bielbienne.HolidayPassHolidayPassProcessing.controller.Main", {

		/**
		 * Initialisierung des Views
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		onInit: function() {

			// Initialize the Models

			this.getOwnerComponent().getModel('WebSocket_Updates').setProperty("/", {
				UploadState_sccessfull: 0,
				UploadState_failed: 0,
				UploadState_visible: false,
				UploadStateAct_sccessfull: 0,
				UploadStateAct_failed: 0,
				UploadStateAct_act_with_no_booking: 0,
				UploadStateAct_visible: false,
				GroupBS_items: 0,
				GroupBS_newDebitors: 0,
				GroupBS_visible: false,
				MatchDeb_total: 0,
				MatchDeb_not_matched: 0,
				MatchDeb_full: 0,
				MatchDeb_part: 0,
				MatchDeb_visible: false
			});

			this.getOwnerComponent().getModel('debitor_table').setProperty("/", {
				unmatched_debitors: [],
				matched_debitors: [],
				forManuelMatch_debitors: []
			});

			// Set the SizeLimit of the ZFP_SRV Model to 2000 to avoid reloading. If more objects must loaded then we need to increase this value 
			// or better implement the reload (loading more elements )
			this.getOwnerComponent().getModel("ZFP_SRV").setSizeLimit(2000);

			// Load and sort the period data
			var that = this;
			this.getOwnerComponent().getModel("ZFP_SRV").read("/HolidayPassPeriodSet", {
				success: function(oData) {
					var oModel = that.getOwnerComponent().getModel("settings");
					var aAllPeriods = oData.results;
					var aPeriods = [];

					function _checkPeriodExists(sId, aPeriodsToCheck) {
						for (var _i = 0; aPeriodsToCheck.length > _i; _i++) {
							if (aPeriodsToCheck[_i].Id === sId) {
								return _i;
							}
						}
						return -1;
					}
					for (var i = 0; aAllPeriods.length > i; i++) {
						var iPosOfExistingPeriod = _checkPeriodExists(aAllPeriods[i].Id, aPeriods);
						if (iPosOfExistingPeriod === -1) { // Neue Periode
							var oPeriod = {
								Id: aAllPeriods[i].Id,
								Text: aAllPeriods[i].TextD
							};
							aPeriods.push(oPeriod);
						} else {
							aPeriods[iPosOfExistingPeriod].Text = aPeriods[iPosOfExistingPeriod].Text + "/" + aAllPeriods[i].TextD;
						}
					}

					function sortByKey(array, key) {
						return array.sort(function(a, b) {
							var x = a[key];
							var y = b[key];
							return ((x > y) ? -1 : ((x < y) ? 1 : 0));
						});
					}

					aPeriods = sortByKey(aPeriods, 'Id');
					that.getView().byId("oSelectPeriod").setSelectedKey(aPeriods[0].Id);
					oModel.setProperty("/selected_period", aPeriods[0].Id);
					oModel.setProperty("/periods", aPeriods);
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
				}
			});
		},

		handleStartManualDebitorSave: function() {
			sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel("ZFP_SRV").callFunction("/saveDebitorMapping", {
				method: "GET",
				success: function(oData) {
					MessageBox.success(oData.message);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},

		handleStartManualDebitorRestore: function() {
			sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel("ZFP_SRV").callFunction("/restoreDebitorMapping", {
				method: "GET",
				success: function(oData) {
					MessageBox.success(oData.message);
					sap.ui.core.BusyIndicator.hide();
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},

		_updateProductiveCheck: function() {
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel("ZFP_SRV").callFunction("/checkProductionState", {
				method: "GET",
				urlParameters: {
					periodId: sPeriod
				},
				success: function(oData) {
					var oMessageStrip = that.getView().byId("oMessageStripProductionCheck");
					oMessageStrip.setVisible(true);
					if (oData.ok) {
						oMessageStrip.setText("Daten konsistent");
						oMessageStrip.setType("Success");
					} else {
						oMessageStrip.setType("Warning");
						oMessageStrip.setText(oData.message);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});
		},

		handleOnSelectTabBar: function(oEvent) {
			switch (oEvent.getParameter("key")) {
				case "ExportPrintStep":
					this._updateProductiveCheck();
					break;
				case "ImportBookingStatementsStep":
					this.getOwnerComponent().getModel("ZFP_SRV").refresh(true);
					var oModel = this.getOwnerComponent().getModel('WebSocket_Updates');
					oModel.setProperty("/UploadState_visible", false);
					oModel.setProperty("/UploadStateAct_visible", false);
					oModel.setProperty("/GroupBS_visible", false);
					oModel.setProperty("/MatchDeb_visible", false);
					break;
				default:
			}
		},

		/**
		 * Löschen aller Daten
		 */
		handleClearAllData: function() {
			var that = this;
			MessageBox.warning("Sollen wirklich alle Daten von Ferienpass (ausser die Einstellung inkl. Pricing) gelöscht werden ?", {
				icon: MessageBox.Icon.WARNING,
				title: "ALLE DATEN LÖSCHEN ?",
				initialFocus: "Abbrechen",
				actions: ["Ja, alle Daten löschen", "Abbrechen"],
				onClose: function(sSelectedButton) {
					sap.ui.core.BusyIndicator.show(0);
					switch (sSelectedButton) {
						case "Ja, alle Daten löschen":
							var oModel = that.getOwnerComponent().getModel('ZFP_SRV');
							oModel.callFunction("/deleteAllData", {
								method: "GET",
								success: function(oData) {
									if (!oData.ok) {
										MessageBox.error(oData.message);
									}
									sap.ui.core.BusyIndicator.hide();
								},
								error: function() {
									MessageBox.error("Technischer Fehler, bitte SAP CCC informieren");
									sap.ui.core.BusyIndicator.hide();
								},
								async: true
							});

							break;
						case "Abbrechen":
							// Nichts zu tun !						
							break;
					}
				}
			});
		},

		/**
		 * Navigation zur Aktivitätsbearbeitung
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleMaintainActivity: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("MaintainActivity");
		},

		/**
		 * Navigation zur manuellen Debitoren-Zuweisung
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleStartManualDebitorMatching: function() {
			// Update JSON Model
			// debitorsToMapManual

			var that = this;
			var Filter = new sap.ui.model.Filter('NotMatch', 'EQ', true);
			this.getOwnerComponent().getModel("ZFP_SRV").read("/DebitorSet", {
				filters: [Filter],
				success: function(oData) {
					var aResult = oData.results;
					var aDataInModel = [];
					for (var i = 0; i < aResult.length; i++) {
						var oRow = {
							AdditionalName: aResult[i].AdditionalName,
							City: aResult[i].City,
							DebitorId: aResult[i].DebitorId,
							Firstname: aResult[i].Firstname,
							Lastname: aResult[i].Lastname,
							Street: aResult[i].Street,
							Zip: aResult[i].Zip
						};
						aDataInModel.push(oRow);
					}
					that.getOwnerComponent().getModel("debitorsToMapManual").setProperty("/",aDataInModel);
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
				},
				async : false
			});

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("AssignDebitorManualOverview");
		},

		/**
		 * Navigation zur Debitorennummern Generierung
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleOnCreateNewSAPDebitors: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("CreateNewSAPDebitors");
		},

		/**
		 * Navigation zur Debitoreditierung
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleDebitorEditing: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ChangeDebitorOverview");
		},

		/**
		 * Navigation zur Testdruck Seite
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handeTestPrint: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			oRouter.navTo("TestPrintInvoices", {
				Period: sPeriod
			});
		},

		handeCheckTarif: function() {
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/checkTarif", {
				method: "GET",
				urlParameters: {
					periodId: sPeriod
				},
				success: function(oData) {
					var aCheckResult = oData.results;
					var aDisplayCheckResult = [];
					var _findDebitorID = function(_aDisplayCheckResult, _sDebitorID) {
						for (var i = 0; _aDisplayCheckResult.length > i; i++) {
							if (_aDisplayCheckResult[i].DebitorId === _sDebitorID) {
								return i;
							}
						}
						return -1;
					};

					if (aCheckResult.length > 0) {
						for (var i = 0; aCheckResult.length > i; i++) {
							var iIndexOfExistingDisplayCheckResult = _findDebitorID(aDisplayCheckResult, aCheckResult[i].DebitorId);
							if (iIndexOfExistingDisplayCheckResult === -1) {
								// New
								aDisplayCheckResult.push({
									DebitorId: aCheckResult[i].DebitorId,
									Fullname: aCheckResult[i].FullnameParent,
									Childs: [{
										Fullname: aCheckResult[i].FullnameChild,
										Tarif: aCheckResult[i].Tarif
									}]
								});
							} else {
								// Add Child
								aDisplayCheckResult[iIndexOfExistingDisplayCheckResult].Childs.push({
									Fullname: aCheckResult[i].FullnameChild,
									Tarif: aCheckResult[i].Tarif
								});
							}
						}
						var oModelTarifMisMatch = that.getOwnerComponent().getModel('tarif_mismatch');
						oModelTarifMisMatch.setProperty("/period", sPeriod);
						oModelTarifMisMatch.setProperty("/tarifmismatch", aDisplayCheckResult);
						sap.ui.core.BusyIndicator.hide();
						oRouter.navTo("ResolveTarifMismatch");
					} else {
						// All okay, close show "Okay" message
						MessageBox.success("Pro Rechnung sind alle Tarife einheitlich.");
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});
		},

		/**
		 * Erzeugt das Exportfile, welches im SAP zur Debitoren- und Fakturaanlage verwendet wird
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleCreateSDExport: function() {
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/createSAPDebitorExport", {
				method: "GET",
				urlParameters: {
					Period: sPeriod
				},
				success: function(oData) {
					if (oData.Ok) {
						if (oData.ShowAsWarning) {
							that.getOwnerComponent().getModel("settings").setProperty("/oDialogSDExportMessageType", "Warning");
						} else {
							that.getOwnerComponent().getModel("settings").setProperty("/oDialogSDExportMessageType", "Success");
						}
						that.getOwnerComponent().getModel("settings").setProperty("/oDialogSDExportMessage", oData.Message);
						if (!that.oDialogSDExport) {
							that.oDialogSDExport = new Dialog({
								title: 'Erzeugtes SAP Debitoren Export File',
								type: 'Message',
								state: '{settings>/oDialogSDExportMessageType}',
								content: new sap.ui.layout.VerticalLayout({
									content: [
										new sap.m.Text({
											text: '{settings>/oDialogSDExportMessage}'
										})
									]
								}),
								beginButton: new Button({
									text: 'Close',
									press: function() {
										that.oDialogSDExport.close();
									}
								})
							});
							that.getView().addDependent(that.oDialogSDExport);
						}
						sap.ui.core.BusyIndicator.hide();
						that.oDialogSDExport.open();
					} else {
						MessageBox.error(oData.message);
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});
		},

		/**
		 * Erzeugt das Rechnungsprotokoll, welches vor dem Rechnungsdruck als Grundlage für den Debitoren- Faktura Upload unterschrieben
		 * werden muss und von Finanzen als Kontrolle verwendet wird.
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleCreateInvoiceProtocoll: function() {
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/createInvoiceProtocoll", {
				method: "GET",
				urlParameters: {
					Period: sPeriod
				},
				success: function(oData) {
					if (oData.Ok) {
						if (oData.ShowAsWarning) {
							that.getOwnerComponent().getModel("settings").setProperty("/oDialogCreateInvoiceProtocolMessageType", "Warning");
						} else {
							that.getOwnerComponent().getModel("settings").setProperty("/oDialogCreateInvoiceProtocolMessageType", "Success");
						}
						that.getOwnerComponent().getModel("settings").setProperty("/oDialogCreateInvoiceProtocolMessage", oData.Message);
						that.getOwnerComponent().getModel("settings").setProperty("/InvoiceProtocollURI", oData.WebURI);
						if (!that.oDialogInvoiceProtocoll) {
							that.oDialogInvoiceProtocoll = new Dialog({
								title: 'Erzeugtes Rechnungsprotokoll',
								type: 'Message',
								state: '{settings>/oDialogCreateInvoiceProtocolMessageType}',
								content: new sap.ui.layout.VerticalLayout({
									content: [
										new sap.m.Text({
											text: "{settings>/oDialogCreateInvoiceProtocolMessage}"
										}),
										new Link({
											id: "oLinkDisplayInvoiceProtocoll",
											text: "Rechnungsprotokoll anzeigen",
											target: "_blank",
											press: function() {
												var sURI = that.getOwnerComponent().getModel("settings").getProperty("/InvoiceProtocollURI");
												window.open(window.location.origin + sURI);
											}
										})
									]
								}),
								beginButton: new Button({
									text: 'Close',
									press: function() {
										that.oDialogInvoiceProtocoll.close();
									}
								})
							});
							that.getView().addDependent(that.oDialogInvoiceProtocoll);
						}
						that.oDialogInvoiceProtocoll.open();
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});
		},

		/**
		 * Startet das automatische Matching von Ferienpass zu SAP Debitoren
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleStartAutomaticDebitorenMatching: function() {
			this.initWebsocket("state_match_debi");
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/mapDebitorsToSAPDebitors", {
				method: "GET",
				success: function() {
					sap.ui.core.BusyIndicator.hide();
					that.socket.onclose();
				},
				error: function() {
					MessageBox.error("Technisches Problem aufgetreten, bitte SAP CCC informieren.");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},

		/**
		 * Navigation zur Druckseite
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handlePrint: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			oRouter.navTo("PrintInvoices", {
				Period: sPeriod
			});
		},

		/**
		 * Anlegen der Rechungsnummern
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleCreateInvoiceNumbers: function() {
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			var that = this;
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/createInvoiceNumbers", {
				method: "GET",
				urlParameters: {
					Period: sPeriod
				},
				success: function(oData) {
					if (oData.ok) {
						MessageBox.success(oData.message);
					} else {
						MessageBox.error(oData.message);
					}
					that._updateProductiveCheck();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function() {
					MessageBox.error("Es ist ein technischer Fehler aufgetreten, bitte SAP CCC informieren");
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},

		/**
		 * Gruppierung der einzelnen Buchungen zu Rechnungen
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleGroupBSPress: function() {
			var that = this;
			this.initWebsocket("state_group_bs");
			var sPeriod = this.getView().byId("oSelectPeriod").getSelectedKey();
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/groupBillingStatements", {
				method: "GET",
				urlParameters: {
					periodId: sPeriod
				},
				success: function(oData) {
					that.socket.onclose();
					if (!oData.ok) {
						MessageBox.error(oData.message);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.error(oError);
					that.socket.onclose();
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},
		/**
		 * Initialisierung eines WebSockets zu einem definierten Kanals
		 * @param {String} sChannelId  Channel-Id zu welcher connected werden soll
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		initWebsocket: function(sChannelId) {

			var hostLocation = window.location,
				socketHostURI, webSocketURI;
			if (hostLocation.protocol === "https:") {
				socketHostURI = "wss:";
			} else {
				socketHostURI = "ws:";
			}
			socketHostURI += "//" + hostLocation.host;
			webSocketURI = socketHostURI + '/sap/bc/apc/sap/zfp_apc_ferienpass/' + sChannelId;

			try {
				this.socket = null;
				var that = this;
				var socket = new WebSocket(webSocketURI);
				socket.onopen = function() {};
				//Create function for handling websocket messages
				var oModel = this.getOwnerComponent().getModel('WebSocket_Updates');

				switch (sChannelId) {
					case "state_match_debi":
						socket.onmessage = function(oMessage) {
							var aState = oMessage.data.split(":");
							oModel.setProperty("/MatchDeb_total", aState[0]);
							oModel.setProperty("/MatchDeb_not_matched", aState[1]);
							oModel.setProperty("/MatchDeb_full", aState[2]);
							oModel.setProperty("/MatchDeb_part", aState[3]);
							oModel.setProperty("/MatchDeb_visible", true);
						};
						break;
					case "state_upload_bs":
						socket.onmessage = function(oMessage) {
							switch (oMessage.data) {
								case "badFile":
									MessageBox.error("Das Buchungsfile ist korrupt, die Anzahl Spalten d.h. ; Zeichen ist nicht korrekt");
									that.socket.close();
									break;
								case "endOfUploadBS":
									that.socket.close();
									that.getOwnerComponent().getModel('ZFP_SRV').refresh(true);
									break;
								default:
									var aState = oMessage.data.split(":");
									oModel.setProperty("/UploadState_successfull", aState[0]);
									oModel.setProperty("/UploadState_failed", aState[1]);
									oModel.setProperty("/UploadState_visible", true);
							}
						};
						break;
					case "state_upload_act":
						socket.onmessage = function(oMessage) {
							switch (oMessage.data) {
								case "badFile":
									MessageBox.error("Das Buchungsfile ist korrupt, die Anzahl Spalten d.h. ; Zeichen ist nicht korrekt");
									that.socket.close();
									break;
								case "endOfUploadACT":
									//	MessageBox.success("Upload beendet");
									that.getOwnerComponent().getModel('ZFP_SRV').refresh(true);
									that.socket.close();
									break;
								default:
									var aState = oMessage.data.split(":");
									oModel.setProperty("/UploadStateAct_successfull", aState[0]);
									oModel.setProperty("/UploadStateAct_failed", aState[1]);
									oModel.setProperty("/UploadStateAct_act_with_no_booking", aState[2]);
									oModel.setProperty("/UploadStateAct_visible", true);
							}
						};

						break;
					case "state_group_bs":
						socket.onmessage = function(oMessage) {
							var aState = oMessage.data.split(":");
							oModel.setProperty("/GroupBS_items", aState[0]);
							oModel.setProperty("/GroupBS_newDebitors", aState[1]);
							oModel.setProperty("/GroupBS_visible", true);
						};
						break;
				}
				socket.onclose = function() {
					if (socket != null) {
						socket.close();
						socket = null;
					}
				};
				this.socket = socket;
			} catch (exception) {
				MessageBox.error("Fehler beim Setup des Websockets" + exception);
			}
		},

		/**
		 * Startet Update der KNA1 Suchdaten
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleCreateKN1SearchData: function() {
			var oModel = this.getOwnerComponent().getModel('ZFP_SRV');
			sap.ui.core.BusyIndicator.show(0);
			oModel.callFunction("/updateKNA1SearchData", {
				method: "GET",
				success: function(oData) {
					if (oData.ok) {
						MessageBox.success(oData.message);
					} else {
						MessageBox.error(oData.message);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.error(oError);
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});

		},

		/**
		 * Startet das Backup der Altdaten
		 * Im Moment nicht mehr aktiv, da ausgeblendet
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleStoreOldData: function() {
			sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel('ZFP_SRV').callFunction("/backupOldData", {
				method: "GET",
				urlParameters: {
					entity: 'period'
				},
				success: function(oData) {
					if (oData.ok) {
						MessageBox.success(oData.message);
						sap.ui.core.BusyIndicator.hide();
					} else {
						MessageBox.error(oData.message);
						sap.ui.core.BusyIndicator.hide();
					}
				},
				error: function(oError) {
					MessageBox.error(oError);
					sap.ui.core.BusyIndicator.hide();
				},
				async: true
			});
		},

		/**
		 * Zeigt Messagebox nachdem ein Upload beendet wurde
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleUploadComplete: function() {
			sap.ui.core.BusyIndicator.hide();
		},

		/**
		 * Start des Uploads
		 * @param {sap.ui.base.Event} oEvent  Event Object, mit welchem ermittelt wird, um was für einen Upload es sich handelt
		 * @memberOf ch.bielbienne.HolidayPassHolidayPassProcessing.view.Main
		 */
		handleUploadPress: function(oEvent) {
			var sItem = oEvent.getSource().getId();
			var sFileType = sItem.substring(sItem.lastIndexOf("oButtonUpload") + 13, sItem.length);
			var sFileUploaderId = "";
			var sWebSocketChannel = "";
			switch (sFileType) {
				case "Activity":
					sFileUploaderId = "fileUploaderActivity";
					sWebSocketChannel = "state_upload_act";
					break;
				case "Booking":
					sFileUploaderId = "fileUploaderBooking";
					sWebSocketChannel = "state_upload_bs";
					break;
			}

			var oFileUploader = this.getView().byId(sFileUploaderId);
			var sFileName = oFileUploader.getValue();
			var Service1 = window.location.origin + "/sap/opu/odata/sap/ZFP_SRV/FileSet('onlyfor_x-csrf-token')";
			var token = "";
			jQuery.ajax({
				url: Service1,
				type: "GET",
				async: false,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				success: function(data, textStatus, XMLHttpRequest) {
					token = XMLHttpRequest.getResponseHeader('X-CSRF-Token');
				}
			});

			oFileUploader.destroyHeaderParameters();
			oFileUploader.setSendXHR(true);
			this.csrfToken = token;
			var headerParma = new sap.ui.unified.FileUploaderParameter();
			headerParma.setName('x-csrf-token');
			headerParma.setValue(this.csrfToken);

			oFileUploader.addHeaderParameter(headerParma);

			headerParma = new sap.ui.unified.FileUploaderParameter();
			headerParma.setName('Slug');
			headerParma.setValue(sFileType + ';' + sFileName);

			oFileUploader.addHeaderParameter(headerParma);
			this.initWebsocket(sWebSocketChannel);
			sap.ui.core.BusyIndicator.show(0);
			oFileUploader.upload();
		},

		getNumber: function(sNumber) {
			return parseInt(sNumber);
		}
	});
});