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

var numNodes = 0;

d3.json("nyt2015.json", function(error, graph) {
  if (graph === undefined)
    console.log(error);

console.log(graph.nodes)
console.log(graph.links)
numNodes = graph.nodes.length;

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
      .attr("r", function(d) {
        if (d.weight>0) // only draw if has positive weight (number of links)
          return Math.sqrt(d.size)*2;
        else
          return 0;
        })
      .style("fill", function(d) { return rbgFromHue(dToHue(d)); });

  var txt = node.append("text")
      .attr("font-size", function(d) { // only draw if has positive weight (number of links)
        if (d.weight>0)
          return Math.log(d.size)*3;
        else
          return 0;
        })
      .attr("fill", function(d) { return rbgFromHue(dToHue(d)); })
      .text(function(d) { return d.name; })
      .call(wrap);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

     node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});

function wrap(text) {
  //console.log(text);
  maxWidth = 100;

  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        extraLines = 0,
        lineHeight = 1.1, // ems
        tspan = text.text(null).append("tspan").attr("dy", "0em");

    maxWidth = Math.log(text[0][0].parentNode.firstChild.attributes.r.nodeValue)*30;
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > maxWidth) {
        line.pop();
        tspan.text(line.join(" "));
        tspan.attr("x", (-tspan.node().getComputedTextLength()/2));
        line = [word];
        tspan = text.append("tspan").attr("x", (-maxWidth/2)).attr("dy", lineHeight+"em").text(word);
        extraLines++;
      }
    }

    tspan.attr("x", (-tspan.node().getComputedTextLength()/2));
    text.attr("y", (-(extraLines * lineHeight)/2)+lineHeight/3 + "em");
  });
}

var goldenRatioConjugate = 0.618033988749895;
var saturation = 0.5;
var lightness = 0.80;
//var hue = Math.random();

function rbgFromHue(hue) {
  // get random hue
  //hue += goldenRatioConjugate;
  //hue %= 1;
  //hue = Math.random();

  // convert to RGB
  var h_i = Math.floor(hue*6);
  var f = hue*6 - h_i;
  var p = lightness * (1 - saturation);
  var q = lightness * (1 - f*saturation);
  var t = lightness * (1 - (1 - f) * saturation);
  var r, g, b;

  switch (h_i) {
    case 0:
      r = lightness;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = lightness;
      b = p;
      break;
    case 2:
      r = p;
      g = lightness;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = lightness;
      break;
    case 4:
      r = t;
      g = p;
      b = lightness;
      break;
    case 5:
      r = lightness;
      g = p;
      b = q;
      break;
  }

  return "#"+Math.floor(r*256).toString(16)+Math.floor(g*256).toString(16)+Math.floor(b*256).toString(16);
}

function dToHue(d) {
  //console.log(d);
  //console.log("index:"+d.index+" hue:"+(goldenRatioConjugate*d.index)%1);
  //console.log("index:"+d.index+" hue:"+(d.index/101));
  return (d.index/numNodes);
  //return (d.x+d.y+(d.weight/1000))%1;
}

/*
Colour letters (from tagcloud)
make links less heavy

*/
