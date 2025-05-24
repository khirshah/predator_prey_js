import _ from 'lodash';
import './style.css';
import * as d3 from "d3";
import lodash from "lodash";
import dataGrid from "./model"

// Debounce function
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

//--------------------------------------- VISUALIZATION -----------------------------------------------------------
function drawVisualization() {
    // Remove previous svg
    d3.select("#vectorspace").remove();

    const bodyWidth = d3.select("body").node().getBoundingClientRect().width;
    const jsInternalPadding = 50; // Renamed from 'padding' - for space inside plotAreaSize for axis ticks/labels etc.

    // Temporarily append SVG to read its CSS computed padding, then remove.
    // This is necessary because computed styles are only available for elements in the DOM.
    let tempSvg = d3.select("body").append("svg").attr("id", "vectorspace").style("visibility", "hidden");
    const computedStyle = window.getComputedStyle(tempSvg.node());
    const cssPaddingTop = parseFloat(computedStyle.paddingTop);
    const cssPaddingBottom = parseFloat(computedStyle.paddingBottom);
    const cssPaddingLeft = parseFloat(computedStyle.paddingLeft);
    const cssPaddingRight = parseFloat(computedStyle.paddingRight);
    tempSvg.remove(); // Remove temporary SVG

    // Calculate Plot Area Size
    const minPlotAreaSize = 200;
    const plotAreaAvailableWidth = bodyWidth - (cssPaddingLeft + cssPaddingRight);
    // For 1:1 aspect ratio, plot area height would also be constrained by available width for simplicity here,
    // or use bodyHeight - (cssPaddingTop + cssPaddingBottom) if bodyHeight is also a constraint.
    // Assuming SVG height will accommodate plotAreaSize + vertical CSS paddings.
    const plotAreaSize = Math.max(minPlotAreaSize, plotAreaAvailableWidth);

    const width = plotAreaSize; // This is the actual drawing area for chart content (data + internal js padding)
    const height = plotAreaSize; // Maintain 1:1 aspect ratio

    //------------------------------------ datascale ------------------------------
    // Scales use 'width' and 'height' (plotAreaSize) and 'jsInternalPadding'
    const yScale = d3.scaleLinear().domain([0,40]).range([height-jsInternalPadding,jsInternalPadding]);
    const xScale = d3.scaleLinear().domain([0,60]).range([jsInternalPadding,width-jsInternalPadding]);

    //-------------------------------------- axes ----------------------------------
    const xAxis = d3.axisBottom()
              .scale(xScale)
              .ticks(Math.max(2, Math.floor(width / 100))); // Dynamic ticks based on width

    const yAxis = d3.axisLeft()
              .scale(yScale)
              .ticks(Math.max(2, Math.floor(height / 100))); // Dynamic ticks based on height

    //----------------------------- color --------------------------------
    const max_magnitude = dataGrid.reduce(function (max_, it) {
        return (!isNaN(it.magnitude) && (max_ > it.magnitude)) ? max_ : it.magnitude;
            }, 0);


    //------------------------------- PLOTTING ---------------------------------------------------------------------
    //----------------------------- creating svg ---------------------------------
    // Re-append the actual SVG
    const svg = d3.select("body").append("svg")
                .attr("id","vectorspace")
                .attr("width", bodyWidth) // SVG takes full body width
                .attr("height", height + cssPaddingTop + cssPaddingBottom); // SVG height accommodates plot area + its CSS top/bottom padding

    // Create a group for the main chart area, translated by CSS padding amounts
    const chartArea = svg.append("g")
        .attr("class", "chartArea") // Added class for potential selection
        .attr("transform", `translate(${cssPaddingLeft}, ${cssPaddingTop})`);

    //----------------------------- plotting data --------------------------------
    dataGrid.forEach(function(point) {
        
        if (!isNaN(point.magnitude)) {

        const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0,max_magnitude]);

        chartArea.append("g") // Append to chartArea instead of svg directly
        .append("path")
        .attr("d", `M ${xScale(0)} ${yScale(0)} L ${xScale(point.modellValues[0])} ${yScale(point.modellValues[1])}`)
        .attr("stroke", colorScale(point.magnitude))
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("transform", "translate(" + (xScale(point.x) - xScale(0)) + "," + (yScale(point.y) - yScale(0)) + ")")
        ;

        chartArea.append("g") // Append to chartArea instead of svg directly
        .append("circle")
        .attr("r",1.5)
        .attr("cx", xScale(0))
        .attr("cy", yScale(0))
        .attr("fill", colorScale(point.magnitude))
        .attr("transform", "translate(" + (xScale(point.x) - xScale(0)) + "," + (yScale(point.y) - yScale(0)) + ")")
        ;
      }
    });

    // ------------------------------ plotting axes --------------------------
    //Create X axis
    chartArea.append("g")
      .attr("class", "axis x-axis") // Added specific class for x-axis
      .attr("transform", `translate(0,${height-jsInternalPadding+5})`) // Position based on plot area height and internal padding
      .call(xAxis);

    //Create Y axis
    chartArea.append("g")
      .attr("class", "axis y-axis") // Added specific class for y-axis
      .attr("transform", `translate(${jsInternalPadding-5},0)`) // Position based on internal padding
      .call(yAxis);
}

// Initial draw
drawVisualization();

// Redraw on resize
window.addEventListener('resize', debounce(drawVisualization, 250));