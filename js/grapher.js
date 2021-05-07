document.addEventListener("DOMContentLoaded", function () {
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
        elements: {
            nodes: [
                { data: { id: "e"} },
                { data: { id: "g"} },
            ],
            edges: [{ data: { source: "g", target: "e" } }],
        },
    }));

    var eh = cy.edgehandles();

    let btnAddNode = document.getElementById("btn-add-node");
    btnAddNode.addEventListener("click", function (e) {
        let nodeId = document.getElementById("add-node").value;
        if (nodeId != "") {
            cy.add({
                data: {
                    id: nodeId,
                },
            });
        }
    });

    let btnRemoveNode = document.getElementById("btn-remove-node");
    btnRemoveNode.addEventListener("click", function(e) {
        let nodeId = document.getElementById("remove-node").value;
        try {
            let node = cy.getElementById(nodeId);
            cy.remove(node);
        } catch (error) {
            console.log("Couldn't find node: "+ nodeId)
        }
    })
});