var svg;

d3.imDiagram = function() {
    var imDiagram = {};
    
    var diagramHeight = 0;
    var diagramWidth = 0;
    
    var nodeHeight = 50;
    var nodeWidth = 8;
    var nodePadding = 8;
    
    var horizontalHeaders = [];
    var verticalHeaders = [];
    var nodes = [];
    var links = [];
    
    
    imDiagram.diagramHeight = function(_height) {
        if (!arguments.length) return diagramHeight;
        diagramHeight = _height;
        return imDiagram;
    };
    
    imDiagram.diagramWidth = function(_width) {
        if (!arguments.length) return diagramWidths;
        diagramWidth = _width;
        return imDiagram;
    };
    
    imDiagram.horizontalHeaders = function(_headers) {
        if (!arguments.length) return horizontalHeaders;
        horizontalHeaders = _headers;
        compute.horizontalHeaders(horizontalHeaders, diagramWidth);
        return imDiagram;
    };
    
    imDiagram.verticalHeaders = function(_headers) {
        if (!arguments.length) return verticalHeaders;
        verticalHeaders = _headers;
        return imDiagram;
    };
    
    imDiagram.nodeHeight = function(_height) {
        if (!arguments.length) return nodeHeight;
        nodeHeight = _height;
        return imDiagram;
    };
    
    imDiagram.nodeWidth = function(_width) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = _width;
        return imDiagram;
    };
    
    imDiagram.nodePadding = function(_padding) {
        if (!arguments.length) return nodePadding;
        nodePadding = _padding;
        return imDiagram;
    };
    
    imDiagram.nodes = function(_nodes) {
        if (!arguments.length) return nodes;
        nodes = _nodes;
        return imDiagram;
    };
    
    imDiagram.links = function(_links) {
        if (!arguments.length) return links;
        links = _links;
        return imDiagram;
    };
    
    imDiagram.link = function() {
        var curvature = .5;

        function link(_link) {
          var x0 = _link.source.x + _link.source.dx,
              x1 = _link.target.x,
              xi = d3.interpolateNumber(x0, x1),
              x2 = xi(curvature),
              x3 = xi(1 - curvature),
              y0 = _link.source.y + _link.sy,
              ytr = _link.target.y + _link.ety,
              ybr = ytr + _link.edy,
              ybl = y0 + _link.dy;
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

        link.curvature = function(_curvature) {
          if (!arguments.length) return curvature;
          curvature = +_curvature;
          return link;
        };

        return link;
      };
    
    return imDiagram;
};

header = function(text) {
    var header = {};
    
    var text = text;
    var x = 0;
    var y = 0;
    
    header.text = function(_text) {
        if (!arguments.length) return text;
        text = _text;
        return header;
    };
    
    header.x = function(_x) {
        if (!arguments.length) return x;
        x = _x;
        return header;
    };
    
    header.y = function(_y) {
        if (!arguments.length) return y;
        y = _y;
        return header;
    };
    
    return header;
};

var compute = {};

compute.horizontalHeaders = function(_headers, _width, padding) {
    assert(arguments.length > 1);
    if (arguments.length < 3) {
        var padding = 20; 
    }

    var count = _headers.length;
    var width = _width - 2*padding;
    xSteps = Math.floor((width / (count-1)));
    
    for (var i = 0; i < count; i++) {
        _headers[i].x(padding + xSteps * i);
    }
    
    return headers;
};


imPlotting = function(width, height) {
    imPlotting = {};
    
    diagram = d3.imDiagram();
    diagram.diagramWidth(width).diagramHeight(height);

    svg = d3.select('.implotting-canvas').append('svg').attr("width", width).attr("height", height);
    
    headers = [];
    headers.push(header("test"));
    headers.push(header("nieuw"));
    headers.push(header("dit werkt"));
    diagram.horizontalHeaders(headers);
    
    xHeaders = svg.selectAll(".horizontalHeader").data(diagram.horizontalHeaders()).enter();
    xHeaders.append("text").style("fill", "#1976D2").style("font-weight", 400).style("text-anchor", "middle").attr("y", 40).attr("x", function(header, b) {
                return header.x();
            }).text(function(a, b) {
                return a.text();
            });
    
    
    return imPlotting;
};


//--------default functions below

function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message;
    }
}