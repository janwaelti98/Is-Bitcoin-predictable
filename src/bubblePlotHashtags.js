// Inspired by the d3-graph-gallery https://d3-graph-gallery.com/

//Create svg canvas
const bubblePlotCanvHeight = 700, bubblePlotCanvWidth = 700;

const bubblePlotMargin = {top: 10, right: 30, bottom: 30, left: 60};
const bubblePlotWidth = bubblePlotCanvWidth - bubblePlotMargin.left - bubblePlotMargin.right;
const bubblePlotHeight = bubblePlotCanvHeight - bubblePlotMargin.top - bubblePlotMargin.bottom;

// Append the svg object to the body of the page
const bubblePlotSVG = d3.select('#bubble_plot_hashtags')
    .append('svg')
    .attr('width', bubblePlotWidth + bubblePlotMargin.left + bubblePlotMargin.right)
    .attr('height', bubblePlotHeight + bubblePlotMargin.top + bubblePlotMargin.bottom)
    .append('g')
    .attr('transform', `translate(${bubblePlotMargin.left},${bubblePlotMargin.top})`);

//Read the data
d3.csv('./data/hashtag_count.csv').then(function (data) {

    // Reduce the data to be displayed
    data = data.filter(function (d) {
        return d.Count > 50000;
    });

    // Color palette
    const color = d3.scaleOrdinal(['rgba(242, 177, 56, 1)', 'rgba(242, 177, 56, 0.8)', 'rgba(242, 177, 56, 0.6)']);

    // Size scale for amount of hashtag
    const size = d3.scaleSqrt()
        .domain([0, 2000000])
        .range([0, 120]);

    // Create tooltip
    const Tooltip = d3.select('body')
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "rgb(239,239,239)")
        .style("border", "solid")
        .style("border-color", "rgb(33, 38, 38)")
        .style("border-width", "2px")
        .style("padding", "10px");

    // Show tooltip
    const mouseover = function () {
        Tooltip
            .style("opacity", 1);
    };

    const mousemove = function (event, d) {
        Tooltip
            .html('<p style ="margin: 0">' + '<span style="font-size: x-large; color: rgb(242,178,99)">' + (d3.format(","))(d.Count) + ' Tweets' + '</span>' + '</p>' + '<span>' + 'verwenden den #' + d.Hashtag + '</span>')
            .style("left", (event.pageX) + 20 + "px")
            .style("top", (event.pageY) + 20 + "px");
    };

    // Hide tooltip
    let mouseleave = function () {
        Tooltip
            .style("opacity", 0);
    };

    // Initialize the circles in the center of the svg area
    let node = bubblePlotSVG
        .selectAll("g.node")
        .data(data)
        .join("g")
        .attr("class", "node")
        .attr("translate", `transform(${bubblePlotWidth / 2}, ${bubblePlotHeight / 2})`)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    node.append("circle")
        .attr("r", d => size(d.Count))
        .style("fill", d => color(d.Hashtag));


    node.append("text")
        .attr("dy", ".3em")
        .attr("font-size", function (d) {
            return size(d.Count) / 2;
        })
        .style("text-anchor", "middle")
        .style("fill", "rgb(33, 38, 38)")
        .text(function (d) {
            return d.Hashtag;
        });

// Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
        .force("forceX", d3.forceX().strength(.1).x(bubblePlotWidth * .5))
        .force("forceY", d3.forceY().strength(.1).y(bubblePlotHeight * .5))
        .force("center", d3.forceCenter().x(bubblePlotWidth * .5).y(bubblePlotHeight * .5)); // Attraction to the center of the svg area

// Apply these forces to the nodes and update their positions.
    simulation
        .nodes(data)
        .force("collide", d3.forceCollide().strength(.9).radius(function (d) {
            return (size(d.Count) + 3);
        }).iterations(1)) // Force that avoids circles to overlap
        .on("tick", function (d) {
            node
                .attr("transform", d => `translate(${d.x}, ${d.y})`);
        });

// When a circle is dragged
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }
})
;
