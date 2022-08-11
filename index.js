// npm install xhr2
const express = require('express');
const axios = require('axios').default;
const app = express();
const moment = require('moment')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('Cergy.db')

//-----------------------------------DATABASE INIT------------------------------------------

//db.run('DROP TABLE IF EXISTS TodoList')

db.run('CREATE TABLE IF NOT EXISTS TodoList (Id INTEGER PRIMARY KEY AUTOINCREMENT,Title TEXT ,TodoDate TEXT,Description TEXT NOT NULL);')


//-----------------------------------------ROOT---------------------------------------------
app.get('/', (req, res) => {
	res.send('Bienvenue !')
});

//---------------------------------------TODO LIST------------------------------------------
//GET
app.get('/todolist', (req, res) => {
	var sql = "select * from TodoList"
	var params = []
	db.all(sql, params, (err, rows) => {
		if (err) {
			res.status(400).json({ "error": err.message });
			return;
		}
		res.json({
			"data": rows
		})
	});
});


//POST
app.post('/todolist', (req, res) => {
	var title = req.query.title;
	var todoDate = req.query.date;
	var description = req.query.description;
	db.run(`INSERT INTO TodoList (Title,TodoDate,Description) VALUES('${title}','${todoDate}','${description}')`, function(err) {
		if (err) {
			console.log(err.message);
			res.send(err.message)
		}
		console.log(`Successfully added in the TodoList`);
		res.send(`Successfully added in the TodoList`)
	});
});

//DELETE
app.delete('/todolist', (req, res) => {
	var request = `DELETE FROM  TodoList WHERE Id='${req.query.id}';`
	db.run(request);
	res.send("Deleted succefully")
});



//---------------------------------------METEO CERGY----------------------------------------
//GET
app.get('/meteo', (req, res) => {
	axios.get('https://api.openweathermap.org/data/2.5/weather?q=Cergy&units=metric&APPID=' + process.env.WeatherAPPID + '&lang=fr').then(response => {
		var temp = "Il fait " + response.data.main.temp.toString() + "°C à Cergy : " + response.data.weather[0].description
		console.log(temp)
		res.json({ temp })

	}).catch(error => {
		console.log(error.response.data.message)
		res.send(error.response.data.message)
	})
});


//---------------------------------------JOURS FERIES---------------------------------------
//GET
app.get('/joursFeries', (req, res) => {
	axios.get('https://calendrier.api.gouv.fr/jours-feries/metropole/' + (new Date().getFullYear()).toString() + '.json').then(response => {

		res.json({
			"data": response.data
		})

	}).catch(error => {
		console.log(error.response.data.message)
		res.send(error.response.data.message)
	})
});


//GET
app.get('/joursFeries/allnext', (req, res) => {
	axios.get('https://calendrier.api.gouv.fr/jours-feries/metropole/' + (new Date().getFullYear()).toString() + '.json').then(response => {
		var currentDate = moment().utc().format('Y-MM-DD');

		for (var date in response.data) {
			if (date < currentDate) {
				delete response.data[date]
			}
		}
		res.json({
			"data": response.data
		})
	}).catch(error => {
		console.log(error.response.data.message)
		res.send(error.response.data.message)
	})
});


//GET
app.get('/joursFeries/next', (req, res) => {
	axios.get('https://ApiDomotique.maderyromain.repl.co/joursFeries/allnext').then(response => {

		var data = response.data.data;
		var key = Object.keys(data)[0]

		var data = Object.entries(data)[0]
		var data2 = JSON.parse(JSON.stringify(data).replace('[', '{').replace(']', '}').replace(',', ':'))

		res.send({
			"data": data2
		})


	}).catch(error => {
		console.log(error.response.data.message)
		res.send(error.response.data.message)
	})
});




//---------------------------------------CODE BARRE ----------------------------------------
//GET


app.get('/codebarre', (req, res) => {

	var id = req.query.id;

	axios.get('https://world.openfoodfacts.org/api/v0/product/'.concat(id)).then(response => {

		var data = response.data;

		if (data.status === 0) {
			res.send({
				"status": data.status_verbose,
				"status-code":data.status
	
			})
		}
		else{
			res.send({
			//"name":	 data.product.abbreviated_product_name,
			"status": data.status_verbose,
			"status-code":data.status,
			"name": data.product.product_name_fr_imported,
			"description": data.product.generic_name,
			"image": data.product.image_url,
			"nutriscore": data.product.nutriscore_grade,
			"ingredients": data.product.ingredients_text

		})
	}



	}).catch(error => {
		console.log(error.response.data.message)
		res.send(error.response.data.message)
	})
});








app.listen(2035, () => {
	console.log('server started');
});
