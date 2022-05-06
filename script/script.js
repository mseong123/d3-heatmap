var marginLeft=80;
var marginBottom=60;
var margin=20;
var width=900-marginLeft-margin;
var height=460-margin-marginBottom;

var colorScheme=["#f5f5f5","#f6e8c3", "#dfc27d", "#bf812d", "#8c510a", "#543005", "#003c30", "#01665e", "#35978f", "#80cdc1", "#c7eae5", ];
var fetchedData;

var svg=d3.select("#svg").append("g")
        .attr("transform","translate("+marginLeft+","+margin+")")

var legend=d3.select("#svg").append("g")
        .attr("id","legend")
        .attr("transform","translate("+((width-(colorScheme.length-1)*40)/2)+","+(height+40)+")")

var legendText=d3.select("#svg").append("g")
        .attr("transform","translate("+((width-(colorScheme.length-1)*40)/2)+","+(height+40+20)+")")

//3 bands - x,y and color
var x=d3.scaleBand().range([0,width])
var y=d3.scaleBand().range([height,0])
var color=d3.scaleThreshold().range(colorScheme)
        
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then(
    data=>{
        fetchedData=data;
        data.monthlyVariance.forEach(d=>d.month=d.month-1)
        update(fetchedData)
    }
)        

function update(data) {
    x.domain(data.monthlyVariance.map(d=>d.year))
    y.domain(data.monthlyVariance.map(d=>d.month))
    var baseTemp=data.baseTemperature;
    //scaleThreshold domain colorscheme calculation.
    var thresholdStep=d3.extent(data.monthlyVariance,d=>baseTemp+d.variance).reduce((a,b)=>a+b)/(color.range().length-1)
    
    var thresholds=[d3.min(data.monthlyVariance,d=>data.baseTemperature+d.variance)];
    var totalSum=thresholds[0];
    for (var i=0;i<9;i++) {
        thresholds.push(totalSum+=thresholdStep)
    }
    
    color.domain(thresholds)

    //render axis
    svg.append("g")
            .attr("transform","translate(0,"+height+")")
            .attr("id","x-axis")
            .attr("opacity","0")
        .call(d3.axisBottom(x).tickValues(x.domain().filter(d=>d%10===0)))
        .transition().duration(1500)
            .attr("opacity","1")
            
    svg.append("g")
            .attr("id","y-axis")
            .attr("opacity","0")
        .call(d3.axisLeft(y).tickFormat(d=>d3.timeFormat("%B")(d3.timeParse("%m")(d+1))))
        .transition().duration(1500)
            .attr("opacity","1")

    //data join with transition effect for main rect
    var update=svg.selectAll("rect")
        .data(data.monthlyVariance)

    var enter=update.enter().append("rect")
            .attr("transform",d=>"translate("+x(d.year)+","+y(d.month)+")")
            .attr("width",x.bandwidth())
            .attr("height",y.bandwidth())
            .attr("opacity","0")
            .attr("data-month",d=>d.month)
            .attr("data-year",d=>d.year)
            .attr("data-temp",d=>d.variance+baseTemp)
            .attr("class","cell")
            .style("fill",d=>color(d.variance+baseTemp))
            .on("mouseover",(d,i,nodes)=>{
                d3.select("#tooltip")
                        .attr("data-year",d.year)
                        .html("Year: "+d.year+"<br>Month: "+d.month+"<br>Temperature: "+(d.variance+baseTemp))
                        .style("left",(d3.event.pageX+20)+"px")
                        .style("top",(d3.event.pageY-20)+"px")
                    .transition().duration(300)
                        .style("opacity","0.9");

                d3.select(nodes[i])
                        .style("fill","black")
                        
            })
            .on("mouseout",(d,i,nodes)=>{
                d3.select("#tooltip")
                    .transition().duration(300)
                        .style("opacity","0");

                d3.select(nodes[i])
                        .style("fill",d=>color(d.variance+baseTemp)) 
            })
        .transition().duration(1500)
            .attr("opacity","1")
    
    //legend data join
    var tempColorRange=color.range().slice()
    tempColorRange.pop();

    legend.selectAll("rect")
        .data(tempColorRange).enter().append("rect")
            .attr("x",(d,i)=>i*40)
            .attr("width","40")
            .attr("height","20")
            .attr("fill",d=>d)
            .attr("opacity","0")
        .transition().duration(1500)
            .attr("opacity","1")     
    //legend text   
    legendText.selectAll("text")
        .data(color.domain().map(d=>d.toFixed(2))).enter().append("text")
            .attr("x",(d,i)=>i*40)
            .attr("dy","0.8em")
            .attr("dx","0.3em")
            .attr("width","40")
            .style("font-size","10px")
            .text(d=>"< "+d)
            .attr("opacity","0")
        .transition().duration(1500)
            .attr("opacity","1")  
    
            
}



