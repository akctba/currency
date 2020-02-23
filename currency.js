var quotes;
var base;
var currencies;
var historicalData = {};

$(function () {
    currenciesList();
    getQuotes();
    getHistory();
});

function currenciesList() {
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
        success: function (json) {
            // exchange rata data is stored in json.quotes
            //console.log(json);
            currencies = json.currencies;

            // clean the dropdown
            $('#cfrom').html("<option value='' selected>From</option>");
            $('#cto').html("<option value='' selected>To  </option>");

            Object.keys(currencies).forEach(function (key) {
                var value = currencies[key];
                //console.log(key + " >>> " + value);
                $('#cfrom').append(`<option value="${key}">${key}</option>`);
                $('#cto').append(`<option value="${key}">${key}</option>`);
                //$('#cto').append(`<a class="dropdown-item" href="#" onclick="setCurrency('${key}', '${value}', 'to')">${key}</a>`);
            });

        }
    });
}

function getQuotes() {
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

                    $('#time').html(dateToString(data.timestamp) + ' UTC');
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
}

function getHistory() {
    // --------
    // Getting history
    // --------
    let size = 7;
    let days = Array(size) // Create empty array of seven days
        .fill(new Date()) // Fill it with dates of your choice, here today.
        .map((today, i) => new Date(today - 8.64e7 * (size-i))) // Subtract days worth of time times the index
        //.map(day => new Date(day));
        .map(day => formatYmd(day));
        historicalData['size'] = size;
    
    days.forEach((d, i) => {
        //console.log(`Buscando ${d} historicalData: ${historicalData.length}`);

        $.ajax({
            url: `http://api.currencylayer.com/historical?date=${d}&access_key=7bf3f43f40c8ad7d920b9891b290b40d`,
            dataType: 'jsonp',
            success: function (json) {
                if(json.success) {
                    //console.log('Hist of ' + d);
                    historicalData[`d${i}`] = json;
                }
            }
        });
    });

}

function formatYmd(day) {
    let ymd = day.getFullYear() + '-';
    ymd += (day.getMonth() < 10 ? '0' : '') + (day.getMonth() + 1) + '-';
    ymd += (day.getDate() < 10 ? '0' : '') + day.getDate();
    return ymd;
}

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
        case 0:
            wd = 'Sun';
            break;
        case 1:
            wd = 'Mon';
            break;
        case 2:
            wd = 'Tue';
            break;
        case 3:
            wd = 'Wed';
            break;
        case 4:
            wd = 'Thu';
            break;
        case 5:
            wd = 'Fri';
            break;
        case 6:
            wd = 'Sat';
            break;
        default:
            wd = '';
            break;
    }

    //console.log(">>>>>> " + date);
    let formattedTime = `${wd}, ${date.getUTCDate()}/${date.getUTCMonth()+1}/${date.getFullYear()} ${hours}:${minutes.substr(-2)}`; //  hours + ':' + minutes.substr(-2); // + ':' + seconds.substr(-2);
    return formattedTime;
}

function calculate() {

    if ($('#cfrom').val() && $('#cto').val()) {
        let from = base + $('#cfrom').val();
        let to = base + $('#cto').val();

        let inputFrom = $('#inputfrom');
        let inputTo = $('#inputto');

        let rate1 = quotes[from];
        let rate2 = quotes[to];
        let conversion = (rate2 / rate1) * inputFrom.val();

        inputTo.val(conversion.toFixed(2));

    }
}

function historical() {
    let from = $('#cfrom').val();
    let to = $('#cto').val();

    if (from && to) {

        let labeldays = [];
        let values = [];

        for(let i=0; i<historicalData.size; i++) {
            labeldays.push(historicalData[`d${i}`].date);
            let conversion = (historicalData[`d${i}`].quotes[base+to] / historicalData[`d${i}`].quotes[base+from]);
            values.push(conversion.toFixed(2));
        }
        //console.log(labeldays);

        var ctx = document.getElementById('historicalChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: labeldays,
                datasets: [{
                    label: `${from}-${to}`,
                    backgroundColor: 'rgba(0, 163, 0, 0.5)',
                    borderColor: 'rgb(0, 163, 0)',
                    data: values
                }]
            },

            // Configuration options go here
            options: {}
        });

    }
}

function setCurrency(field) {
    if (field.value) {
        $(`#${field.id}_desc`).html(currencies[field.value]);
    } else {
        $(`#${field.id}_desc`).html('');
    }

    // $('#inputfrom').val('');
    // $('#inputto').val('');
    calculate();

    historical();
}