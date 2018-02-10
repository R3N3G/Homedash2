function couchpotato(moduleId) {

    this.moduleId = moduleId;
    this.movies = [];

    this.documentReady = function (size) {
        var self = this;
        var root = self.root();

        root.find('.modal').attr('data-module', this.moduleId);

        root.find(".show-search").click(function () {
            sendMessage(self.moduleId, 'qualities', '');
            sendMessage(self.moduleId, 'folders', '');
            self.modal().appendTo(".modal-dump").modal('show');
        });

        this.modal().find(".search-submit").click(function (event) {
            self.searchMovie();
        });

        this.modal().on('click', ".movie", function (event) {

            var movie = self.movies[$(this).attr("data-index")];
            self.addMovie(movie);

        });
    };

    this.modal = function () {
        return $(document).find('.modal[data-module="' + this.moduleId + '"]');
    };

    this.root = function () {
        return rootElement(this.moduleId);
    };

    this.onMessage = function (size, command, message, extra) {
        this.processData(command, message, extra);
    }


    this.processData = function (command, message, extra) {
        if (command === 'refresh') {
            this.refresh(message);
        } else if (command === 'movieList') {
            this.populateMovieList(message);
        } else if (command === 'error') {
            this.modal().modal('hide');
        } else if (command === 'folders') {
            this.populatesFolders(message);
        } else if (command === 'qualities') {
            this.populateQualities(message);
        }
    };

    this.populateQualities = function (qualities) {

        var qualitySelect = this.modal().find('.quality');
        var qualitiesStr = '';
        $.each(qualities, function (i, quality) {
            qualitiesStr += '<option value="' + quality.id + '">' + quality.name + '</option>';
        });
        qualitySelect.html(qualitiesStr);
    };

    this.populatesFolders = function (folders) {

        var folderSelect = this.modal().find('.folder');
        var foldersStr = '';
        $.each(folders, function (i, folder) {
            foldersStr += '<option value="' + folder.id + '">' + folder.name + '</option>';
        });
        folderSelect.html(foldersStr);
    };

    this.searchMovie = function () {

        this.modal().find('.couchpotato-movie-list').html('<div class="loader"></div>');
        //$("#cp"+this.moduleId+"-modal").appendTo("body").modal('show');
        sendMessage(this.moduleId, 'searchMovie', this.modal().find('.search-query').val());
    };

    this.refresh = function (message) {
        if (!message) {
            this.root.find(".overlay").html('Couch potato is not available at the moment');
            this.root.find(".overlay").show();
        } else {
            this.root().css('background-image', 'url(' + message.poster + ')');
            this.root().find('.name').html(message.name);
        }

    };

    this.addMovie = function (movie) {
        var qualitySelect = this.modal().find('.quality');
        var folderSelect = this.modal().find('.folder');

        var movieRequest = {
            movie: movie,
            quality: {
                id: qualitySelect.val(),
                name: qualitySelect.find('option:selected').text()
            },
            folder: {
                id: folderSelect.val(),
                name: folderSelect.find('option:selected').text()
            }
        }
        sendMessage(this.moduleId, 'addMovie', JSON.stringify(movieRequest));
        this.modal().modal('hide');
    };


    this.populateMovieList = function (message) {
        var parent = this;
        var movieList = parent.modal().find('.couchpotato-movie-list');
        movieList.html('');
        this.movies = message;
        if (message.length > 0) {
            $.each(message, function (index, value) {
                movieList.append(parent.movieToHtml(index, value));
                //$("#cp" + parent.moduleId + "-movieList").append('<hr style="border-color: black;
                // margin:0"/>');
            });
        } else {
            movieList.html('<p>No results</p>');
        }

    };

    this.movieToHtml = function (index, movie) {
        var html = [];
        html.push('<div class="movie" data-index="' + index + '">');
        html.push('<div class="movie-poster" style="background-image:url(', movie.poster,
            ');"></div>');
        html.push('<p class="movie-name"><strong>', movie.originalTitle, ' </strong>');

        if (movie.wanted) {
            html.push('<small>(already wanted)</small>');
        }

        if (movie.inLibrary) {
            html.push('<small>(already in library)</small>');
        }

        html.push(' - <span class="cp-movie-year">', movie.year, '</span></p>');

        html.push('</div>');
        return html.join('');

    }

}