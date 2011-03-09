$(function() {
    var last_action_mouseout;
    $('#signin')
        .mouseover(function() {
            $('#signin_list').show();
            last_action_mouseout = false;
        })
        .mouseout(function() {
            last_action_mouseout = true;
            setTimeout(function() {
                if (last_action_mouseout) {
                    $('#signin_list').hide();
                }
            }, 100);
        });
});
