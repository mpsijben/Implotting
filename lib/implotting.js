var svg;

d3.imDiagram = function() {
    imDiagram = {};
    
    var diagramHeight = 0;
    var diagramWidth = 0;
    
    var nodeHeight = 50;
    var nodeWidth = 8;
    var nodePadding = 8;
    
    var horizontalHeaders = [];
    var verticalHeaders = [];
    var nodes = [];
    var links = [];
    
    
    imDiagram.diagramHeight = function(height) {
        if (!arguments.length) return diagramHeight;
        diagramHeight = height;
        return imDiagram;
    };
    
    imDiagram.diagramWidth = function(width) {
        if (!arguments.length) return diagramWidths;
        diagramWidth = width;
        return imDiagram;
    };
    
    imDiagram.horizontalHeaders = function(headers) {
        if (!arguments.length) return horizontalHeaders;
        horizontalHeaders = headers;
        return imDiagram;
    };
    
    imDiagram.verticalHeaders = function(headers) {
        if (!arguments.length) return verticalHeaders;
        verticalHeaders = headers;
        return imDiagram;
    };
    
    imDiagram.nodeHeight = function(height) {
        if (!arguments.length) return nodeHeight;
        nodeHeight = height;
        return imDiagram;
    };
    
    imDiagram.nodeWidth = function(width) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = width;
        return imDiagram;
    };
    
    imDiagram.nodePadding = function(padding) {
        if (!arguments.length) return nodePadding;
        nodePadding = padding;
        return imDiagram;
    };
    
    imDiagram.nodes = function(nodes) {
        if (!arguments.length) return nodes;
        nodes = nodes;
        return imDiagram;
    };
    
    imDiagram.links = function(links) {
        if (!arguments.length) return links;
        links = links;
        return imDiagram;
    };
    
    imDiagram.link = function() {
        var curvature = .5;

        function link(d) {
          var x0 = d.source.x + d.source.dx,
              x1 = d.target.x,
              xi = d3.interpolateNumber(x0, x1),
              x2 = xi(curvature),
              x3 = xi(1 - curvature),
              y0 = d.source.y + d.sy,
              ytr = d.target.y + d.ety,
              ybr = ytr + d.edy,
              ybl = y0 + d.dy;
          return "M" + x0 + "," + y0
               + "C" + x2 + "," + y0
               + " " + x3 + "," + ytr
               + " " + x1 + "," + ytr
               + "L" + x1 + "," + ybr
               + "C" + x3 + "," + ybr
               + " " + x2 + "," + ybl
               + " " + x0 + "," + ybl
               + "L" + x0 + "," + (y0);
        }

        link.curvature = function(_) {
          if (!arguments.length) return curvature;
          curvature = +_;
          return link;
        };

        return link;
      };
    
    return imDiagram;
};



imPlotting = function(width, height) {
    imPlotting = {};

    svg = d3.select('.implotting-canvas').append('svg').attr("width", width).attr("height", height);
    
    return imPlotting;
};