var express = require('express');
var firebase = require ("firebase");
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async');
const sqlite3 = require('sqlite3').verbose();
var http = require('http');
var PythonShell = require('python-shell');


var app = express();

var array1=[];






  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDiWj84GS73KW_R5qLTUpvTXVbIRUAuNsQ",
    authDomain: "supercart-f83c1.firebaseapp.com",
    databaseURL: "https://supercart-f83c1.firebaseio.com",
    projectId: "supercart-f83c1",
    storageBucket: "supercart-f83c1.appspot.com",
    messagingSenderId: "122025235969"
  };
	firebase.initializeApp(config);
	
	//firebase database
	var database = firebase.database();



//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//body parser midleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//static path
app.use(express.static(path.join(__dirname, 'public')));

/*global variables
ap.use(funciton(res, req, next){
	res.locals.errors = null;
	next();
})
*/

//var per= [{name:'haritha', age:5}, {name:'myg', age:2}, {name:'fea', age:6}, {name:'hdsd', age:4}];

/*
app.get('/', function(req, res, next){
    res.render('index', {name:'haritha', per:array1});
})
*/


//display login page
app.get('/login', function(req, res, next){
    res.render('login',{status:req.query.status});
})


//display cashier's page
app.get('/cashier', function(req, res, next){
	res.render('cashier',{status:req.query.status});
})


//display IR beam ad
app.get('/ad/:id', function(req, res, next){
	isle=[];

    let db = new sqlite3.Database('./supermarket.db', (err) => {
        if (err) {
            //console.error(err.message);
        }
        console.log('Connected to the supermarket database.');
});
    let sql = `SELECT id id, isle_name isle_name, img img FROM beam WHERE id =?`;


    db.all(sql, [req.params.id], (err, rows) =>{
        if(err) {
            console.error(err.message);
        }
        else{
        	console.log("CVB");
        	rows.forEach((row)=> {
            isle.push(row);
});
    res.render('beamAd', {isle:isle[0]});
}




});
});



//view bill
app.get('/bill/:id', function(req, res, next){
	items=[];

  let db = new sqlite3.Database('./supermarket.db', (err) => {
  if (err) {
    //console.error(err.message);
  }
  console.log('Connected to the supermarket database.');
	});
	let sql = `SELECT product_id product_id, qty qty FROM item WHERE bill_id =?`;


  db.all(sql, [req.params.id], (err, rows) =>{
	if(err) {
		console.error(err.message);
	}
	else{
	 	rows.forEach((row) => {
	 		var quantity = row.qty;
			db.get(`SELECT name name from product WHERE id=?`, [row.product_id], (err, row) =>{
				var product_name = row.name;
				console.log('sdsd');
				items.push({name: product_name, qty:quantity});	
			});
			 	  	console.log(items);			
		});
 	}
	});
	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Close the database connection.');
			res.render('bill',{items:items});
		});

});




//view finalized bill
//view bill
app.get('/finalize/:id', function(req, res, next){
	items=[];

  let db = new sqlite3.Database('./supermarket.db', (err) => {
  if (err) {
    //console.error(err.message);
  }
  console.log('Connected to the supermarket database.');
	});
	let sql = `SELECT product_id product_id, qty qty FROM item WHERE bill_id =?`;
	var amount = 0;

  db.all(sql, [req.params.id], (err, rows) =>{
	if(err) {
		console.error(err.message);
	}
	else{
	 	rows.forEach((row) => {
	 		var quantity = row.qty;
			db.get(`SELECT name name, price price from product WHERE id=?`, [row.product_id], (err, row) =>{
				var product_name = row.name;
				var cost = row.price*quantity;
				amount += cost;
				items.push({name: product_name, qty:quantity, price:cost });	
			});
			 	  				
		});
 	}
	});
	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Close the database connection.');
			res.render('finalize',{items:items, amount: amount});
		});

});





/*
app.get('/add', function(req, res, next){
	console.log('submit');
    res.render('add');
})

app.post('/users/add', function(req, res, next){
	var newU = {name: req.body.name, age: req.body.age};
})
*/

//return checkout page
app.get('/checkout/:id', function(req, res, next){
    // PythonShell.run('ir_hasher.py', function (err) {
    //     if (err) throw err;
    //     console.log('finished');
    // });
    res.render('checkout',{bill: req.params.id});
})




