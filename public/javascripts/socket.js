var socket = io.connect('http://localhost');
var totalNogeoTweets = 0;
var limitTweetsTable = 100;

jQuery(function($) {
    
    var tweetsWithoutGeoTable = $("#nogeotweetstable").find('tbody');

    socket.on('tweets', function(data) {
        console.log(data.text);
        updateTotalTweetsWithoutGeo();
            // Check Limit
            if(totalNogeoTweets >= limitTweetsTable) {
                removeTableRow($("#nogeotweetstable"));
            }
        // add it to the table
        tweetsWithoutGeoTable.prepend(data.text);
    });
});

/**
 * Updating  tweets counter without geotag
 *
 */
function updateTotalTweetsWithoutGeo() {
    totalNogeoTweets = totalNogeoTweets + 1;
    $("span#totaltweetWithoutGeo").html(totalNogeoTweets);
}

/**
 * Remove last table row
 *
 * @param a Table
 */
function removeTableRow(jQtable){
    jQtable.each(function(){
        if($('tbody', this).length > 0){
            $('tbody tr:last', this).remove();
        }else {
            $('tr:last', this).remove();
        }
    });
}