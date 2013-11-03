$(function() {
	// Start
	loadTemplates();
	window.setup = {};// setup functions
	$('.dataContent').hide();

	function loadTemplates() {
		window.templates = {};

		// Education
		$.get('hbs/edu.hbs', function(data) {
			window.templates.edu = Handlebars.compile(data);
		});

		// Work
		$.get('hbs/work.hbs', function(data) {
			window.templates.work = Handlebars.compile(data);
		});

		// People
		$.get('hbs/personCard.hbs', function(data) {
			window.templates.personCard = Handlebars.compile(data);
		});
	}

	// Search bar
	var lastQuery = '';
	$('.searchbar').click(function() {
		// Remove headers
		var fadeTime = 300;
		$('.homeHeader').fadeOut(fadeTime, function() {
			$(this).remove();
		});
		$('.searchbarHeader').fadeOut(fadeTime, function() {
			$(this).remove();
			$('.dataContent').fadeIn();
		});



		// Scroll search to top
		$('.searchArea').animate({
			top: 0
		}, fadeTime);
	}).change(function () {
		searchApi($(this).val());
	});

	$('.searchButton').click(function() {
		searchApi($('.searchbar').val());
		IN.API.PeopleSearch()
        .fields("id", "firstName", "lastName", "headline", "industry", "positions", "picture-url", "summary")
        .params({
          "title": $('.searchbar').val(),
          "count": 3
        })
        .result(function(result, metadata) {
          $("#comparisonPictureUrl").attr("src",result.people.values[0].pictureUrl);
        });
	});

	// Search
	function searchApi(query) {
		// Make API call
		var data = {
			query: query
		};
		if (query && query !== lastQuery) {
			lastQuery = query;
			$.get('/api', data, function(apiData) {
				showResults(apiData);
			});
		}
	}

	function fixData(apiData) {
		//majors
		var maxmajorCount = 0;
		for (var i in apiData.majors) {
			maxmajorCount = Math.max(maxmajorCount, apiData.majors[i].count);
		}
		for (var i in apiData.majors) {
			apiData.majors[i].percent = (apiData.majors[i].count / maxmajorCount) * 100;
		}

		//skill
		var maxskillCount = 0;
		for (var i in apiData.skills) {
			maxskillCount = Math.max(maxskillCount, apiData.skills[i].count);
		}
		for (var i in apiData.skills) {
			apiData.skills[i].percent = (apiData.skills[i].count / maxskillCount) * 100;
		}

		//title
		var maxTitleCount = 0;
		for (var i in apiData.titles) {
			maxTitleCount = Math.max(maxTitleCount, apiData.titles[i].count);
		}
		for (var i in apiData.titles) {
			apiData.titles[i].percent = (apiData.titles[i].count / maxTitleCount) * 100;
		}

		return apiData;
	}

	function showResults(apiData) {
		apiData = fixData(apiData);
		// Education
		$('#edu').html(window.templates.edu(apiData));
		// Work
		$('#work').html(window.templates.work(apiData));
		// People
		$('.cards').html(window.templates.personCard(apiData));

		window.setup.edu(apiData);
		// window.setup.work(apiData);
		window.setup.person(apiData);
		var curr = $(".curr");
		curr.html($(".searchbar").val());
	}
});