//handle checkout verification
app.post('/checkout', function(req, res, next){

  let db = new sqlite3.Database('./supermarket.db', (err) => {
  if (err) {
    //console.error(err.message);
  }
  console.log('Connected to the supermarket database.');
	});
	console.log(req.body.bill);
	console.log(req.body.id);
	var valid=false;
	status='invalid';
	let sql = `SELECT product_id product_id FROM item WHERE bill_id =?`;

  db.all(sql, [req.body.bill], (err, rows) =>{
	if(err) {
		console.error(err.message);
	}
	else{
		rows.forEach((row) => {
			 if (row.product_id == req.body.id){
			 	valid=true;
			 	res.send(201, 'valid');
			 }
		});
		if (!valid){
			res.send(201, 'invalid');
		}
		
	}

	
	});
});




//handle login
app.post('/login', function(req, res, next){

  let db = new sqlite3.Database('./supermarket.db', (err) => {
  if (err) {
    //console.error(err.message);
  }
  console.log('Connected to the supermarket database.');
	});
	console.log(req.body.mobile);
	let sql = `SELECT name name, phone_no phone_no, id id FROM customer WHERE phone_no =?`;

  db.all(sql, [req.body.mobile], (err, rows) =>{
	if(err) {
		console.error(err.message);
	}
	else{
		if (rows==0){
			res.redirect('/login/?status=error');
		}
		else{
		 	rows.forEach((row) => {
				console.log(row.id);
				res.redirect('/home/?id='+row.id); 
			});
 		}
 		}
	});
  /*
  db.close((err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Close the database connection.');
	});*/
});


//switch to self checkout
app.post('/self', function(req, res, next) {

	//create a new bill
		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }else
		  console.log('Connected to the supermarket database.');
			});


		db.run(`INSERT INTO bill(customer_id, date, status, amount, outlet, pay_method, self_check) VALUES(?, DATETIME('now'), 'shopping', 0, "keells rajagiriya", 'card', 1)`, [req.body.id], function(err) {
    		if (err) {
      			return console.log(err.message);
    		}
    		// get the last insert id
    		console.log(`new bill created with id ${this.lastID}`);
    		res.send(201, this.lastID);
  		});
});



//add item to cart
app.post('/addToCart', function(req, res, next) {

	//create entry in item table
		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});


  		//check if the item already exists in the 

		let sql = `SELECT qty qty FROM item WHERE bill_id =? and product_id=?`;

		  db.all(sql, [req.body.bill, req.body.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
				else{
				 	if (rows==0){
				 		//add item if it doesnt exist
				 			db.run(`INSERT INTO item(bill_id, product_id, qty) VALUES(?, ?,  ?)`, [req.body.bill, req.body.id, req.body.qty], function(err) {
					    	if (err) {
					      		return console.log(err.message);
					    	}
					    	// get the last insert id
					    	console.log(`new item created with id ${this.lastID}`);
					  		});

				 	}
				 	else{
				 		//update qantity if it does exist
						let sql = `UPDATE item
						            SET qty = ?
						            WHERE product_id = ?`;
						 console.log(rows[0].qty+ parseInt(req.body.qty));
						db.run(sql, [rows[0].qty+parseInt(req.body.qty), req.body.id], function(err) {
						  if (err) {
						    return console.error(err.message);
						  }
						  console.log(`Row(s) updated: ${this.changes}`);
						 
						});
				 	}

					};
		 		});    		

});



//remove item from cart
app.post('/removeFromCart', function(req, res, next) {

	//create entry in item table
		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});


  		//check if the item already exists in the bill
		let sql = `SELECT qty qty FROM item WHERE bill_id =? and product_id=?`;

		  db.all(sql, [req.body.bill, req.body.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
				else{

				 	if (rows.length!==0){


				 		//delete item from bill if it does exist
						db.run(`DELETE FROM item WHERE bill_id =? and product_id=?`, [req.body.bill, req.body.id], function(err) {
						  if (err) {
						    return console.error(err.message);
						  }
						  console.log(`Row(s) deleted: ${this.changes}`);
						  res.send(201, 'success');						 
						});
				 	}
				 	else{
				 		res.send(201, 'fail');
				 	}
					};
		 		});    		
});



//join queue
app.post('/queue', function(req, res, next) {


	//create queue entry
		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});




		db.run(`INSERT INTO queue(customer_id, queueTime, counter_assigned) VALUES(?, strftime('%s','now'), 0)`, [req.body.id], function(err) {
    		if (err) {
      			return console.log(err.message);
    		}
    		// get the last insert id
				console.log(`new queue entry created with id ${this.lastID}`);
				setTimeout(function(arg){
					console.log(arg);
				},
				1500, 'damn son');

				})
  		});



//leave queue
app.post('/leaveQueue', function(req, res, next) {


	//remove queue entry
		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});




		db.run(`DELETE FROM queue WHERE customer_id=?`, [req.body.id], function(err) {
    		if (err) {
      			return console.log(err.message);
    		}
    		// get the removed id
    		console.log(`queue entry deleted with id ${this.lastID}`);
  		});
});


