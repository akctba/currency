var quotes;
var base;

$(function () {

    // ITS TOOOOO SLOW...
    // --------
    // Getting the supported currencies
    // --------
    // set endpoint and your access key
    let endpoint = 'list'
    let access_key = '7bf3f43f40c8ad7d920b9891b290b40d';
    // get the most recent exchange rates via the "live" endpoint:
    $.ajax({
        url: 'http://api.currencylayer.com/' + endpoint + '?access_key=' + access_key,   
        dataType: 'jsonp',
        success: function(json) {
            // exchange rata data is stored in json.quotes
            //console.log(json);

            // clean the dropdown
            $('#menuFrom').html('');
            
            Object.keys(json.currencies).forEach(function(key) {
                var value = json.currencies[key];
                //console.log(key + " >>> " + value);
                $('#menuFrom').append(`<a class="dropdown-item" href="#" onclick="setCurrency('${key}', '${value}', 'from')">${key}</a>`);
                $('#menuTo').append(`<a class="dropdown-item" href="#" onclick="setCurrency('${key}', '${value}', 'to')">${key}</a>`);
            });

        }
    });

    // --------
    // Getting the quotes
    // --------
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("http://api.currencylayer.com/live?access_key=7bf3f43f40c8ad7d920b9891b290b40d&source=USD", requestOptions)
        .then((response) => {
            if (response.status !== 200) {
                console.error('Looks like there was a problem. Status Code:' + response.status);
                return;
            }

            response.json().then(function (data) {

                if (data.success) {

                    $('#time').html(dateToString(data.timestamp));
                    quotes = data.quotes;

                    if (data.terms)
                        $('#terms').attr('href', data.terms);
                    if (data.privacy)
                        $('#privacy').attr('href', data.privacy);

                    base = data.source;
                    $('#base').html(base);

                } else {
                    $('#time').text('We are really sorry. It was not possible to get the quotes. Tray again latter');
                }
                //console.log(quotes);
            });
        })
        // .then(result => {
        //     console.log(result);
        //      console.log(result.success);
        // })
        .catch(error => console.error('error', error));


});

// -----------------
// FORMATS THE TIME
// -----------------

function dateToString(timestamp) {
    
    let adjTimestamp = timestamp * 1000;

    let date = new Date(adjTimestamp);
    // Hours part from the timestamp
    let hours = date.getUTCHours();
    // Minutes part from the timestamp
    let minutes = "0" + date.getUTCMinutes();
    // Seconds part from the timestamp
    let seconds = "0" + date.getUTCSeconds();

    let wd;
    switch (date.getDay()) {
        case 0: wd = 'Sun'; break;
        case 1: wd = 'Mon'; break;
        case 2: wd = 'Tue'; break;
        case 3: wd = 'Wed'; break;
        case 4: wd = 'Thu'; break;
        case 5: wd = 'Fri'; break;
        case 6: wd = 'Sat'; break;
        default: wd = ''; break;
    }

    //console.log(">>>>>> " + date);
    let formattedTime = `${wd}, ${date.getUTCDate()}/${date.getUTCMonth()+1}/${date.getFullYear()} ${hours}:${minutes.substr(-2)}`; //  hours + ':' + minutes.substr(-2); // + ':' + seconds.substr(-2);
    return formattedTime;
}

function setCurrency(k, d, field) {
    $(`#button${field}`).html(k);
    $(`#c${field}`).val(k);
    $(`#desc${field}`).html(d);
    $('#inputfrom').val('');
    $('#inputto').val('');
}

function calculate() {
    
    let from = base+$('#cfrom').val();
    let to = base+$('#cto').val();

    if(from != '' && to != '') {
        let inputFrom = $('#inputfrom');
        let inputTo = $('#inputto');

        let rate1 = quotes[from];
        let rate2 = quotes[to];
        let conversion = (rate2/rate1)*inputFrom.val();
    
        inputTo.val(conversion.toFixed(2));
    }

}