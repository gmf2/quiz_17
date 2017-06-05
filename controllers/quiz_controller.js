var models = require("../models");
var Sequelize = require('sequelize');

var paginate = require('../helpers/paginate').paginate;

// Autoload el quiz asociado a :quizId
exports.load = function (req, res, next, quizId) {

    models.Quiz.findById(quizId)
    .then(function (quiz) {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('No existe ningún quiz con id=' + quizId);
        }
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /quizzes
exports.index = function (req, res, next) {

    var countOptions = {};

    // Busquedas:
    var search = req.query.search || '';
    if (search) {
        var search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where = {question: { $like: search_like }};
    }

    models.Quiz.count(countOptions)
    .then(function (count) {

        // Paginacion:

        var items_per_page = 10;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;

        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        var findOptions = countOptions;

        findOptions.offset = items_per_page * (pageno - 1);
        findOptions.limit = items_per_page;

        return models.Quiz.findAll(findOptions);
    })
    .then(function (quizzes) {
        res.render('quizzes/index.ejs', {
            quizzes: quizzes,
            search: search
        });
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /quizzes/:quizId
exports.show = function (req, res, next) {

    res.render('quizzes/show', {quiz: req.quiz});
};


// GET /quizzes/new
exports.new = function (req, res, next) {

    var quiz = {question: "", answer: ""};

    res.render('quizzes/new', {quiz: quiz});
};


// POST /quizzes/create
exports.create = function (req, res, next) {

    var quiz = models.Quiz.build({
        question: req.body.question,
        answer: req.body.answer
    });

    // guarda en DB los campos pregunta y respuesta de quiz
    quiz.save({fields: ["question", "answer"]})
    .then(function (quiz) {
        req.flash('success', 'Quiz creado con éxito.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('quizzes/new', {quiz: quiz});
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear un Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next) {

    res.render('quizzes/edit', {quiz: req.quiz});
};


// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    req.quiz.question = req.body.question;
    req.quiz.answer = req.body.answer;

    req.quiz.save({fields: ["question", "answer"]})
    .then(function (quiz) {
        req.flash('success', 'Quiz editado con éxito.');
        res.redirect('/quizzes/' + req.quiz.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('quizzes/edit', {quiz: req.quiz});
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {

    req.quiz.destroy()
    .then(function () {
        req.flash('success', 'Quiz borrado con éxito.');
        res.redirect('/quizzes');
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || '';

    res.render('quizzes/play', {
        quiz: req.quiz,
        answer: answer
    });
};

// GET /quizzes/:quizId/random_play
exports.randomplay = function (req, res, next) {
    var answer = req.query.answer || '';
    req.session.score = req.session.score || 0;
 
    var notplayed = [];
    var played = [];
    var lolo = [];
    req.session.jugados = req.session.jugados || played; 
    req.session.nojugados =  req.session.nojugados || notplayed;
    models.Quiz.findAll()
    .then (function(quizzes){
        
        for (var o in quizzes){
         lolo[o]=quizzes[o];

        }
        console.log("jjugaditos");
        console.log(req.session.jugados.length);
        console.log("nojug0");
        console.log(req.session.nojugados.id);
        if(req.session.jugados.length == 0){
            for(var t in lolo){
                req.session.nojugados[t]=lolo[t];
            }

        }
         	for(u = 0; u < req.session.nojugados.length; u++){
         		for(t = 0; t < req.session.jugados.length; t++){
         			console.log("cada for");
         			console.log(req.session.nojugados[u].id);
         			console.log(req.session.jugados[t]);
        	   if(req.session.nojugados[u].id=== req.session.jugados[t]){
        	 	console.log("entro cuando");
        	 	console.log(req.session.nojugados[u].id);
                console.log(req.session.jugados[t]);
        	   	req.session.nojugados.splice (u,1);  
        	   }
         	 }
         }
         /*
        	for (x = 0; x<req.session.nojugados.length; x++){
            if (req.session.nojugados[x]=== undefined){
            req.session.nojugados.splice (x,1);           
            }      
        }
        for (x = 0; x<req.session.jugados.length; x++){
            if (req.session.jugados[x]=== undefined){
            req.session.jugados.splice (x,1);           
            }      
        }
       */
        
//Igual hay que comentarlo
for (y = 0; y<req.session.nojugados.length; y++){
	  console.log("for desp no jugados");
    console.log(req.session.nojugados[y].id);
}

  	console.log(" for desp jugados");
    console.log(req.session.jugados);
   

       randiOrton = Math.floor(Math.random()*req.session.nojugados.length);
        console.log(randiOrton);

        quiznumero = req.session.nojugados[randiOrton];
        res.render('quizzes/random_play', {
        quiz: quiznumero,
        answer: answer,
        score: req.session.score
        });
    })
};

exports.randomcheck = function (req, res, next) {
    var answer = req.query.answer || '';
    req.session.score = req.session.score || 0;
    req.session.nojugados = req.session.nojugados || notplayed;
    var result = false;
    if(answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim()) {
        req.session.score++;
        //req.session.nojugados = req.session.nojugados || notplayed;
        req.session.jugados.push(req.quiz.id);
        result= true;
    }
    else{
        req.session.jugados = [];
        req.session.score=0;
    }
    if (req.session.score===4){
        req.session.jugados = [];
        req.session.nojugados = [];
        res.render('quizzes/random_nomore', {
        score: req.session.score
        
    });

    }
    else{
    res.render('quizzes/random_result', {
        quiz: req.quiz,
        score: req.session.score,
        answer: answer,
        result : result
    });
}
};

// GET /quizzes/:quizId/check
exports.check = function (req, res, next) {

    var answer = req.query.answer || "";

    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz: req.quiz,
        result: result,
        answer: answer
    });
};
