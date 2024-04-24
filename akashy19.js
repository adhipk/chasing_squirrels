const filename = "data/squirrels.csv";
let data = [];
const margin = 40;
let width = window.innerWidth - margin;
let height = window.innerHeight - margin;
async function drawMap() {
    // load data check if squirrels approach or runs from or are indifferent, pick 100 random squirrels`
    data = await d3.csv(filename).then(data=>data.filter(d=>{
        return d['Approaches'] == "true" || d['Runs from'] == "true" || d['Indifferent'] == "true";
    }).sort(() => 0.5 - Math.random()).splice(0,100));
    console.log(data);
    await d3.json("data/centralPark.geojson").then(function (centralPark) {

        // Define projection
        var projection = d3.geoIdentity().reflectY(true).fitSize([width - 20, height - 20], centralPark);
        // Define path generator
        var path = d3.geoPath().projection(projection);

        const svg = d3.select("#squirrels");
        // Render map
        svg.selectAll("path")
            .data(centralPark.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#a7f3d0")
            .attr("stroke", "black")

        // Create force simulation
        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX().x(d => projection([d.X, d.Y])[0]))
            .force("y", d3.forceY().y(d => projection([d.X, d.Y])[1]))
            // .force("collide", d3.forceCollide(10).strength(1))
            .on("tick", ticked);
        // render points
        const circles = svg.selectAll("circle")
            .data(data)
            .enter().append("use")
            .attr("xlink:href", d=>`#squirrel-${d['Primary Fur Color']}`)
            .attr('width', 20)
            .attr('height', 20)
            .attr("x", function (d) { return projection([d.X, d.Y])[0]+10; })
            .attr("y", function (d) { return projection([d.X, d.Y])[1]+10; });
        // 
        // Function to update circle positions
        function ticked() {
            circles
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        }
        svg.on("mousemove", function (event) {
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;

            data.forEach(d => {
                let forceDirection = 0;
                if(d['Approaches'] == "true"){
                    forceDirection = 1;
                }
                else if(d['Runs from'] == "true"){
                    forceDirection = -1;
                }
                const dx = forceDirection * ( mouseX - d.x);
                const dy = forceDirection * (mouseY - d.y);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if ( distance>0 && distance < 20) {
                    const angle = Math.atan2(dy, dx);
                    d.x += Math.cos(angle) * 2;
                    d.y += Math.sin(angle) * 2;
                }
            });

            simulation.alpha(0.3).restart();
        });

    });
}

document.addEventListener("DOMContentLoaded", async (event) => {
    await drawMap();

});