//product page

app.get('/test', function(req, res, next){

	var productKeyRef = firebase.database().ref('products/').orderByKey().limitToLast(1);
productKeyRef.on('value', function(snapshot) {
	for (var pro in snapshot.val()){
		console.log(snapshot.val()[pro]["name"]);
		res.redirect('/product/3');
		
	} 
	
	//updateStarCount(postElement, snapshot.val()[-1].name);
});

})



app.get('/product/:id', function(req, res, next){
	product=[];
	 relIDs=[];
	 adIDs=[];
	 ad=[];

	 //writeProductData("Milo");
	 
			//listen to firebase database



	let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});

  		db.serialize(()=>{


  		//customer database connection
		let sql = `SELECT id id, name name, description description, image image, price price  FROM product WHERE id =?`;

		  db.all(sql, [req.params.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
				else{
				 	rows.forEach((row) => {
						console.log(row.name);
						product.push(row);

					});
		 		}    		
		});


		 //find related ads
		
		let sql5 = `SELECT ad_id ad_id FROM product_x_ad WHERE product_id =?`;
		db.all(sql5, [req.params.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
			else{
			 	rows.forEach((row) => {
					adIDs.push(row.ad_id);
					});
		 		}
		 		//return related ads
				let sql4 = `SELECT img img FROM ad WHERE id =?`;
				db.all(sql4, [adIDs[0]], (err, rows) =>{
					console.log(adIDs[0]);
					if(err) {
						console.error(err.message);
					}
					else{
					 	rows.forEach((row) => {
							console.log(row.img);
							ad.push(row.img);
							});
				 		}
				 	});
			});

		 //find related product ids
		
		let sql2 = `SELECT rel_product_id rel_product_id  FROM prod_x_prod WHERE product_id =?`;
		db.all(sql2, [req.params.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
			else{
			 	rows.forEach((row) => {
					relIDs.push(row.rel_product_id);
					});
		 		}
		 		//return related products
				let sql3 = `SELECT image image, name name, id id FROM product WHERE id =? or id =?`;
				db.all(sql3, [relIDs[0], relIDs[1]], (err, rows) =>{
					console.log(relIDs[1]);
					if(err) {
						console.error(err.message);
					}
					else{
					 	rows.forEach((row) => {
							console.log(row.name);
							});
				 		}
					res.render('product',{product:product[0], rel_prod:rows, ad:ad[0]});


				});

		});
					/*
					db.close((err) => {
					  if (err) {
					    console.error(err.message);
					  }
					  console.log('Close the database connection.');
						});*/
});
});




//homepage
  app.get('/home', function(req, res, next){
  	var name ='';
  	var priviledge='';
  	//connect to database to retrieve user data
  		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});

  		db.serialize(()=>{


  		//customer database connection
		let sql = `SELECT name name, phone_no phone_no, id id, priviledge priviledge FROM customer WHERE id =?`;

		  db.all(sql, [req.query.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
				else{
				 	rows.forEach((row) => {
						name+=row.name;
						priviledge+=row.priviledge;
						console.log(name);
						console.log(priviledge);

					});
		 		}
			});
		  //retreive ad ids
		let sql2 = 'SELECT ad_id ad_id from customer_x_ad WHERE customer_id =?';
		var adIds = [];

		db.all(sql2, [req.query.id], (err, rows) =>{
			if(err) {
				console.error(err.message);
			}
				else{
					let sql3 = 'SELECT img img from ad WHERE id =';
				 	rows.forEach((row) => {
						adIds.push(row.ad_id);
						sql3+=row.ad_id+' or id=';
					});
					var sql4=sql3.slice(0,-7);
		 			console.log(sql4);
		 		

		 		//retrieve ad urls

				var adURLs=[];
				console.log(adIds[0]);

				db.all(sql4, (err, rows) =>{
					if(err) {
						console.error(err.message);
					}
						else{
						 	rows.forEach((row) => {
								adURLs.push(row.img);
							});
							console.log(adURLs);
							console.log(rows[0].img);
							console.log(req.query.id);
							res.render('home',{name:name, id:req.query.id, priviledge:priviledge, adURLs:adURLs, row:rows}); 
				 		}
				})
				}

		})

  	});
/*
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
	});*/

});


//database management example code for buidling relationships between customers, prodcuts and advertisements


