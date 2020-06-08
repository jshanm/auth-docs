var idx, searchInput, searchResults = null
var documents = []

function renderSearchResults(results, query){

    if (results.length > 0) {

        // show max 10 results
        if (results.length > 9){
            results = results.slice(0,10)
        }

        // reset search results
        searchResults.innerHTML = ''

        // append results
        results.forEach(result => {

            // create result item
            var article = document.createElement('article')
            var sample = getSample(documents[result.ref].content, query);
            article.innerHTML = `
            <a href="${result.ref}" onclick="return resetSearchBox();"><h3 class="title">${documents[result.ref].title}</h3></a>
            <p><a href="${result.ref}" onclick="return resetSearchBox();">${(sample)}</a></p>

            <br>
            `
            searchResults.appendChild(article)
        })

        // if results are empty
    } else {
        searchResults.innerHTML = '<p><strong>No results found.</strong></p>'
    }
}


function getSample (str, query) {

    var bolded = "<strong>" + query + "</strong>"


    var startIndex = str.indexOf(query);
    var endIndex = startIndex + query.length;

    return str.slice(startIndex, startIndex + 20);
}

function resetSearchBox() {
    document.getElementById('search-input').value = ''
    document.getElementById('search-results').innerText = ''
}

//...
function registerSearchHandler() {

    // register on input event
    searchInput.oninput = function(event) {

        // remove search results if the user empties the search input field
        if (searchInput.value == '') {

            searchResults.innerHTML = ''
        } else {

            // get input value
            var query = event.target.value

            // run fuzzy search
            var results = idx.search(query + '*')

            // render results
            renderSearchResults(results, query)
        }
    }

    // set focus on search input and remove loading placeholder
    searchInput.focus()
    searchInput.placeholder = ''
}
//...

//...
window.onload = function() {

    // get dom elements
    searchInput = document.getElementById('search-input')
    searchResults = document.getElementById('search-results')

    // request and index documents
    fetch('assets/lunr/index.json', {
        method: 'get'
    }).then(
        res => res.json()
    ).then(
        res => {

            // index document
            idx = lunr(function() {
                this.ref('href')
                this.field('title')
                this.field('content')

                res.forEach(function(doc) {
                    this.add(doc)
                    documents[doc.href] = {
                        'title': doc.title,
                        'content': doc.content,
                    }
                }, this)
            })

            // data is loaded, next register handler
            registerSearchHandler()
        }
    ).catch(
        err => {
            searchResults.innerHTML = `<p>${err}</p>`
        }
    )
}