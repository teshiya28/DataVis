document.addEventListener('DOMContentLoaded', function () {
    const countryISO = window.localStorage.getItem('selectedCountryISO');
    const countryName = window.localStorage.getItem('selectedCountryName');
    const yearSelect = document.getElementById('yearSelect');
    const countryNameElem = document.getElementById('countryName');

    if (!countryISO || !countryName) {
        alert("No country selected.");
        return;
    }

    countryNameElem.textContent = countryName;

    d3.csv("Injuries_All.csv").then(injuriesData => {
        const countryData = injuriesData.filter(d => d.COU === countryISO);

        if (countryData.length === 0) {
            alert("No data available for the selected country.");
            return;
        }

        const years = Array.from(new Set(countryData.map(d => +d.Year)));
        years.sort((a, b) => a - b);

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        yearSelect.addEventListener('change', function () {
            updateLineChart(countryData, +this.value);
        });

        yearSelect.dispatchEvent(new Event('change'));
    });

    function updateLineChart(data, selectedYear) {
        const filteredData = data.filter(d => +d.Year <= selectedYear);

        const svg = d3.select('#line-chart').html('').append('svg').attr('width', '100%').attr('height', '500');
        const margin = { top: 20, right: 30, bottom: 180, left: 80};

        const width = svg.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = svg.attr('height') - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain(d3.extent(filteredData, d => +d.Year)).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => +d.Value)]).range([height, 0]);

        const line = d3.line()
            .x(d => x(+d.Year))
            .y(d => y(+d.Value));

        g.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')));
        
        g.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y));

        g.append('path')
            .datum(filteredData)
            .attr('class', 'line')
            .attr('d', line)
            .style('stroke', 'red')
            .style('fill', 'none')
            .style('stroke-width', '2px');

        g.selectAll('.dot')
            .data(filteredData)
            .enter().append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(+d.Year))
            .attr('cy', d => y(+d.Value))
            .attr('r', 3)
            .style('fill', 'red');
    }
});
