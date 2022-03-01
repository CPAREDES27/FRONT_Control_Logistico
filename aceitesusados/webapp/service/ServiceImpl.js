sap.ui.define([
	"../controller/Utilities",
	"sap/m/MessageBox",


], function (Utilities, MessageBox) {
	"use strict";

	return {
		onCallConstantesService: async function (body) {

			let aConstantes;
			await fetch(`${Utilities.onLocation()}General/ConsultaGeneral/`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					aConstantes = data;
				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);
			return aConstantes;
		},
		onLoadCombosService: async function (body) {
			let aCombos;
			await fetch(`${Utilities.onLocation()}dominios/Listar`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					aCombos = data
				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);

			return aCombos;
		},
		onLlenarPlantaService: async function (body) {

			let aPlantas;
			await fetch(`${Utilities.onLocation()}General/Read_Table/`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {

					aPlantas = data;

				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);

			return aPlantas;
		},
		onBusquedaService: async function (body) {

			let aBusqueda;
			await fetch(`${Utilities.onLocation()}aceitesusados/Listar`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					aBusqueda = data;

				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);

			return aBusqueda;
		},
		onAnularPrecioService: async function (body) {
			let aAnularPrecio;

			await fetch(`${Utilities.onLocation()}aceitesusados/Anular`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {

					aAnularPrecio = data;
				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);

			return aAnularPrecio;
		},
		onGuardarService: async function (body) {
			let aGuardar;
			await fetch(`${Utilities.onLocation()}aceitesusados/Nuevo`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {
					aGuardar = data;

				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);

			return aGuardar;
		},
		onListaEmbarcacionService: async function () {
			let aListaEmbarcacion;
			await fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
				{
					method: 'POST',
					body: JSON.stringify(body)
				})
				.then(resp => resp.json()).then(data => {

					aListaEmbarcacion = data;
				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);
			return aListaEmbarcacion;
		},
		onSearchEmbarcacionService: function (oBody) {

			let aSearcEmbarcacion;

			fetch(`${Utilities.onLocation()}embarcacion/ConsultarEmbarcacion/`,
				{
					method: 'POST',
					body: JSON.stringify(oBody)
				})
				.then(resp => resp.json()).then(data => {
					aSearcEmbarcacion = data;
				}).catch((error) => {
					MessageBox.error("Ocurrió un error en la carga, favor de actualizar");
					console.log(error);
					oGlobalBusyDialog.close();
				}
				);

			return aSearcEmbarcacion;	
		},
	}
});