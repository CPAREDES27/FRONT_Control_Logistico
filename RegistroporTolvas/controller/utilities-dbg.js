sap.ui.define([
	"./utilities",
], function () {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {

        sBackUrl: "https://cf-nodejs-qas.cfapps.us10.hana.ondemand.com",

		getDataFromRFC: function (sType) {
            
            let oReq = {
                "dominios": [
                    // {
                    //     "domname": "UBICPLANTA",
                    //     "status": "A"
                    // },
                    // {
                    //     "domname": "ZINPRP",
                    //     "status": "A"
                    // },
                    {
                        "domname": sType,
                        "status": "A"
                    }
                ]
            };

            return fetch(`${this.sBackUrl}/api/dominios/Listar`, {
                method: 'POST',
                body: JSON.stringify(oReq)
                })
                .then(response => response.json())
                // .then(data => console.log(data));
                .then(data => data.data);
        },

        getDataFromReadTable: function(sTableName, aOption, aField, sOrder, iRowCount){
            let oReq = {
                "delimitador": "|",
                "fields": aField,
                "no_data": "",
                // "option": aOption,
                // "options": [],
                "option": [],
                "options": aOption,
                "order": sOrder,
                "p_user": "FGARCIA",
                "rowcount": iRowCount,
                "rowskips": 0,
                "tabla": sTableName
            };

            return fetch(`${this.sBackUrl}/api/General/Read_Table/`, {
                method: 'POST',
                // headers: {
                //     "Accept": "application/json"
                // },
                body: JSON.stringify(oReq)
                })
                .then(response => response.json())
                // .then(data => console.log(data));
                .then(data => data.data);
        },

        getDataFromRegistroTolvas: function(aOption, aField, iRowCount){
            let oReq = {
                "p_user": "FGARCIA",
                "fields": aField,
                "rowcount": iRowCount,
                "p_options": [],
                "p_option": aOption
            };

            return fetch(`${this.sBackUrl}/api/tolvas/registrotolvas_listar`, {
                method: 'POST',
                body: JSON.stringify(oReq)
                })
                .then(response => response.json())
                .then(data => data.data);
        },

        updateFieldTableRFC : function(aStrSet){
            // NMTAB: NOMBRE DE LA TABLA
            // CMSET: VALOR A ACTUALIZAR
            // CMOPT: LA TUPLA CON ESA CONDICION
            // [
            //     {
            //         "cmopt": "",
            //         "cmset": "",
            //         "nmtab": ""
            //     }
            // ]
            let oReq = {
                "p_user": "FGARCIA",
                "str_set": aStrSet
            };
            return fetch(`${this.sBackUrl}/api/General/Update_Camp_Table/`, {
                method: 'POST',
                body: JSON.stringify(oReq)
                })
                .then(response => response.json())
                .then(data => data.data);
        },

        updateRowTable: function(sNameTable, aOpcion, oCondition){
            let oReq = {
                "data": "",
                "flag": 'X',
                "fieldWhere": oCondition.sFieldWhere,
                "keyWhere": oCondition.sKeyWhere,
                "opcion": aOpcion,
                "p_case": 'E',
                "p_user": "FGARCIA",
                "tabla": sNameTable
            };
            
            return fetch(`${this.sBackUrl}/api/General/Update_Table2/`, {
                method: 'POST',
                body: JSON.stringify(oReq)
                })
                .then(response => response.json())
                .then(data => data.data);
        },
        
        getDataFromDominios: function (aType) {
            let aDominios = [];

            aType.forEach(element => {
                aDominios.push({
                    "domname": element,
                    "status": "A"
                })
            });
            
            let oReq = {
                "dominios": aDominios
            };

            return fetch(`${this.sBackUrl}/api/dominios/Listar`, {
                method: 'POST',
                body: JSON.stringify(oReq)
                })
                .then(response => response.json())
                // .then(data => console.log(data));
                .then(data => data.data);
        },

		obtenerCentros: function(usuario){
			const bodyAyudaBusqueda = {
				"nombreAyuda": "BSQCENTRO",
				"p_user": usuario
			};

			return fetch(`${this.sBackUrl}/api/General/AyudasBusqueda/`, {
                method: 'POST',
                body: JSON.stringify(bodyAyudaBusqueda)
                })
                .then(response => response.json())
                // .then(data => console.log(data));
                .then(data => data.data);
		},

		obtenerEmbarcaciones: function(body){
			
			return fetch(`${this.sBackUrl}/api/embarcacion/ConsultarEmbarcacion/`, {
                method: 'POST',
                body: JSON.stringify(body)
                })
                .then(response => response.json())
                // .then(data => console.log(data));
                .then(data => data.data);
		},

		enviarNotificacion: function(planta, data){
			var body = {
				"data": data,
				"planta": planta
			};
			return fetch(`${this.sBackUrl}/api/correo/EnviarNotifDescTolvas`, {
                method: 'POST',
                body: JSON.stringify(body)
                })
                .then(response => response.json())
                // .then(data => console.log(data));
                .then(data => data);
		},

		formaterx: function (value) {

			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd/MM/yyyy"
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}

        },
        getUserLogged: function(){
            let oModelx = new sap.ui.model.json.JSONModel();
            oModelx.loadData("/services/userapi/currentUser");

            return new Promise(function(fnResolve) {
                oModelx.attachRequestCompleted(function onCompleted(oEvent) {
                    if (oEvent.getParameter("success")) {
                        // this.setData({
                        //     "json": this.getJSON(),
                        //     "status": "Success"
                        // }, true);
                        let userLogin = this.getData().email.split('@');
                        controlUtil.setCurrentUser(userLogin[0]);
                        resolve(userLogin[0]);
                    } else {
                        let msg = oEvent.getParameter("errorObject").textStatus;
                        reject(msg);
                    }
                });
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					sap.m.MessageBox.error('Error Login: ' + err);
				}
            });
        },

		obtenerCadenaCorreosIdp: function (cadenaUsuario) {
			var self = this;
			var cadenaCorreo = "";

			if (cadenaUsuario !== null && cadenaUsuario !== '' && cadenaUsuario.length > 0) {
				cadenaUsuario = cadenaUsuario.split(',');
				var count = 0;
				for (var i = 0; i < cadenaUsuario.length; i++) {
					
					var loginName = cadenaUsuario[i].split('.');
					loginName = loginName[0];
					//loginName = loginName.trim();
					var url_data = "/IdentityProviderDestination/service/scim/Users?filter= userName eq '" + loginName +
						"'&$format=json";
					var aData = jQuery.ajax({
						method: 'GET',
						async: false,
						cache: false,
						url: url_data
					}).then(function successCallback(response) {
						count++;
						var arrResources = response.Resources;
						arrResources = arrResources[0];
						var correo = arrResources.emails;
						correo = correo[0].value;
						if(count === 1) {
							cadenaCorreo = correo;
						}else {
							cadenaCorreo = cadenaCorreo + "," + correo;
						}
					}, function errorCallback(response) {
						console.log("error idp valores : " + response);
					});
				}
			}

			return cadenaCorreo;
		},
		eventIsDefinedNavigate: function (oEvt) {
			var ok = true;
			try {
				var oArgument = oEvt.getParameter("arguments");
			} catch (err) {
				ok = false;
			}
			return ok;
		},
		isEmpty: function (inputStr) {

			var flag = false;
			if (inputStr === '') {
				flag = true;
			}
			if (inputStr === null) {
				flag = true;
			}
			if (inputStr === undefined) {
				flag = true;
			}
			if (inputStr === null) {
				flag = true;
			}

			return flag;
		},
		getTimeStampLocal: function () {
			var d = new Date();
			var offset = (0 - d.getTimezoneOffset() / 60);
			var newDate = new Date(
				d.getTime() + offset * 3600 * 1000
			).toUTCString().replace(/ GMT$/, "");
			return d.getTime() + offset * 3600 * 1000;
		},
		getValuesIndicator: function (key) {
			var arr = [{
				Text: "Yes",
				Selected: true
			}, {
				Text: "No",
				Selected: false
			}];
			if (key != null) {
				arr = [];
				var select = key.charAt(0);
				if (select == 'Y') {
					arr = [{
						Text: "Yes",
						Selected: true
					}, {
						Text: "No",
						Selected: false
					}];

				} else {
					arr = [{
						Text: "Yes",
						Selected: false
					}, {
						Text: "No",
						Selected: true
					}];

				}
			}
			return arr;
		},
		listYear: function (startYear) {
			var currentYear = new Date().getFullYear(),
				years = [];
			startYear = startYear || 1980;

			while (startYear <= currentYear) {
				years.push(startYear++);
			}

			return years;
		},
		validateFechas: function (letter_date, recept_date) {

			var fecActaul = this.getTimeStampLocal();

			var flag = true;
			if (!this.isEmpty(letter_date) && !this.isEmpty(recept_date)) {

				var split = letter_date.split('/');
				var date = new Date(split[2], split[1] - 1, split[0]); //Y M D 
				var timestamp = date.getTime();

				//Recept Date office

				var splitx = recept_date.split('/');
				var datex = new Date(splitx[2], splitx[1] - 1, splitx[0]); //Y M D 
				var timestampx = datex.getTime();

				if (timestampx > fecActaul) {
					flag = false;
				} else {
					if (timestamp > timestampx) {
						flag = false;
					}
				}
			}
			return flag;

		},
		obtenerGetTime: function (date_f) {
			var splitx = date_f.split('/');
			var datex = new Date(splitx[2], splitx[1] - 1, splitx[0]); //Y M D 
			var timestampx = null;
			timestampx = datex.getTime();
			timestampx = '/Date(' + timestampx + ')/';
			return timestampx;
		},
		isNumeric: function (n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		},
		verificarDuplicidadCopia: function (sender, strCopy) {

			var newCopy = '';
			if (!this.isEmpty(strCopy)) {
				sender = sender.toLowerCase();
				strCopy = strCopy.toLowerCase();
				var listaCopy = strCopy.split(',');

				for (var i = 0; i < listaCopy.length; i++) {
					if (listaCopy[i] !== sender) {
						newCopy = newCopy + listaCopy[i] + ',';
					}

				}
				//newCopy = newCopy.substring(0, newCopy.length - 1);
				if (!this.isEmpty(newCopy)) {
					newCopy = newCopy.slice(0, -1);
				}

			}
			return newCopy;
		},
		letraCapital: function (cadena) {
			var txt = '';
			if (!this.isEmpty(cadena)) {
				txt = cadena.toLowerCase();
				txt = txt.charAt(0).toUpperCase() + txt.slice(1);
			}

			return txt;
		}

	};
});