//build product x product relationships.
app.get('/prodxprod', function(req, res, next){


  let db = new sqlite3.Database('./supermarket.db', (err) => {
  if (err) {
    //console.error(err.message);
  }
  console.log('Connected to the supermarket database.');
	});
	var amount = 0;



  db.all(`SELECT id id FROM product`, [], (err, rows) =>{
	if(err) {
		console.error(err.message);
	}
	else{
	 	rows.forEach((row) => {
	 		var id1 = row.id;
	 		db.all(`SELECT id id FROM product`, [], (err, rows) =>{
	 		if(err) {
				console.error(err.message);
			}
			else{
	 			rows.forEach((row) => {
	 				var id2 = row.id;
			  		var count =0;

			  		var asyncOps = [

			  		function (done) {	
			  		db.all(`SELECT bill_id bill_id FROM item where product_id=?`, [id1], (err, rows) =>{
	 					if(err) {
							console.error(err.message);
						}
						else{
	 						rows.forEach((row) => {
	 							var bill=row.bill_id;
	 							db.all(`SELECT product_id product_id FROM item where bill_id=? and product_id=?`, [bill, id2], (err, rows) =>{
	 								if(err) {
										console.error(err.message);
									}
									else{
	 									rows.forEach((row) => {
	 										count+=1;
	 										console.log(count);

	 									});
	 								}
	 							});
	 						});
	 					}
	 				});
			  		},
	 				//count finishes at this point
					//create a new entry in the product x product data table
					function(count) {
					console.log(id2, count, id1);
	
			  		}
			  		];
			  		async.waterfall(asyncOps, function (err, results){
			  			if (err) return console.log(err);
			  		});			

				});
	 		}
			 	  				
			});
 	
		});
	}
});

});




//update cashier status
app.post('/ready', function(req, res, next) {

	
		let db = new sqlite3.Database('./supermarket.db', (err) => {
		  if (err) {
		    //console.error(err.message);
		  }
		  console.log('Connected to the supermarket database.');
			});


		db.run(`UPDATE counter SET status="ready" WHERE id=?`, [req.body.id], function(err) {
    		if (err) {
      			return console.log(err.message);
    		}
    		// show the last update id
				console.log(`updated counter with id ${this.lastID}`);
    		
			});
			global.customerId;

			function alertCustomer(){
				db.get(`SELECT customer_id customer_id from queue WHERE queueTime = (SELECT min(queueTime) FROM queue)`, (err, row) =>{
					if (err) {
						//console.error(err.message);
					}else if (row==undefined){
						console.log("No customers found")
					}
					else{
					console.log(row.customer_id);
					customerId=row.customer_id;
					io.emit('userId', row.customer_id);
					}
				});
			}
		
			alertCustomer();
			res.send(202);
});



// Loading socket.io
var server = require('http').Server(app);
global.io = require('socket.io')(server);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/index.html');
});

// When a client connects, we note it in the console
io.on('connection', function (socket) {


	socket.on('userAccepted', function(userID){
		console.log("user accepted"+ userID);
			//create a new bill
			let db = new sqlite3.Database('./supermarket.db', (err) => {
				if (err) {
					//console.error(err.message);
				}
				console.log('Connected to the supermarket database.');
				});
	
	

				//delete queue entry
				db.run(`DELETE FROM queue WHERE customer_id=?`, [userID], function(err) {
					if (err) {
							return console.log(err.message);
					}else{
					// get the removed id
					console.log(`queue entry deleted with id ${this.lastID}`);
					}
				});	
		});


		socket.on('userRejected', function(userID){
			console.log("user rejected"+ userID);
				//create a new bill
				let db = new sqlite3.Database('./supermarket.db', (err) => {
					if (err) {
						//console.error(err.message);
					}
					console.log('Connected to the supermarket database.');
					});
		
		//reset the queue time of user
				db.run(`UPDATE queue SET queueTime=strftime('%s','now') WHERE customer_id=?`, [userID], function(err) {
						if (err) {
								return console.log(err.message);
						}else
						// show the last update id
						console.log(`updated queue entry of user id ${this.lastID}`);
						
						//alert next customer
						function alertCustomer(){
							db.get(`SELECT customer_id customer_id from queue WHERE queueTime = (SELECT min(queueTime) FROM queue)`, (err, row) =>{
								if (err) {
									//console.error(err.message);
								}else if (row==undefined){
									console.log("No customers left")
								}
								else{
									console.log("old customer id: " + customerId)
								console.log("new: " + row.customer_id);
								
								if (customerId == row.customer_id){
									setTimeout(function(){
										io.emit('userId', row.customer_id);
									}, 20000)
								} else{
								customerId=row.customer_id;
								io.emit('userId', row.customer_id);
								}
								}
							});
						}
					
						alertCustomer();
					});
		
			});

});




server.listen(80);


app.listen(3000, function(){
          console.log("server on 3000");
        })


		




