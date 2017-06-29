validator_submit_form = true;
window.addEventListener("load", function () {

    $("form").submit(function (event) {
        if (validator_submit_form) {
            event.preventDefault();
            validateForm(event);
        }
    });

    $(".cancel").click(function () {
        location.reload();
    });

});

function validateForm(e) {

    var validator = false;
    $(e.target).find('input').each(function () {
        if (!validateFormInput($(this)[0])) {
            validator = true;
            return false;
        }
    });

    if (validator)
        return false;

    if ($('input[name=user_department]').length) {
        if ($('input[name=user_department]:checked').val() === undefined) {
            return false;
        }
    }

    validator_submit_form = false;
    $(e.target).submit();

}

/** UTILITY */
function validateFormInput(inpt) {

    var pattern_name = inpt.getAttribute("data-validation");

    if (pattern_name === undefined) {
        inpt.focus();
        return false;
    }
    if (pattern_name === "none") {
        return true;
    }
    if (pattern_name === 'text') {
        if (inpt.value != '') {
            return true;
        } else {
            inpt.focus();
            return false;
        }
    }
    if (pattern_name === 'phone') {
        var pattern = /^(\+1)? ?\(?[0-9]{3}\)? ?-?[0-9]{3} ?-?[0-9]{2} ?-?[0-9]{2}$/;
    }
    if (pattern_name === 'password') {
        var pattern = /^.{6,16}$/;
    }
    if (pattern_name === 'name') {
        var pattern = /^[a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_-\s]{2,256}$/;
    }
    if (pattern_name === 'nameaccount') {
        var pattern = /^[a-zA-Z0-9_\-]{2,256}$/;
    }
    if (pattern_name === 'email') {
        var pattern = /^.{2,30}@.{2,30}\.[a-zA-Z]{2,6}$/;
    }
    if (pattern_name === 'code') {
        var pattern = /^[a-zA-Z0-9\s\- ]{2,64}$/;
    }
    if (pattern_name === 'date') {
        var pattern = /(^20(1[5-9]{1}|[2-9]{1}[0-9]{1})-(0[1-9]{1}|1[0-2]{1})-([0-2]{1}[0-9]{1}|3[0-1]{1})$|^[a-zA-Z]{3,10} ([0-2]{1}[0-9]{1}|3[0-1]{1}), 20(1[0-9]{1}|[2-9]{1}[0-9]{1}), [0-9]{1,2}:[0-9]{1,2} (pm|am)$)/;
    }
    if (pattern_name === 'file') {
        var pattern = /^.{0,256}\.(png|jpg|jpeg|gif)$/;
    }
    if (pattern_name === 'color') {
        var pattern = /(^#[a-zA-Z0-9]{3,6}$)|(^rgba{0,1}\([0-9]{1,3}\,[0-9]{1,3}\,[0-9]{1,3}(\,0\.[0-9]{1,2}){0,1}\){0,256})$/;
    }
    /*if (pattern_name === 'text') {
     var pattern = /^[a-zA-Z0-9ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ_-\s]{2,256}$/;
     }
     if (a.search('address') != -1) {
     var pattern = /^.{0,256}$/;
     }
     
     if (pattern_name === 'number') {
     var pattern = /^[0-9]{0,256}$/;
     }*/
    if (pattern === undefined) {
        inpt.focus();
        return false;
    }
    if (inpt.value.match(pattern)) {
        return true;
    }

    inpt.focus();
    return false;

}