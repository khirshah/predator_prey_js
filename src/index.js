import _ from 'lodash';
import './style.css';
import * as d3 from "d3";
import lodash from "lodash";
import dataGrid from "./model"


//--------------------------------------- VISUALIZATION -----------------------------------------------------------
//--------------------------------------- init ------------------------------------------------------------

//Width and height
const width = 600,
    height = 600,
    margin = 100,
    padding = 50;

//------------------------------------ datascale ------------------------------
const yScale = d3.scaleLinear().domain([0,40]).range([height-padding,padding]);
const xScale = d3.scaleLinear().domain([0,60]).range([padding,width-padding]);

//-------------------------------------- axes ----------------------------------
const xAxis = d3.axisBottom()
          .scale(xScale)
          .ticks(6);

const yAxis = d3.axisLeft()
          .scale(yScale)
          .ticks(4);

//----------------------------- color --------------------------------
const max_magnitude = dataGrid.reduce(function (max_, it) {
    return (!isNaN(it.magnitude) && (max_ > it.magnitude)) ? max_ : it.magnitude;
        }, 0);


//------------------------------- PLOTTING ---------------------------------------------------------------------
//----------------------------- creating svg ---------------------------------

const  svg = d3.select("body").append("svg")
            .attr("id","vectorspace")
            .attr("width", width+margin)
            .attr("height", height+margin)
            .attr("padding", "50px");

//----------------------------- plotting data --------------------------------
dataGrid.forEach(function(point) {
    
    if (!isNaN(point.magnitude)) {

    const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0,max_magnitude]);

    svg.append("g")
    .append("path")
    .attr("d", `M ${xScale(0)} ${yScale(0)} L ${xScale(point.modellValues[0])} ${yScale(point.modellValues[1])}`)
    .attr("stroke", colorScale(point.magnitude))
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .attr("transform", "translate(" + (xScale(point.x) - xScale(0)) + "," + (yScale(point.y) - yScale(0)) + ")")
    ;

    svg.append("g")
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
svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(0,${height-padding+5})`)
  .call(xAxis);

//Create Y axis
svg.append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${padding-5},0)`)
  .call(yAxis);