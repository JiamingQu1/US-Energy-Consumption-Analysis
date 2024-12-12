// Load the JSON data and initialize the chart
d3.json("output.json").then(data => {
    // Extract state names and initialize dropdowns
    const states = data.map(d => d.state_name);
    const dropdown1 = d3.select("#state1");
    const dropdown2 = d3.select("#state2");

    dropdown1.selectAll("option")
        .data(states)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    dropdown2.selectAll("option")
        .data(states)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    // Set default dropdown values
    dropdown1.property("value", states[0]);
    dropdown2.property("value", states[1]);

    // Chart dimensions
    const svgWidth = 600;
    const svgHeight = 450; // Increased height to accommodate the title
    const margin = { top: 80, right: 20, bottom: 50, left: 50 }; // Increased top margin
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#plot")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Add title
    svg.append("text")
        .attr("x", svgWidth / 2)
        .attr("y", margin.top / 2) // Adjusted for better positioning
        .attr("text-anchor", "middle")
        .style("font-size", "18px") // Adjusted font size
        .style("font-weight", "bold")
        .text("Choose 2 states and compare the annual average electricity usage per household");

    const plotGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create scales
    const xScale = d3.scaleBand()
        .range([0, width])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .range([height, 0]);

    // Create axes groups
    const xAxisGroup = plotGroup.append("g")
        .attr("transform", `translate(0, ${height})`);

    const yAxisGroup = plotGroup.append("g");

    // Function to update the barplot
    function updateBarplot(state1, state2) {
        // Filter data based on selected states
        const filteredData = data.filter(d => d.state_name === state1 || d.state_name === state2);

        // Update scales
        xScale.domain(filteredData.map(d => d.state_name));
        yScale.domain([0, d3.max(filteredData, d => d.avg_KWH)]);

        // Bind data to bars
        const bars = plotGroup.selectAll(".bar")
            .data(filteredData, d => d.state_name);

        // Enter and update bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .merge(bars)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.state_name))
            .attr("y", d => yScale(d.avg_KWH))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.avg_KWH))
            .attr("fill", (d, i) => i === 0 ? "red" : "blue"); // Red for first bar, blue for second bar

        // Remove unused bars
        bars.exit().remove();

        // Update axes
        xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale));
        yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale));
    }

    // Initial render
    updateBarplot(states[0], states[1]);

    // Event listeners for dropdowns
    dropdown1.on("change", () => {
        const state1 = dropdown1.property("value");
        const state2 = dropdown2.property("value");
        updateBarplot(state1, state2);
    });

    dropdown2.on("change", () => {
        const state1 = dropdown1.property("value");
        const state2 = dropdown2.property("value");
        updateBarplot(state1, state2);
    });
});
