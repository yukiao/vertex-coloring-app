/**
 * save current elements to local storage. Used as default value of cytoscape object
 */
function setElementsStorage() {
  localStorage.setItem("elements", JSON.stringify(cy.json().elements));
}

document.addEventListener("DOMContentLoaded", function () {
  var selectedItem;

  // Memuat list element terakhir yang dibuat
  let savedElements = JSON.parse(localStorage.getItem("elements"));
  if (savedElements) {
    savedElements.nodes = savedElements.nodes.filter((node) => {
      return !(
        node.classes.includes("eh-handle") || node.classes.includes("eh-ghost")
      );
    });
    savedElements.edges = savedElements.edges.filter((edge) => {
      return !(
        edge.classes.includes("eh-handle") || edge.classes.includes("eh-ghost")
      );
    });
  }

  // Inisialisasi objek cytoscape

  var cy = (window.cy = cytoscape({
    // container merujuk pada id dari element html untuk menampung hasil dari graph
    container: document.getElementById("cy"),

    // menonaktifkan fitur zoom dengan mouse wheel
    zoomingEnabled: true,

    // layout dari graph berbentuk circle
    layout: {
      name: "circle",
      animate: true,
      animationDuration: 500,
      animationEase: "ease-in-out",
      directed: false,
    },

    // style default
    style: [
      {
        selector: "node",
        style: {
          content: "data(id)",
          width: 50,
          height: 50,
          "font-size": "18px",
          "text-valign": "center",
          "text-halign": "center",
        },
      },
      {
        selector: "edge",
        style: {
          "curve-style": "bezier",
        },
      },

      // some style for the extension
      {
        selector: ".eh-handle",
        style: {
          "background-color": "red",
          width: 12,
          height: 12,
          shape: "ellipse",
          "overlay-opacity": 0,
          "border-width": 12, // makes the handle easier to hit
          "border-opacity": 0,
          content: "",
        },
      },

      {
        selector: ".eh-hover",
        style: {
          "background-color": "red",
        },
      },

      {
        selector: ".eh-source",
        style: {
          "border-width": 2,
          "border-color": "red",
        },
      },

      {
        selector: ".eh-target",
        style: {
          "border-width": 2,
          "border-color": "red",
        },
      },

      {
        selector: ".eh-preview, .eh-ghost-edge",
        style: {
          "background-color": "red",
          "line-color": "red",
          "target-arrow-color": "red",
          "source-arrow-color": "red",
        },
      },

      {
        selector: ".eh-ghost-edge.eh-preview-active",
        style: {
          opacity: 0,
        },
      },
    ],

    // List elements default saat instansiasi objek cy
    elements: savedElements,
  }));

  var eh = cy.edgehandles();

  let btnAddNode = document.getElementById("btn-add-node");
  btnAddNode.addEventListener("click", function (e) {
    let nodeId = document.getElementById("add-node").value;
    if (nodeId != "") {
      try {
        cy.add({
          group: "nodes",
          data: {
            id: nodeId,
          },
        });

        // Membersihkan input field
        document.getElementById("add-node").value = "";
        setElementsStorage();

        cy.layout({
          name: "circle",
          animate: true,
          animationDuration: 500,
          animationEase: "ease-in-out",
          directed: false,
        }).run();
      } catch (error) {
        console.log("An error has occured upon adding node:" + nodeId);
      }
    }
  });

  let btnRemoveNode = document.getElementById("btn-remove");
  btnRemoveNode.addEventListener("click", function (e) {
    try {
      cy.remove(selectedItem);
      setElementsStorage();
      cy.layout({
        name: "circle",
        animate: true,
        animationDuration: 500,
        animationEase: "ease-in-out",
        directed: false,
      }).run();
    } catch (e) {
      console.log("Error couldn't locate object!");
    }
  });

  cy.on("ehcomplete", function (e) {
    setElementsStorage();
  });

  cy.on("tap", function (event) {
    selectedItem = event.target;
  });
});
