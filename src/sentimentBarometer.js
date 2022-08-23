//Create svg canvas
const legendSentimentCanvHeight = 150, legendSentimentCanvWidth = 500;

const legendSentimentMargin = {top: 30, right: 30, bottom: 30, left: 30};
const legendSentimentHeight = legendSentimentCanvHeight - legendSentimentMargin.top - legendSentimentMargin.bottom;
const legendSentimentWidth = legendSentimentCanvWidth - legendSentimentMargin.left - legendSentimentMargin.right;
const legendSentimentSVG = d3.select("#sentiment_barometer")
    .append("svg")
    .attr("width", legendSentimentWidth + legendSentimentMargin.left + legendSentimentMargin.right)
    .attr("height", legendSentimentHeight + legendSentimentMargin.top + legendSentimentMargin.bottom);
//.style('border', '1px solid');


const padding = 30;
const barHeight = 5;

const xScale = d3.scaleLinear()
    .range([0, legendSentimentWidth])
    .domain([-4, 4]);

const xAxis = d3.axisBottom(xScale)
    .tickSize(barHeight * 2)
    .tickValues([-4, -3, -2, -1, 0, 1, 2, 3, 4]);


const g = legendSentimentSVG
    .append("g")
    .attr('transform', `translate(${legendSentimentMargin.left},${legendSentimentMargin.top})`);

legendSentimentSVG.append("text")
    .attr("transform", "rotate(0)")
    .attr("y", legendSentimentMargin.top + 30)
    .attr("x", legendSentimentWidth)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "right")
    .style("fill", "#e5e5e5")
    .style("font-size", "14")
    .text("positiv");

legendSentimentSVG.append("text")
    .attr("transform", "rotate(0)")
    .attr("y", legendSentimentMargin.top + 30)
    .attr("x", legendSentimentCanvWidth / 2)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "middle")
    .style("fill", "#e5e5e5")
    .style("font-size", "14")
    .text("neutral");

legendSentimentSVG.append("text")
    .attr("transform", "rotate(0)")
    .attr("y", legendSentimentMargin.top + 30)
    .attr("x", legendSentimentMargin.left)
    .attr("dy", "1em")
    .attr("font-family", "sans-serif")
    .style("text-anchor", "left")
    .style("fill", "#e5e5e5")
    .style("font-size", "14")
    .text("negativ");

g.append("g")
    .call(xAxis)
    .style("font-size", "14");