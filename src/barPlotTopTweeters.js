// Inspired by the d3-graph-gallery https://d3-graph-gallery.com/

// create svg canvas
const barPlotCanvHeight = 600, barPlotCanvWidth = 1170;

const barPlotMargin = {top: 10, right: 30, bottom: 200, left: 100};
const barPlotWidth = barPlotCanvWidth - barPlotMargin.left - barPlotMargin.right;
const barPlotHeight = barPlotCanvHeight - barPlotMargin.top - barPlotMargin.bottom;

const followersFrom = 4000000;
const followersTo = 24500000;

// append the svg object to the body of the page
const barPlotSVG = d3.select('#bar_plot_top_tweeters')
    .append('svg')
    .attr('width', barPlotWidth + barPlotMargin.left + barPlotMargin.right)
    .attr('height', barPlotHeight + barPlotMargin.top + barPlotMargin.bottom)
    .append('g')
    .attr('transform', `translate(${barPlotMargin.left},${barPlotMargin.top})`);

// Read the data
d3.csv('./data/user_counts.csv',
    function (d) {
        return {user_name: d.user_name, counts: parseInt(d.counts), followers: d.followers};
    }).then(function (data) {
    let data_initial = data
        .filter((follower) => (follower.followers > followersFrom && follower.followers < followersTo))
        .slice(0, 20); // show only the first 20 entries
    // X axis
    const x = d3.scaleBand()
        .range([0, barPlotWidth])
        .domain(data_initial.map(d => d.user_name))
        .padding(0.4);

    barPlotSVG.append("g")
        .attr("transform", `translate(0,${barPlotHeight})`)
        .attr('class', 'xaxis')
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("font-size", "14")
        .style("text-anchor", "end");

    barPlotSVG.select('.xaxis')
        .selectAll('text')
        .on('mouseover', mouseoverTooltip)
        .on('mousemove', mousemoveTooltip)
        .on('mouseout', mouseoutTooltip);

    // text label x axis
    barPlotSVG.append("text")
        .attr("y", barPlotHeight + 70 + barPlotMargin.bottom / 2)
        .attr("x", barPlotWidth / 2)
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
        .style("text-anchor", "middle")
        .style("fill", "#e5e5e5")
        .style("font-size", "20")
        .text("Benutzername");


    // Y axis
    const y = d3.scaleLinear()
        .domain([0, 2333])
        .range([barPlotHeight, 0]);

    barPlotSVG.append("g")
        .style("font-size", "14")
        .attr('class', 'yaxis')
        .call(d3.axisLeft(y));

    // text label y axis
    barPlotSVG.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - barPlotMargin.left)
        .attr("x", 0 - (barPlotHeight / 2))
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
        .style("text-anchor", "middle")
        .style("fill", "#e5e5e5")
        .style("font-size", "20")
        .text("Anzahl Tweets");

    barPlotSVG.selectAll("#bar_plot_top_tweeters")
        .data(data_initial)
        .join("rect")
        .attr("x", d => x(d.user_name))
        .attr("width", x.bandwidth())
        .attr("fill", "#F2B263")
        // no bar at the beginning thus:
        .attr("height", d => barPlotHeight - y(0)) // always equal to 0
        .attr("y", d => y(0))
        .on('mouseover', mouseoverTooltip)
        .on('mousemove', mousemoveTooltip)
        .on('mouseout', mouseoutTooltip);

    // Animation
    barPlotSVG.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.counts))
        .attr("height", d => barPlotHeight - y(d.counts))
        .delay((d, i) => {
            return i * 100;
        });


    // updates bar plat according to the selected amount of followers
    function update(followersFrom, followersTo) {

        // filter data
        const data_new = data
            .filter((follower) => (follower.followers > followersFrom && follower.followers < followersTo))
            .slice(0, 20);
        console.log(data_new);
        // X axis
        x.domain(data_new.map(d => d.user_name));
        barPlotSVG.select('.xaxis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("font-size", "14")
            .style("text-anchor", "end");

        barPlotSVG.select('.xaxis')
            .selectAll('text')
            .on('mouseover', mouseoverTooltip)
            .on('mousemove', mousemoveTooltip)
            .on('mouseout', mouseoutTooltip);

        // Y axis
        const maxCount = d3.max(data_new, function (d) {
            return d.counts;
        });
        y.domain([0, maxCount]);
        barPlotSVG.select('.yaxis').transition().duration(1000).call(d3.axisLeft(y));

        // variable u: map data to existing bars
        barPlotSVG.selectAll("rect")
            .data(data_new)
            .join("rect")
            .transition()
            .duration(1000)
            .attr("x", d => x(d.user_name))
            .attr("y", d => y(d.counts))
            .attr("width", x.bandwidth())
            .attr("height", d => barPlotHeight - y(d.counts))
            .attr("fill", "#F2B263");
    }

    d3.select("#submit").on("click", function (e) {
        const followersFrom = document.querySelector("#followerInputFrom").value;
        const followersTo = document.querySelector("#followerInputTo").value;
        update(+followersFrom, +followersTo);
    });

    //Tooltip
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

        let follower;
        let tweetCount;
        let userName;

        if (typeof d === "string") {
            follower = data.filter(e => e.user_name === d)[0].followers;
            tweetCount = data.filter(e => e.user_name === d)[0].counts;
            userName = data.filter(e => e.user_name ===d)[0].user_name;
        } else {
            follower = d.followers;
            tweetCount = d.counts;
            userName = d.user_name;
        }

        Tooltip
            .html('<p style ="margin: 0">' + '<span style="font-size: x-large; color: rgb(242,178,99)">' + (d3.format(","))(tweetCount) + ' Tweets' + '</span>' + '</p>' + '<span>' + 'von ' + userName + ' haben eine Reichweite von ' +(d3.format(","))(follower) + ' Follower' + '</span>')
            .style("left", (event.pageX) + 20 + "px")
            .style("top", (event.pageY) + 20 + "px");
    }

    function mouseoutTooltip() {
        Tooltip.style("opacity", 0);
    }
});