const filename = "data/squirrels.csv";
let data = [];
const margin = 40;
let width = window.innerWidth - margin;
let height = window.innerHeight - margin;
async function drawMap() {
    // load data check if squirrels approach or runs from or are indifferent, pick 100 random squirrels
    data = await d3.csv(filename).then(data=>data.filter(d=>{
        return d['Approaches'] == "true" || d['Runs from'] == "true" || d['Indifferent'] == "true";
    }).sort(() => 0.5 - Math.random()).splice(0,100));

    await d3.json("data/centralPark.geojson").then(function (centralPark) {
        console.log(centralPark);
        // Define projection
        var projection = d3.geoIdentity().reflectY(true).fitSize([width - 20, height - 20], centralPark);

        // Define path generator
        var path = d3.geoPath().projection(projection);
        const svg = d3.select("#squirrels");
        // Render map
       
        const mapGroup = svg.append("g").attr("class", "map-paths");
      
        d3.select("#squirrels").selectAll(".map-path")
            .data(centralPark.features)
            .append("path")
            .attr("d", path)
            .attr("class", "map-path")
            .attr("fill", "#a7f3d0")
            .attr("stroke", "black");
        
        console.log(mapGroup)
        
        // Create force simulation
        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX().x(d => projection([d.X, d.Y])[0]))
            .force("y", d3.forceY().y(d => projection([d.X, d.Y])[1]))
            // .force("collide", d3.forceCollide(10).strength(1))
            .on("tick", ticked);
        // render points
        const glyphs = svg.append("g").attr("class", "glyphs");
        glyphs.selectAll(".glyph")
            .data(data)
            .enter().append("use")
            .attr("class", "glyph")
            .attr("xlink:href", d=>{
                return `#squirrel-${d['Primary Fur Color']}`;
            }) // Use the custom SVG glyph
            .attr("width", 20)
            .attr("height", 20)
            .attr("x", d => projection([d.X, d.Y])[0])
            .attr("y", d => projection([d.X, d.Y])[1]);
        // 
        // Function to update circle positions
        function ticked() {
            glyphs
                .data(data)
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
                const dx = 1 * ( mouseX - d.x);
                const dy = 1 * (mouseY - d.y);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if ( distance>0 && distance < 20) {
                    const angle = Math.atan2(dy, dx);
                    d.x += Math.cos(angle) * 2;
                    d.y += Math.sin(angle) * 2;
                    console.log(d.x, d.y);
                }
            });

            simulation.alpha(0.3).restart();
        });

    });
}

document.addEventListener("DOMContentLoaded", async (event) => {
    await drawMap();

});

