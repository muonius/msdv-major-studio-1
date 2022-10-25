// const e = require("express");
let link;
const width = 300;
const height = 300;

//1. Initiate Sankey
const _sankey = d3
  .sankey()
  .nodeWidth(0)
  .nodeAlign(d3.sankeyCenter)
  .nodePadding(2)
  .nodeSort(null)
  .extent([
    [width / 2, 10],
    [width, height - 50],
  ]);

const sankey = ({ nodes, links }) =>
  _sankey({
    nodes: nodes.map((d) => Object.assign({}, d)),
    links: links.map((d) => Object.assign({}, d)),
  });

const f = d3.format(",.0f");
const format = (d) => `${f(d)} TWh`;

//2. Create Bound
const chart = d3
  .select("#chart")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .style("VerticalAlignment", "Top")
  .style("width", "100%")
  .style("height", "auto")
  // .style("border", "1px solid #000")
  .append("g");

const svg = d3.select("#chart g");

svg.attr("transform", `rotate(-90, 0, 0) translate(-${width}, 0)`);

//3. Load Data
d3.csv("../sankey.csv").then((data) => {
  //set up graph in same style as original example but empty
  const sankeydata = {
    nodes: [],
    links: [],
  };

  //trasform csv data into flow chart data
  data.forEach(function (d) {
    sankeydata.nodes.push({
      name: d.source,
    });
    sankeydata.nodes.push({
      name: d.target,
    });
    sankeydata.links.push({
      source: d.source,
      target: d.target,
      value: +d.value,
    });
  });

  // return only the distinct / unique nodes
  const unique = d3
    .nest()
    .key((d) => d.name)
    .entries(sankeydata.nodes);

  sankeydata.nodes = unique.map((d) => d.key);
  // console.log(sankeydata.nodes);

  // console.log(sankeydata.nodes);
  // loop through each link replacing the text with its index from node
  sankeydata.links.forEach(function (d, i) {
    sankeydata.links[i].source = sankeydata.nodes.indexOf(
      sankeydata.links[i].source
    );
    sankeydata.links[i].target = sankeydata.nodes.indexOf(
      sankeydata.links[i].target
    );
  });

  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  sankeydata.nodes.forEach(function (d, i) {
    sankeydata.nodes[i] = {
      name: d,
    };
  });

  //set up color scale
  const palette = [
    "#E5233D",
    "#DEA739",
    "#4CA146",
    "#C7212E",
    "#EF402D",
    "#27BFE6",
    "#FBC412",
    "#A21D43",
    "#F26A2E",
    "#E01583",
    "#F89D2A",
    "#BF8D2C",
    "#407F46",
    "#2097D4",
    "#59BA48",
    "#126A9E",
    "#15496B",
  ];

  // const _color = d3.scaleOrdinal(d3.schemeCategory10);
  // const color = (name) => _color(name.replace(/ .*/, ""));

  const nameRange = [
    "01. No Poverty",
    "02. Zero Hunger",
    "03. Good Health and Well-Being",
    "04. Quality Education",
    "05. Gender Equality",
    "06. Clean Water and Sanitation",
    "07. Affordable and Clean Energy",
    "08. Decent Work and Economic Growth",
    "09. Industry, Innovation, and Infrastructure",
    "10. Reduced Inequalities",
    "11. Sustainable Cities and Communities",
    "12. Responsible Consumption and Production",
    "13. Climate Action",
    "14. LIfe below Water",
    "15. Life on Land",
    "16. Peace, Justice and Strong Institutions",
    "17. Partnerships for the Goals",
  ];

  const color = d3.scaleOrdinal().domain(nameRange).range(palette);

  //4. Prepare for Sankey
  graph = sankey(sankeydata);

  // add rects

  // svg
  //   .append("g")
  //   // .attr("stroke", "#000")
  //   .selectAll("rect")
  //   .data(graph.nodes)
  //   .join("rect")
  //   .attr("x", (d) => d.x0)
  //   .attr("y", (d) => d.y0 - 0.5)
  //   .attr("height", 1)
  //   // .attr("height", (d) => d.y1 - d.y0)
  //   // .attr("width", (d) => d.x1 - d.x0)
  //   // .attr("height", (d) => d.y1 - d.y0)
  //   .attr("width", 1)
  //   .attr("fill", (d) => color(d.name))
  //   .append("title")
  //   .text((d) => `${d.name}\n${format(d.value)}`)
  // .attr("transform", "rotate(270,0,0)");

  // 5. Draw Sankey
  link = svg
    .append("g")
    .attr("fill", "none")
    .selectAll("g")
    .data(graph.links)
    .join("g")
    .style("mix-blend-mode", "multiply");

  // const select = document.querySelector("#colorSelect");
  // select.onchange = () => {
  //   edgeColor = select.value;
  //   update();
  // };

  function update() {
    const gradient = link
      .append("linearGradient")
      .attr("id", (d, i) => {
        //  (d.uid = DOM.uid("link")).id
        const id = `link-${i}`;
        d.uid = `url(#${id})`;
        return id;
      })
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d) => d.source.x1)
      .attr("x2", (d) => d.target.x0);

    gradient
      .append("stop")
      // .attr("offset", "0%")
      .attr("stop-color", (d) => {
        // the first layer
        if (d.source.x1 > width / 2) {
          return color(d.source.name);
        } else {
          return color(d.target.name);
        }
      });

    gradient
      .append("stop")
      // .attr("offset", "100%")
      .attr("stop-color", (d) => {
        // the first layer
        if (d.source.x1 > width / 2) {
          return color(d.source.name);
        } else {
          return color(d.target.name);
        }
      });

    link
      .append("path")
      .attr("class", "link")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke-opacity", (d) => (d.source.x1 <= width / 2 ? 1 : 0.5))
      .attr("stroke", (d) => d.uid)
      .attr("stroke-width", (d) => {
        // the first layer
        if (d.source.x1 > width / 2) {
          return 0.5;
        } else {
          return 0.6;
        }
      })
      .on("mouseover", onMouseEnter)
      .on("mouseleave", onMouseLeave);

    // add the link titles
  }

  update();

  // link
  //   .append("title")
  //   .text((d) => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

  //7. Append text
  const title = svg
    .append("g")
    .append("text")
    .attr("class", "title")
    .text(`SDG at A Glace`)
    .style("font", "15px DM Sans")
    .attr("x", width / 2 + 25)
    .attr("y", 12)
    .attr("text-anchor", "start")
    // .style("fill", "url(#rainbow)")
    .style("transform", `translateX(180px) rotate(90deg)`);

  const tagline = svg
    .append("g")
    .append("text")
    .attr("class", "tagling")
    .text(`Transformations, Goals and Targets`)
    .style("font", "7px DM Sans")
    .attr("x", width / 2 + 25)
    .attr("y", 22)
    .attr("text-anchor", "start")
    // .style("fill", "url(#rainbow)")
    .style("transform", `translateX(180px) rotate(90deg)`);

  // svg
  //   .append("g")
  //   .style("font", "6px sans-serif")
  //   .selectAll("text")
  //   .data(graph.nodes)
  //   .join("text")
  //   .attr("x", (d) => (d.x0 < width / 2 ? d.x1 - 3 : d.x0 - 6))
  //   .attr("y", (d) => (d.y1 + d.y0) / 2 - 2)
  //   .attr("dy", "0.35em")
  //   .attr("text-anchor", (d) => (d.x0 < width / 5 ? "start" : "end"));
  // .text((d) => (d.height <= 1 ? null : d.name));

  //Add lines
  // const lines = [
  //   {
  //     x1: width - 1,
  //     y1: height - 282,
  //     x2: width - 1,
  //     y2: 0,
  //   },
  //   {
  //     x1: width - 75,
  //     y1: height - 242,
  //     x2: width - 75,
  //     y2: 0,
  //   },
  //   {
  //     x1: width - 148,
  //     y1: height - 242,
  //     x2: width - 148,
  //     y2: 0,
  //   },
  // ];

  // lines.forEach((l) => {
  //   svg
  //     .append("g")
  //     .append("line")
  //     .attr("x1", l.x1)
  //     .attr("y1", l.y1)
  //     .attr("x2", l.x2)
  //     .attr("y2", l.y2)
  //     .attr("stroke", "black")
  //     .attr("stroke-width", "0.15")
  //     .style("stroke-width", "0.2px");
  // });
});

