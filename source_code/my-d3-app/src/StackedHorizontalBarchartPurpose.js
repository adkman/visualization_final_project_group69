import * as d3 from "d3";
import Container from 'react-bootstrap/Container';
import { Component } from 'react';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';

class StackedHorizontalBarchartPurpose extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;

        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.explosionsData.length !== prevProps.explosionsData.length
            || this.props.explosionsData !== prevProps.explosionsData
        ) {
            const svg = d3.select("#" + Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart = () => {

        const { explosionsData, colorScale, nuclearCountries } = this.props;

        const margin = ({ top: 50, right: 10, bottom: 20, left: 50 });

        let dataMap = new Map();
        for (let i = 0; i < explosionsData.length; i++) {
            let purposes = explosionsData[i].purpose.split("/");
            for (let j = 0; j < purposes.length; j++) {
                if (dataMap.has(purposes[j])) {
                    let country = explosionsData[i].country;
                    let purpose = dataMap.get(purposes[j]);
                    if (!!purpose[country]) {
                        purpose[country] += 1;
                    } else {
                        purpose[country] = 1;
                    }
                    dataMap.set(purposes[j], purpose);
                } else {
                    let purpose = {
                        "name": purposes[j],
                    }
                    for (const country of nuclearCountries) {
                        purpose[country] = 0;
                    }
                    purpose[explosionsData[i].country] = 1;
                    dataMap.set(purposes[j], purpose);
                }
            }
        }

        const data_grouped = Array.from(dataMap.values());

        const data_stacked = d3.stack()
            .keys(nuclearCountries)
            (data_grouped)
            .map(d => (d.forEach(v => v.key = d.key), d));

        console.log("Stacked: Purpose data", data_stacked);

        const xMax = d3.max(data_stacked, d => d3.max(d, d => d[1]));
        const xScale = d3.scaleLinear()
            .domain([0, xMax])
            .range([margin.left, this.width - margin.right]);

        const yScale = d3.scaleBand()
            .domain(Array.from(dataMap.keys()))
            .rangeRound([this.height - margin.bottom, margin.top])
            .padding(0.1);


        const svg = d3.select("#" + Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("font-size", "10")
            .attr("text-anchor", "end");

        this.drawAxes(svg, xScale, yScale, LABEL.COUNTS, LABEL.PURPOSE, this.height, this.width, margin, data_stacked.length);

        svg.append("g")
            .selectAll("g")
            .data(data_stacked)
            .join("g")
            .attr("fill", d => colorScale(d.key))
            // .attr("fill-opacity", 0.6)
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d.data.name))
            .attr("width", d => xScale(d[1]) -xScale(d[0]))
            .attr("height", yScale.bandwidth())
        // .on("mouseover", function (e, d) {
        //     d3.select(this)
        //         .attr("fill-opacity", 1);
        //     d3.select(this.parentNode)
        //         .append('text')
        //         .text(d['count'])
        //         .attr("x", xScale(d['category']) + xScale.bandwidth() / 2)
        //         .attr("y", yScale(d['count']) - 4)
        //         .attr("font-size", "14")
        //         .attr("font-weight", "bold")
        //         .attr("text-anchor", "middle")
        //         .attr("id", "temp_bar_chart_val")
        //         .attr("fill", colorScale(d['category']));
        // }).on("mouseout", function (e, d) {
        //     d3.select(this)
        //         .attr("fill-opacity", 0.6);
        //     d3.select("#temp_bar_chart_val").remove();
        // });
    }

    drawAxes = (svg,
        xScale,
        yScale,
        xTitleTxt,
        yTitleTxt,
        height,
        width,
        margin,
        num_categories) => {

        const xAxis = g => g
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(xScale)
                .tickSizeOuter(0));

        const xTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", (width - margin.right) / 2)
            .attr("y", margin.top - 30)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(xTitleTxt)

        let deg = num_categories >= 8 ? -30 : 0;
        let anchor = num_categories >= 8 ? "end" : "middle";
        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-size", 9)
            .attr("transform", `rotate(${deg})`)
            .attr("text-anchor", anchor)

        const yTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -(height - margin.bottom) / 2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(yTitleTxt)

        svg.append("g")
            .call(xAxis);

        svg.call(xTitle);

        svg.append("g")
            .call(yAxis);

        svg.call(yTitle);
    }

    render() {
        return (
            <Container fluid id={Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default StackedHorizontalBarchartPurpose;