var url = window.location.href;

function getURLParam(paramName) {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);

    return urlParams.get(paramName);
}

function ajaxGet(url, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        success: function(a) {
            callback(a)
        },
        error: function (a) {
            console.log("Error: ", a);
        }
    });
}