const tooltip = d3.select("#tooltip");

//helper function
const imgPicker = (str) => {
  const newStr = str.split(" ")[0].slice(0, 2);
  return newStr;
};

function onMouseEnter(event) {
  if (event.source.height == 1) {
    let imgCode = imgPicker(event.source.name);
    let img = `../assets/${imgCode}.png`;
    tooltip
      .select("#tooltip-goal")
      .html(
        `<div class="first-layer"><img src=${img} width="200px"/>
        <div id="first-layer">
        <h3 style=("font-size","5em")>Goal ${event.source.name}</h3>
        <div class="placeholder"></div>
        <p>Target ${event.target.name}</p>
        </div>
        </div>`
      )
      .style("font-weight", "400");
  }

  if (event.source.height == 2) {
    let imgCode = imgPicker(event.target.name);
    let img = `../assets/${imgCode}.png`;
    tooltip
      .select("#tooltip-goal")
      .html(
        `<div class="first-layer"><img src=${img} width="200px"/>
        <div id="first-layer">
        <h3 style=("font-size","5em")>Transformation ${event.source.name}</h3>
        <div class="placeholder"></div>
        <p>Goal ${event.target.name}</p>
        </div>
        </div>`
      )
      .style("font-weight", "400");
  }

  // .style("font-size", "16px");
  // Format tooltip position
  // const x = d3.event.pageX;
  // const y = d3.event.pageY;

  tooltip.style(
    "transform",
    `translate(800px,250px)`

    // `translate(${window.innerWidth}/2,${window.innerHeight}/2)`
    // `translate(` + `calc(-5% + ${x}px),` + `calc(5% + ${y}px)` + `)`
  );
  tooltip.style("width", "50%");
  tooltip.style("opacity", 1);
}

function onMouseLeave(event) {
  d3.select(this);
  tooltip.style("opacity", 0);
}