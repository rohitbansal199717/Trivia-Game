function q(q_, a_, ia_){
    this.question = q_;
    this.answer = a_;
    this.incorrect_a = ia_;
}

var trivia = {
    gameTime:0,
    winTime:0,
    loseTime:0,
    timesUpTime:0,
    correct: 0,
    incorrect: 0,
    unanswered:0,
    chosenQuestion: 0,
    secondsGame:0,
    triviaQuestion : [],
    generateQuestion:function () {
        $.ajax({
            url: "https://opentdb.com/api.php?amount=1&category=9&difficulty=hard&type=multiple",
            dataType: "json",
            success: function(data){
                for (var i in data.results)
                {
                    var qq = data.results[i].question;
                    var ca = data.results[i].correct_answer;
                    var ia = data.results[i].incorrect_answers;
                    trivia.triviaQuestion.push(new q(qq,ca,ia));
                }
                trivia.startGame();
            }
        });
    },
    shuffle:function(a)
    {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    },
    pushQuestion:function(randomCounter, array)
    {
        array.push(this.triviaQuestion[randomCounter].answer);
        for(var i in this.triviaQuestion[randomCounter].incorrect_a)
        {
            array.push(this.triviaQuestion[randomCounter].incorrect_a[i]);
        }
        return array;
    },
    startGame:function()
    {

        //use trivia.triviaQ.splice(<num of array that you want to delete>,1) to remove an element/object
        $("#question-answer").show();
        $("#correct-answer").hide();
        $("#wrong-answer").hide();
        $("#times-up").hide();
        $("#game-over").hide();
        $("#opening-screen").hide();
        $("#CountDownTimer").TimeCircles().restart();

        this.winTime = 0;
        this.loseTime = 0;
        console.log(Object.keys(this.triviaQuestion).length);
        if(Object.keys(this.triviaQuestion).length>0)
        {
            var answer_array = [];
            var randomCounter = Math.floor(Math.random() * parseInt(Object.keys(this.triviaQuestion).length));
            $("#displayQuestion").html(this.triviaQuestion[randomCounter].question);
            answer_array = this.pushQuestion(randomCounter, answer_array);
            this.shuffle(answer_array);
            for(var j in answer_array)
            {
                $(".list-"+j+"").html(answer_array[j]);
            }
            this.chosenQuestion = randomCounter;

            this.gameTime = setTimeout(function(){
                trivia.timesUp(randomCounter);//we have to use TRIVIA, instead of THIS because its inside the function! Different scope!
                trivia.correctTimer();
                trivia.incorrectTimer();
            }, 29900);

        }
        else
        {
            this.gameOver();
        }
    },
    displayGiphy:function (userAnswer) {
        const PUBLIC_KEY = 'dc6zaTOxFJmzC';
        const BASE_URL = '//api.giphy.com/v1/gifs/';
        const ENDPOINT = 'search';
        const LIMIT = 1;
        const RATING = 'pg';

        let $resultWrapper = $('.giphy-result');
        let $inputWrapper = $('.input-wrapper');

        let query = {
            text: null,
            offset: 0,
            request() {
                return `${BASE_URL}${ENDPOINT}?q=${this.text}&limit=${LIMIT}&rating=${RATING}&offset=${this.offset}&api_key=${PUBLIC_KEY}`;
            },
            fetch(callback) {
                $.getJSON(this.request())
                    .success(data => {
                        let results = data.data;
                        if (results.length) {
                            let url = results[0].images.downsized.url;
                            console.log(results);
                            callback(url);
                        } else {
                            callback('');
                        }
                    })
                    .fail(error => {
                        console.log(error);
                    });
            }
        };

        function buildImg(src = '//giphy.com/embed/xv3WUrBxWkUPC', classes = 'gif-image') {
            return `<img src="${src}" class="${classes}" alt="gif" />`;
        }

        query.text = userAnswer;
        query.offset = Math.floor(Math.random() * 25);

        if (query.text && query.text.length) {
            $inputWrapper.addClass('active').removeClass('empty');

            query.fetch(url => {
                $resultWrapper.html(buildImg(url));
            });
        }
    },
    correctTimer:function()
    {
        this.winTime = setTimeout(function () {
            clearTimeout(trivia.gameTime);
            $("#question-answer").show();
            $("#correct-answer").hide();
            $("#CountDownTimer").TimeCircles().restart();
            $(".gif-image").attr("src","");
            trivia.startGame();
            clearTimeout(trivia.winTime);
        }, 4000);
    },
    incorrectTimer:function()
    {
        this.loseTime = setTimeout(function () {
            clearTimeout(trivia.gameTime);
            $("#question-answer").show();
            $("#wrong-answer").hide();
            $("#CountDownTimer").TimeCircles().restart();
            $(".gif-image").attr("src","");
            trivia.startGame();
            clearTimeout(trivia.loseTime);
        }, 4000);
    },
    checkAnswer:function(chosenQuestion, userAnswer)
    {
        if(this.triviaQuestion[chosenQuestion].answer === userAnswer)
        {
            $("#question-answer").hide();
            $("#correct-answer").show();
            $("#CountDownTimer").TimeCircles().stop();
            this.correctTimer();
            this.correct++;
        }
        else
        {
            $("#question-answer").hide();
            $("#wrong-answer").show();
            $("#CountDownTimer").TimeCircles().stop();
            this.incorrectTimer();
            $(".correct-answer-span").html(this.triviaQuestion[chosenQuestion].answer);
            this.incorrect++;
        }
        this.displayGiphy(this.triviaQuestion[chosenQuestion].answer);
        trivia.triviaQuestion.splice(chosenQuestion,1);
    },
    timesUp:function (chosenQuestion) {

        $("#question-answer").hide();
        $("#times-up").show();
        $("#CountDownTimer").TimeCircles().stop();
        this.timesUpTime = setTimeout(function () {
            clearTimeout(trivia.gameTime);
            $("#question-answer").show();
            $("#times-up").hide();
            $("#CountDownTimer").TimeCircles().restart();
            $(".gif-image").attr("src","");
            clearTimeout(trivia.timesUpTime);
            trivia.startGame();
        }, 4000);

        this.displayGiphy(this.triviaQuestion[chosenQuestion].answer);
        $(".correct-answer-span").html(this.triviaQuestion[chosenQuestion].answer);
        this.triviaQuestion.splice(chosenQuestion,1);
        this.unanswered++;
    },
    gameOver:function () {
        $("#question-answer").hide();
        $("#correct-answer").hide();
        $("#wrong-answer").hide();
        $("#times-up").hide();
        $("#game-over").show();

        $("#number_of_correct_answer").html(this.correct);
        $("#number_of_incorrect_answer").html(this.incorrect);
        $("#number_of_unanswered").html(this.unanswered);

        $("#CountDownTimer").TimeCircles().stop();
    }
};

$(document).ready(function() {
    $("#question-answer").hide();
    $("#correct-answer").hide();
    $("#wrong-answer").hide();
    $("#times-up").hide();
    $("#game-over").hide();
    $("#opening-screen").show();

    $("#CountDownTimer").TimeCircles().stop();


    $("#lets-start").on("click", function (event) {
        trivia.generateQuestion();
    });

    $(".answer-list").on("click", function (event) {
        trivia.checkAnswer(trivia.chosenQuestion, $(event.target).text());
    });

    $("#restart-game").on("click", function (event) {
        $.ajax({
            url: "http://localhost:63343/Hansel_UCLA/Trivia-Game/index.html?_ijt=srr5ti0h3lrfkoav8vevsj4ebf",
            cache: false,
            success: function(content) {
                $("#body-game").html(content);
                $("#opening-screen").hide();
                trivia.generateQuestion();
            }
        });
    });
});