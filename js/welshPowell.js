/**
 *
 * @param nodeList a list of all nodes of Cytoscape
 */
export default function welshPowell(nodeList) {
  // Emit start event
  cy.emit("startColoring");

  let hasAnimations = document.getElementById("toggle").checked;

  // Set default colour to all vertex

  cy.nodes().forEach((node) => {
    if (
      !(
        node.classes().includes("eh-handle") ||
        node.classes().includes("eh-ghost")
      )
    ) {
      node.style({ "background-color": "#fff" });
    }
  });

  // Adjacency list
  let adjList = [];

  // Filter original node
  let realNodes = nodeList.filter((node) => {
    return !(
      node.classes.includes("eh-handle") || node.classes.includes("eh-ghost")
    );
  });

  realNodes = realNodes.filter((node) => node.data.id.length <= 20);

  // List of node id
  const nodesId = realNodes.map((node) => node.data.id);
  const colorList = [];

  nodesId.forEach((node) => {
    let currentNode = cy.$(`#${node}`);

    const neighbors = currentNode.neighborhood("node").map((node) => node.id());

    adjList.push({
      id: currentNode.id(),
      neighbors,
      degree: currentNode.degree(),
    });
  });

  // Sort descending based on the number of degrees
  adjList.sort(function (a, b) {
    return b.degree - a.degree;
  });

  // Holds the vertex that has been coloured
  const colored = [];

  for (let i = 0; i < adjList.length; i++) {
    // Hold adjacent vertices
    const adjacent = new Set();

    if (!colored.includes(adjList[i].id)) {
      // Holds Vertex with same colour
      const sameNodeColor = [];

      sameNodeColor.push(adjList[i].id);

      colored.push(adjList[i].id);

      adjList[i].neighbors.forEach((node) => adjacent.add(node));

      for (let j = i + 1; j < adjList.length; j++) {
        if (!(adjacent.has(adjList[j].id) || colored.includes(adjList[j].id))) {
          sameNodeColor.push(adjList[j].id);
          colored.push(adjList[j].id);
          adjList[j].neighbors.forEach((node) => adjacent.add(node));
        }
      }

      // Generate random colour
      const color = randomColor();
      colorList.push({
        nodes: sameNodeColor,
        color,
      });
    }
  }

  let waitingTime = 0;
  for (let i = 0; i < colorList.length; i++) {
    let nodes = colorList[i].nodes;
    let color = colorList[i].color;

    nodes.forEach((node) => {
      setTimeout(function () {
        cy.$(`#${node}`).style({ "background-color": color });
      }, (200 + waitingTime)*hasAnimations);
      waitingTime = (waitingTime + 200) * hasAnimations;
    });

    waitingTime = (waitingTime + 500) * hasAnimations;
  }

  setTimeout(() => {
    cy.emit("finished");
  }, waitingTime);
}
