const fetch = require('node-fetch');
const cheerio = require('cheerio');

const searchUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';
const movieUrl = 'https://www.imdb.com/title/';


function searchMovies(searchTerm) {
    return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body =>{
        const movies = [];
        const $ = cheerio.load(body);
        $('.findResult').each(function(i, element){
            const $element = $(element);
            const $image = $element.find('td a img');
            const $title = $element.find('td.result_text a');
            
            // gets the imdbID by doing a regex exp
            // to get everything between title/ and /
            const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];

            const movie = {
                image: $image.attr('src'),
                title: $title.text(),
                imdbID
            };
            movies.push(movie);            
        });
        return(movies);
    });
}

function getMovie (imdbID) {
    return fetch(`${movieUrl}${imdbID}`)
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body);
            const $title = $('.title_wrapper h1');

            const title = $title.first().contents().filter(function() {
                return this.type === 'text';
            }).text().trim();

            const $rating = $('.title_wrapper .subtext');
            const rating = $rating.text().trim().match(/[^|]*/)[0].trim();
            const runTime = $('.subtext time').text().trim();
            const genres = [];
            $('.subtext a').each(function(i, element){
                const genre = $(element).text().trim();
                genres.push(genre);
                });
            const releaseDate = genres.pop();
            const imdbRating = $('span[itemProp="ratingValue"]').text();
            const poster = $('div.poster a img').attr('src');
            const summary = $('div.summary_text').text().trim();
            const directors = [];
            $('.plot_summary .credit_summary_item').eq(0).each(function(i, element){
                const director = $(element).text().trim().match(/(?<=\n).*/)[0];
                // const director = $(element).text().trim().match(/[^\:]*/);
                console.log(director);
                directors.push(director);
            });

            // const $writers = $('.plot_summary .credit_summary_item').eq(1).text().trim().match(/.+,(.+)/)[0];
            // const writers = $writers.match(/[^|]*/)[0].trim();
            // const stars = [];
            // const star1 = $('.credit_summary_item a').slice(2).eq(0).text();
            // const star2 = $('.credit_summary_item a').slice(2).eq(1).text();
            // const star3 = $('.credit_summary_item a').slice(2).eq(2).text();
            // stars.push(star1, star2, star3);

            return {
                imdbID,
                title,
                rating,
                runTime,
                genres,
                releaseDate,
                imdbRating,
                poster,
                summary,
                directors,
                // writers,
                // stars,
            }
        });
}

module.exports = {
    searchMovies,
    getMovie
};
