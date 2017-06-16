window.chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(231,233,237)'
};

window.randomScalingFactor = function () {
    return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
}

function sortSelectedAnswers(suspend_data) {

    var string = suspend_data.split(",");
    var section;
    var question;
    var answer;
    var weight;
    var data = {};
    var questionCounter = 0;
    var sectionCounter = 1;

    section = getDataFromRawString(string[0], "s", "q");
    data['section' + section] = {};

    for (var i = 0; i < string.length; i++) {
        newSection = getDataFromRawString(string[i], "s", "q");
        question = getDataFromRawString(string[i], "q", "a");
        answer = getDataFromRawString(string[i], "a");

        if (section != newSection) {
            data['section' + section]['questionLength'] = questionCounter;
            questionCounter = 0;
            section = newSection;
            data['section' + section] = {};
            sectionCounter++;
        }

        data['section' + section]['question' + question] = {};
        data['section' + section]['question' + question]['answer'] = answer;
        questionCounter++;
    }

    data['sectionLength'] = sectionCounter;
    data['section' + (sectionCounter - 1)]['questionLength'] = questionCounter;

    return data;

}


function getDataFromRawString(string, valA, valB)
{
    var result;
    if (valB != null)
        result = string.substring(string.lastIndexOf(valA) + 1, string.lastIndexOf(valB));
    else
        result = string.substring(string.lastIndexOf(valA) + 1);

    return result;

}

function manualPost(path, params, method) {
    method = method || "post";

    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}
