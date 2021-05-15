import welshPowell from "./welshPowell.js";
/**
 * save current elements to local storage. Used as default value of cytoscape object
 */
function setElementsStorage() {
  localStorage.setItem("elements", JSON.stringify(cy.json().elements));
}

document.addEventListener("DOMContentLoaded", function () {
  // Memuat list element terakhir yang dibuat
  let savedElements = JSON.parse(localStorage.getItem("elements"));
  try {
    if (
      savedElements.hasOwnProperty("nodes") ||
      savedElements.hasOwnProperty("edges")
    ) {
      if (savedElements.nodes) {
        savedElements.nodes = savedElements.nodes.filter((node) => {
          return !(
            node.classes.includes("eh-handle") ||
            node.classes.includes("eh-ghost")
          );
        });
      }

      if (savedElements.edges) {
        savedElements.edges = savedElements.edges.filter((edge) => {
          return !(
            edge.classes.includes("eh-handle") ||
            edge.classes.includes("eh-ghost")
          );
        });
      }
    } else {
      savedElements = {
        nodes: [],
        edges: [],
      };
    }
  } catch (e) {
    savedElements = {
      nodes: [],
      edges: [],
    };
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
          "background-color": "white",
          "border-width": "2px",
          "border-style": "solid",
          "border-color": "black",
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
        rerender();
      } catch (error) {
        console.log("An error has occured upon adding node:" + nodeId);
      }
    }
    // const nodes = cy
    //   .elements()
    //   .jsons()
    //   .filter((element) => element.group === "nodes");
    // welshPowell(nodes);
  });

  let btnRemoveNode = document.getElementById("btn-remove");
  btnRemoveNode.addEventListener("click", function (e) {
    try {
      cy.remove(cy.$(":selected"));
      setElementsStorage();
      rerender();
    } catch (e) {
      console.log("Error couldn't locate object!");
    }
  });

  function rerender() {
    cy.layout({
      name: "circle",
      animate: true,
      animationDuration: 500,
      animationEase: "ease-in-out",
      directed: false,
    }).run();
  }

  let rerenderBtn = document.getElementById("btn-rerender");
  rerenderBtn.addEventListener("click", function (e) {
    rerender();
  });

  let btnColorNodes = document.getElementById("btn-color-nodes");
  btnColorNodes.addEventListener("click", function (e) {
    const nodes = cy
      .elements()
      .jsons()
      .filter((element) => element.group === "nodes");
    welshPowell(nodes);

    cy.on("startColoring", function () {
      document.getElementById("chromatic-number").innerText = "";
      document.getElementById("delta").innerText = "";
      resetTable();
    });

    cy.on("finished", function () {
      document.getElementById("chromatic-number").innerText =
        getChromaticNumber();
      document.getElementById("delta").innerText = getDelta();
      resetTable();
      loadTableData();
    });
  });

  let btnExport = document.getElementById("btn-export");
  btnExport.addEventListener("click", function (e) {
    saveAs(cy.jpg({ full: true, quality: 1 }), "graph.jpg");
  });

  cy.on("ehcomplete", function (e) {
    setElementsStorage();
  });

  function getChromaticNumber() {
    let colors = getSortedColoredNodes();
    return Object.keys(colors).length;
  }

  function getDelta() {
    let delta = 0;

    cy.nodes().forEach((node) => {
      delta =
        node.connectedEdges().length > delta
          ? node.connectedEdges().length
          : delta;
    });

    return delta;
  }

  function getNodeColor(v) {
    return v.style()["background-color"];
  }

  function getSortedColoredNodes() {
    let output = {};

    let nodes = cy.nodes();

    nodes = nodes.filter((node) => {
      return !(node.hasClass("eh-handle") || node.hasClass("eh-ghost"));
    });
    nodes.forEach((node) => {
      if (output[getNodeColor(node)] == undefined) {
        output[getNodeColor(node)] = [node];
      } else {
        output[getNodeColor(node)].push(node);
      }
    });

    return output;
  }

  function getNodeId(v) {
    return v.data()["id"];
  }

  function resetTable() {
    let table = document.getElementById("t-body");
    table.innerHTML = "";
  }

  function loadTableData() {
    let table = document.getElementById("t-body");
    let sortedNodes = getSortedColoredNodes();
    let counter = 1;
    Object.keys(sortedNodes).forEach((key) => {
      sortedNodes[key].forEach((node) => {
        let row = table.insertRow();
        let no = row.insertCell(0);
        let color = row.insertCell(1);
        let tNode = row.insertCell(2);
        color.style.backgroundColor = getNodeColor(node);
        color.classList.add("px-6", "py-4", "whitespace-nowrap");
        color.innerHTML = getNodeColor(node);
        no.innerHTML = counter;
        no.classList.add("px-6", "py-4", "whitespace-nowrap");
        tNode.innerHTML = getNodeId(node);
        tNode.classList.add("px-6", "py-4", "whitespace-nowrap");
        counter++;
      });
    });
  }
});
