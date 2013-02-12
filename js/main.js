// todo: refactor. get rid of these ugly globals
var harvard_ret = false;
var nuremberg_ret = false;
var nuremberg_found = 0;
var hollis_found = 0;

// thanks http://stackoverflow.com/a/5493614
function supportsSvg() {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
}

function draw_doughnut() {
    // Let's see if we received any usable data. If so, draw it. If not, hide the vis.
    var data = 	[
    	  {coll: 'Nuremberg', num_found: nuremberg_found},
    	  {coll: 'Hollis', num_found: hollis_found}
    	];
    
    var total_count = 0;
    data.forEach(function(d) {
        total_count = total_count +d.num_found;
    });

	if (total_count > 0 && supportsSvg()) {
		$('#vis').empty();
		$('#vis').show();

    	var width = 320,
    	    height = 250,
    	    radius = Math.min(width, height) / 2;

    	var color = d3.scale.ordinal()
    	    .range(["#84CF27", "#44ABE0"]);

    	var arc = d3.svg.arc()
    	    .outerRadius(radius - 30)
    	    .innerRadius(radius - 70);

    	var pie = d3.layout.pie()
    	    .sort(null)
    	    .value(function(d) { return d.num_found; });

    	var svg = d3.select("#vis").append("svg")
    	    .attr("width", width)
    	    .attr("height", height)
    	  	.append("g")
    	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    	  data.forEach(function(d) {
    	    d.num_found = +d.num_found;
    	  });

    	  var g = svg.selectAll(".arc")
    	      .data(pie(data))
    	    .enter().append("g")
    	      .attr("class", "arc");

    	  g.append("path")
    	      .attr("d", arc)
    	      .style("fill", function(d) { return color(d.data.coll); });

    /*	  g.append("text")
    	      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    	      .attr("dy", ".35em")
    	      .style("text-anchor", "middle")
    	      .text(function(d) { return d.data.age; });*/

    //	});
    } else {
        $('#vis').hide();
    }
}



function get_results() {
    // Get LC results for nuremberg collection
    var query = $('#search-form [name=q]').val();

    var lc_url = "http://librarycloud.harvard.edu/v1/api/item/?callback=?&filter=collection:nuremberg_trials";

	if (query) {
	    lc_url += '&filter=keyword:' + query;
	}

    $.getJSON(lc_url).done( function(data) {
        nuremberg_found=data.num_found;

		var template = Handlebars.compile( $("#docs-template").html() );
		var html = template(data);
        $('#nuremberg').html(html);
        
        template = Handlebars.compile( $("#results-num-template").html() );
		html = template(data);
        $('#nuremberg-result-nums').html(html);
        
        nuremberg_ret = true;
        
        if (harvard_ret === true && nuremberg_ret === true){        
            draw_doughnut();
        }
    });

    // Get LC results for hollis collection
    var lc_url = "http://librarycloud.harvard.edu/v1/api/item/?callback=?&filter=collection:hollis_catalog";

	if (query) {
	    lc_url += '&filter=keyword:' + query;
	}

    $.getJSON(lc_url).done( function(data) {
        
        hollis_found=data.num_found;
		var template = Handlebars.compile( $("#docs-template").html() );
		var html = template(data);
        $('#harvard').html(html);

        template = Handlebars.compile( $("#results-num-template").html() );
		html = template(data);
        $('#harvard-result-nums').html(html);
        
        harvard_ret = true;

        if (harvard_ret === true && nuremberg_ret === true) {
            draw_doughnut();
        }
    });
}

// Make a large number pretty by adding commas
Handlebars.registerHelper('commify-number', function(number) {
    return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

// Our one search form, and only interactive piece of the page
$("form").submit(function () {

    harvard_ret = false;
    nuremberg_ret = false;

    get_results()
    
    return false;
});

// On load, draw results
$( function() {
    get_results();
	
	// Thanks to http://stackoverflow.com/a/12654402
	var el = $('#search-form [name=q]').get(0);
    var elemLen = el.value.length;
    el.selectionStart = elemLen;
    el.selectionEnd = elemLen;
    el.focus();
	
});