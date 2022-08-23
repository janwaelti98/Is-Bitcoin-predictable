// Inspired by the d3-graph-gallery https://d3-graph-gallery.com/
const canvHeight = 600, canvWidth = 1170;

const margin = {top: 10, right: 30, bottom: 100, left: 100};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const sentimentSvg = d3.select('#line_plot_sentiment')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);



Promise.all([
    d3.dsv(",", './data/sentiment_diff.csv',
        function (d) {
            return {Date: d3.timeParse('%Y-%m-%d')(d.Date), Compound: d.compound, Diff: d.diff};
        }),
    d3.dsv(",", "./data/tweets_a_day.csv",
        function (d) {
            return {Date: d3.timeParse('%Y-%m-%d')(d.date), tweets_a_day: d.tweets_a_day};
        }),
]).then(
    // Now I can use this dataset:
    function (data) {
        const diffDomain = d3.extent(data[0], function (d) {
            return d.Diff;
        });
        const sentimentDomain = [d3.min(data[0], function (d) {
            return +d.Compound;
        }), d3.max(data[0], function (d) {
            return +d.Compound;
        })];

        // Add x axis
        const xScale = d3.scaleLinear()
            .domain(diffDomain)
            .rangeRound([0, width]);
        sentimentSvg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .style("font-size", "14")
            .call(d3.axisBottom(xScale));
        sentimentSvg.append("text")
            .attr("transform", "rotate(0)")
            .attr("y", height + margin.bottom / 2)
            .attr("x", width / 2)
            .attr("dy", "1em")
            .attr("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .style("fill", "#e5e5e5")
            .style("font-size", "20")
            .text("Kursdifferenz zum nächsten Tag in US Dollar");

        // Add y axis
        const yScale = d3.scaleLinear()
            .domain(sentimentDomain)
            .rangeRound([height, 0]);

        sentimentSvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .style("fill", "#e5e5e5")
            .style("font-size", "20")
            .text("Durchschn. tägliche Stimmung");

        sentimentSvg.append('g')
            .style("font-size", "14")
            .attr("transform", "translate(" + (width / 2 + 14) + ",0)")
            .call(d3.axisLeft(yScale));

        sentimentSvg.append('g')
            .selectAll("dot")
            .data(data[0])
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.Diff);
            })
            .attr("cy", function (d) {
                return yScale(d.Compound);
            })
            .attr("r", 5)
            .style("fill", "rgb(241,109,109)")
            .on('mouseover', mouseoverTooltip)
            .on('mousemove', mousemoveTooltip)
            .on('mouseout', mouseoutTooltip);

        // Create tooltip
        const Tooltip = d3.select('body')
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "rgb(239,239,239)")
            .style("border", "solid")
            .style("border-color", "#212626")
            .style("border-width", "2px")
            .style("padding", "10px");

        function mouseoverTooltip() {
            Tooltip.style("opacity", 1);
        }

        function mousemoveTooltip(event, d) {  
            var format = d3.timeFormat("%d. %B, %Y")
            var twitterData = data[1].filter(e => format(e.Date) === format(d.Date))[0];
            Tooltip
                .html('<h5 style ="margin: 0"><u style="color: rgb(241,109,109)">' + (d3.format(","))(twitterData.tweets_a_day) + ' Tweets' + '</u></h5>' + 'versendet am ' + format(twitterData.Date))
                .style("left", (event.pageX) + 20 + "px")
                .style("top", (event.pageY) + 20 + "px");
        }

        function mouseoutTooltip() {
            Tooltip.style("opacity", 0);
        }

        // Legend
        const legend = sentimentSvg.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(" - width + "," + margin.top + ")");

        legend.append("rect")
            .attr("x", 1)
            .attr("y", 1)
            .attr("width", 205)
            .attr("height", 38)
            .attr("fill", "none")
            .attr("stroke", "#e5e5e5")
            .attr("stroke-width", "1");

        legend.append("circle")
            .attr("cx", 20)
            .attr("cy", 20).attr("r", 8)
            .style("fill", "rgb(241,109,109)");

        legend.append("text")
            .attr("x", 40)
            .attr("y", 20)
            .text("Anzahl Tweets pro Tag")
            .style("font-size", "15px")
            .style("fill", "#e5e5e5")
            .attr("alignment-baseline", "middle");
    });