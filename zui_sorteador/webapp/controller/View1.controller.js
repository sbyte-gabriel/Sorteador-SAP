sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "js-confetti",
    "sap/ui/core/Fragment"
  ],
  (Controller, MessageToast, JSConfetti, Fragment) => {
    "use strict";

    return Controller.extend("zuisorteador.controller.View1", {
      onInit: function () {
        if (JSConfetti) {
          this._jsConfetti = new JSConfetti();
        } else {
          console.log("JSConfetti não está disponível.");
        }

        this._pDialog = null;
      },

      _openWinnerDialog() {
        const oView = this.getView();
        if (!this._pDialog) {
          this._pDialog = Fragment.load({
            id: oView.getId(),
            name: "zuisorteador.view.WinnerDialog",
            controller: this
          }).then((oDialog) => {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        this._pDialog.then((oDialog) => oDialog.open());
      },
      onDialogAfterOpen() {
        if (this._jsConfetti) {
          this._jsConfetti.addConfetti({
            confettiNumber: 100,
            emojis: ["🎉", "✨", "🏆"]
            // opcional: limitar cores, ângulo, ...
          });
        } else {
          console.warn("JSConfetti não disponível para animar confetti");
        }
      },

      onFileChange: function (oEvent) {
        const files = oEvent.getParameter("files");
        const file = files && files[0];
        if (!file) {
          MessageToast.show("Nenhum arquivo selecionado.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = reader.result;
          if (typeof result !== "string") {
            MessageToast.show("Erro: o conteúdo lido não é texto.");
            return;
          }

          const str = result;
          const rows = str.trim().split(/\r?\n/);

          if (rows.length < 2) {
            MessageToast.show("CSV inválido ou sem dados.");
            return;
          }

          const headers = rows
            .shift()
            .split(";")
            .map((h) => h.trim());
          const data = rows.map((row) => {
            const cleanRow = row.replace(/;$/, "");
            const cells = cleanRow.split(";");
            const obj = {};
            headers.forEach((h, i) => {
              obj[h] = (cells[i] || "").trim();
            });
            return obj;
          });

          const oModel = new sap.ui.model.json.JSONModel({ data });
          this.getView().setModel(oModel);
          MessageToast.show("Arquivo importado com sucesso!");
        };
        reader.onerror = () => MessageToast.show("Falha ao ler o arquivo.");

        reader.readAsText(file, "UTF-8");
      },

      _showConfetti: function () {
        JSConfetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
      },

      onDialogClose: function () {
        const oDialog = this.getView().byId("winnerDialog");
        if (oDialog) {
          oDialog.close();
          oDialog.destroy();
        }
        this._pDialog = null;
      },

      onSortear: function () {
        const oModel = this.getView().getModel();
        const aData = oModel.getProperty("/data") || [];
        const aDataDrawn = oModel.getProperty("/dataDrawn") || [];

        if (!aData.length) {
          MessageToast.show("Importe os dados antes de sortear.");
          return;
        }

        const iIndex = Math.floor(Math.random() * aData.length);
        const oParticipant = aData.splice(iIndex, 1)[0];

        // Adiciona o participante no início da lista de sorteados
        aDataDrawn.unshift(oParticipant);

        oModel.setProperty("/data", aData);
        oModel.setProperty("/dataDrawn", aDataDrawn);
        oModel.setProperty("/ultimoSorteado", oParticipant); // Adiciona o novo participante sorteado

        this._openWinnerDialog();
      }
      // MessageToast.show(`Sorteado: ${nome}`);
    });
  }
);
