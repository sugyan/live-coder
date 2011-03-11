$(function() {
    var mouseout = true;
    $('#signin')
        .mouseover(function() {
            $('#signin_list').show();
            mouseout = false;
        })
        .mouseout(function() {
            mouseout = true;
            setTimeout(function() {
                if (mouseout) {
                    $('#signin_list').hide();
                }
            }, 100);
        });
});
