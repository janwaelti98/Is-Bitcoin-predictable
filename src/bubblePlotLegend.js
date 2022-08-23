// Inspired by the d3-graph-gallery https://d3-graph-gallery.com/

//Create svg canvas
const legendHeight = 250;
const legendWidth = 450;
const svg = d3.select("#bubble_plot_legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight);

// The scale you use for bubble size
const size = d3.scaleSqrt()
    .domain([0, 2000000])  // What's in the data, let's say it is percentage
    .range([0, 120]);  // Size in pixel

// Add legend: circles
const values = new Map();
values.set(100000, "100'000");
values.set(1000000, "1 Mio.");
values.set(2000000, "2 Mio.");

const xCircle = legendWidth / 2;
const xLabel = 385;
const yCircle = legendHeight - 1;
svg
    .selectAll("legend")
    .data(values.keys())
    .join("circle")
    .attr("cx", xCircle)
    .attr("cy", d => yCircle - size(d))
    .attr("r", d => size(d))
    .style("fill", "none")
    .attr("stroke", "rgb(33, 38, 38)");

// Add legend: segments
svg
    .selectAll("legend")
    .data(values.keys())
    .join("line")
    .attr('x1', d => xCircle + size(d))
    .attr('x2', xLabel)
    .attr('y1', d => yCircle - size(d))
    .attr('y2', d => yCircle - size(d))
    .attr('stroke', 'rgb(33, 38, 38)')
    .style('stroke-dasharray', ('2,2'));

// Add legend: labels
svg
    .selectAll("legend")
    .data(values.keys())
    .join("text")
    .attr('x', xLabel)
    .attr('y', d => yCircle - size(d))
    .text(d => values.get(d))
    .style("font-size", 15)
    .style("fill", "rgb(33, 38, 38)")
    .attr('alignment-baseline', 'middle');