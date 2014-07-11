var width = 1200,
    height = 1200;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(function(d) { return -d.size*10 })
    .linkStrength(function(d) { return d.value/100; })
    .linkDistance(function(d) { 
      return 600/Math.sqrt(d.value) 
      + Math.sqrt(d.source.size) 
      + Math.sqrt(d.target.size);
    })
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("nyt.json", function(error, graph) {
  if (graph === undefined)
    console.log(error);

  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-opacity", function(d) { return Math.sqrt(d.value)/6 })
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  node.append("circle")
      .attr("r", function(d) { return Math.sqrt(d.size); })
      .style("fill", "#9999FF");

  var txt = node.append("text")
      .attr("font-size", function(d) { return Math.log(d.size)*3; })
      .text(function(d) { return d.name; })
      .call(wrap, 100);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

     node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        extraLines = 0,
        lineHeight = 1.1, // ems
        tspan = text.text(null).append("tspan").attr("x", 0).attr("dy", "0em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("dy", lineHeight+"em").text(word);
        extraLines++;
      }
    }

    text.attr("y", (-(extraLines * lineHeight)/2) + "em");
  });
}