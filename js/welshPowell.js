/**
 *
 * @param nodeList List of all node of cytoscape instance
 */
export default function welshPowell(nodeList) {
  let adjList = [];

  // Filter original node
  const realNodes = nodeList.filter((node) => {
    return !(
      node.classes.includes("eh-handle") || node.classes.includes("eh-ghost")
    );
  });

  // List of node id
  const nodesId = realNodes.map((node) => node.data.id);
  const colorList = [];

  nodesId.forEach((node) => {
    let currentNode = cy.$(`#${node}`);
    // console.log(currentNode.id() + " - " + currentNode.degree());

    const neighbors = currentNode.neighborhood("node").map((node) => node.id());
    // adjList[currentNode.id()] = {
    //   neighbors,
    //   degree: currentNode.degree(),
    // };
    adjList.push({
      id: currentNode.id(),
      neighbors,
      degree: currentNode.degree(),
    });
    // neighbors.forEach((node) => console.log(node.id()));
    // console.log("-------------------------------------------------------");
  });

  adjList.sort(function (a, b) {
    return b.degree - a.degree;
  });

  //   console.log(nodeList);

  const colored = [];

  for (let i = 0; i < adjList.length; i++) {
    const adjacent = new Set();
    if (!colored.includes(adjList[i].id)) {
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

      const color = randomColor();
      colorList.push({
        nodes: sameNodeColor,
        color,
      });
    }
  }

  console.log(colorList);

  // for (let i = 0; i < adjList.length; i++) {
  //   if (!colored.includes(adjList[i].id)) {
  //     colored.push(adjList[i].id);

  //     let sameColor = nodesId.filter(
  //       (node) => !adjList[i].neighbors.includes(node)
  //     );

  //     sameColor = sameColor.filter((node) => !colored.includes(node));

  //     if (sameColor.length) {
  //       sameColor.forEach((node) => colored.push(node));
  //     }

  //     colorList.push({
  //       nodes: [adjList[i].id, ...sameColor],
  //       color: randomColor(),
  //     });
  //   }
  // }

  cy.nodes().forEach((node) => {
    for (let i = 0; i < colorList.length; i++) {
      //   console.log(colorList[i);
      if (colorList[i].nodes.includes(node.id())) {
        // console.log(colorList);
        node.style({ "background-color": colorList[i].color });
      }
    }
  });

  document.getElementById("chromatic-number").innerText =
    "Warna yang digunakan : " + colorList.length;
}

// function setNodeColor(node, color) {
//   node.style({ "background-color": color });
// }
