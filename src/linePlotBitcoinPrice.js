// Inspired by the d3-graph-gallery https://d3-graph-gallery.com/

// create svg canvas
const linePlotCanvHeight = 600, linePlotCanvWidth = 1500;

const linePlotMargin = {top: 10, right: 330, bottom: 100, left: 100};
const linePlotWidth = linePlotCanvWidth - linePlotMargin.left - linePlotMargin.right;
const linePlotHeight = linePlotCanvHeight - linePlotMargin.top - linePlotMargin.bottom;

// append the svg object to the body of the page
const linePlotSVG = d3.select('#line_plot_bitcoin_price')
    .append('svg')
    .attr('width', linePlotWidth + linePlotMargin.left + linePlotMargin.right)
    .attr('height', linePlotHeight + linePlotMargin.top + linePlotMargin.bottom)
    .append('g')
    .attr('transform', `translate(${linePlotMargin.left},${linePlotMargin.top})`);

//Read the data
Promise.all([
    d3.dsv(",", "./data/Bitcoin_kurs.csv",
        function (d) {
            return {Date: d3.timeParse('%Y-%m-%d')(d.Date), Close: d.Close};
        }),
    d3.dsv(",", "./data/tweets_a_day.csv",
        function (d) {
            return {Date: d3.timeParse('%Y-%m-%d')(d.date), tweets_a_day: d.tweets_a_day};
        }),
]).then(
    function (data) {
        var tweets = data[1];

        // only get data after certain date
        const minDate = new Date(Math.min.apply(Math, tweets.map(function (d) {
            return d.Date;
        })));
        var bitcoinPrices = data[0].filter(function (d) {
            return d.Date >= minDate;
        });

        const timeDomain = d3.extent(bitcoinPrices, function (d) {
            return d.Date;
        });
        const priceDomain = [0, d3.max(bitcoinPrices, function (d) {
            return +d.Close;
        })];

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


        // Add X axis --> it is a date format
        const xScale = d3.scaleTime()
            .domain(timeDomain)
            .rangeRound([0, linePlotWidth]);
        linePlotSVG.append('g')
            .attr('transform', `translate(0, ${linePlotHeight})`)
            .style("font", "13px sans-serif")
            .call(d3.axisBottom(xScale));

        // x label
        linePlotSVG.append("text")
            .attr("transform", "rotate(0)")
            .attr("y", linePlotHeight + linePlotMargin.bottom / 2)
            .attr("x", linePlotWidth / 2)
            .attr("dy", "1em")
            .attr("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .style("fill", "#e5e5e5")
            .style("font-size", "20")
            .text("Zeit");

        // Add Y axis
        const yScale = d3.scaleLinear()
            .domain(priceDomain)
            .rangeRound([linePlotHeight, 0]);
        linePlotSVG.append('g')
            .style("font-size", "14")
            .call(d3.axisLeft(yScale));

        // Add y label
        linePlotSVG.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - linePlotMargin.left)
            .attr("x", 0 - (linePlotHeight / 2))
            .attr("dy", "1em")
            .attr("font-family", "sans-serif")
            .style("text-anchor", "middle")
            .style("fill", "#e5e5e5")
            .style("font-size", "20")
            .text("Kurs in US Dollar / Tweets pro Tag");


        var bisect = d3.bisector(function (d) {
            return d.Date;
        }).left;

        // line for bitcoin
        linePlotSVG.append('path')
            .datum(bitcoinPrices)
            .attr('fill', 'none')
            .attr('stroke', 'rgb(0,132,132)')
            .attr('stroke-width', 2.5)
            .attr('d', d3.line()
                .x(d => xScale(d.Date))
                .y(d => yScale(d.Close))
            );

        // circle for pointer
        var focusCircle = linePlotSVG
            .append('circle')
            .attr('r', "5px")
            .attr("stroke", '#e5e5e5')
            .attr("stroke-width", "1px")
            .attr("fill", 'transparent');


        // Pointer text for bitcoin price
        var focusText = linePlotSVG
            .append('g')
            .append('text')
            .style("opacity", 0)
            .style("font-size", "20px")
            .attr("fill", "#e5e5e5")
            .attr("alignment-baseline", "middle");

        linePlotSVG
            .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', linePlotWidth)
            .attr('height', linePlotHeight)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

        // number of tweets
        linePlotSVG.append("g")
            .selectAll("dot")
            .data(tweets)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d.Date);
            })
            .attr("cy", function (d) {
                return yScale(d.tweets_a_day);
            })
            .attr("r", 5)
            .attr("fill", "rgb(241,109,109)")
            .on('mouseover', mouseoverTooltip)
            .on('mousemove', mousemoveTooltip)
            .on('mouseout', mouseoutTooltip);

        function mouseover() {
            focusText.style("opacity", 1);
            focusCircle.style("opacity", 1);
        }

        function mouseoverTooltip() {
            Tooltip.style("opacity", 1);
        }

        function mousemove() {
            var x0 = xScale.invert(d3.pointer(event)[0]);
            var i = bisect(bitcoinPrices, x0, 1);
            let selectedData = bitcoinPrices[i];

            focusCircle
                .html(Number(selectedData.Close))
                .attr("cx", xScale(selectedData.Date))
                .attr("cy", yScale(selectedData.Close));

            focusText
                .html(Number(selectedData.Close).toFixed(2) + ' $')
                .attr("x", xScale(selectedData.Date) + 15)
                .attr("y", yScale(selectedData.Close));
        }

        function mousemoveTooltip(event, d) {
            Tooltip
                .html('<h5 style ="margin: 0"><u style="color: rgb(241,109,109)">' + (d3.format(","))(d.tweets_a_day) + ' Tweets' + '</u></h5>' + 'versendet am ' + d3.timeFormat("%d. %B, %Y")(d.Date))
                .style("left", (event.pageX) + 20 + "px")
                .style("top", (event.pageY) + 20 + "px");
        }

        function mouseout() {
            focusText.style("opacity", 0);
            focusCircle.style("opacity", 0);
        }


        function mouseoutTooltip() {
            Tooltip.style("opacity", 0);
        }


        // Legend
        const legend = linePlotSVG.append("g")
            .attr("id", "legend")
            .attr("transform", "translate(" + (linePlotWidth - 215) + "," + linePlotMargin.top + ")");

        legend.append("rect")
            .attr("x", 1)
            .attr("y", 1)
            .attr("width", 205)
            .attr("height", 68)
            .attr("fill", "none")
            .attr("stroke", "#e5e5e5")
            .attr("stroke-width", "1");

        legend.append("circle")
            .attr("cx", 20)
            .attr("cy", 20).attr("r", 8)
            .style("fill", "rgb(0,132,132)");

        legend.append("circle")
            .attr("cx", 20)
            .attr("cy", 50).attr("r", 8)
            .style("fill", "rgb(241,109,109)");

        legend.append("text")
            .attr("x", 40)
            .attr("y", 20)
            .text("BTC Kurs in US Dollar")
            .style("font-size", "15px")
            .style("fill", "#e5e5e5")
            .attr("alignment-baseline", "middle");

        legend.append("text")
            .attr("x", 40)
            .attr("y", 50)
            .text("Anzahl Tweets pro Tag")
            .style("font-size", "15px")
            .style("fill", "#e5e5e5")
            .attr("alignment-baseline", "middle");
    });