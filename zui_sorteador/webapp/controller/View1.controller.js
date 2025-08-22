sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("zuisorteador.controller.View1", {
      onInit: function () {
        if (window.JSConfetti) {
          this._jsConfetti = new window.JSConfetti();
        } else {
          console.warn(
            "JSConfetti não foi definido. Verifique o script no index.html."
          );
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

      showConfetti: function (amount = 50) {
        for (let i = 0; i < amount; i++) {
          const confetti = document.createElement("div");
          confetti.classList.add("confetti");
          document.body.appendChild(confetti);

          // Estilos e animações para o confete
          confetti.style.position = "absolute";
          confetti.style.top = `${Math.random() * window.innerHeight}px`;
          confetti.style.left = `${Math.random() * window.innerWidth}px`;
          confetti.style.width = "10px";
          confetti.style.height = "10px";
          confetti.style.backgroundColor = this._getRandomColor();
          confetti.style.animation = "fall 5s ease-in-out forwards";

          // Remover o confete após a animação
          setTimeout(() => {
            confetti.remove();
          }, 5000);
        }
      },
      _getRandomColor: function () {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
        aDataDrawn.push(oParticipant);

        oModel.setProperty("/data", aData);
        oModel.setProperty("/dataDrawn", aDataDrawn);

        const nome =
          oParticipant.nome ||
          oParticipant.number ||
          JSON.stringify(oParticipant);
        MessageToast.show(`Sorteado: ${nome}`);
        this.showConfetti();
      }
    });
  }
);
