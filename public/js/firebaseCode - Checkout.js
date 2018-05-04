
          // Initialize Firebase
          
          var config = {
            apiKey: "AIzaSyDiWj84GS73KW_R5qLTUpvTXVbIRUAuNsQ",
            authDomain: "supercart-f83c1.firebaseapp.com",
            databaseURL: "https://supercart-f83c1.firebaseio.com",
            projectId: "supercart-f83c1",
            storageBucket: "supercart-f83c1.appspot.com",
            messagingSenderId: "122025235969"
          };
          var prodID=0;

          firebase.initializeApp(config);
          var database = firebase.database();
            var count = 0
            
         	var productKeyRef = firebase.database().ref('products/').orderByKey().limitToLast(1);
			productKeyRef.on('value', function(snapshot) {
                count=count+1;
				for (var pro in snapshot.val()){
                    var key=snapshot.val()[pro]["name"];
                    console.log(key);
                    if (count>1){
                        if (key== "signal"){
                            prodID=2;
                        } else if (key== "ambewela"){
                            prodID=3;
                        } else if (key== "sunlight"){
                            prodID=1;
                        }
                        console.log(prodID)
                        $.post("/checkout",
                        {
                          id: prodID,
                          bill: <%=bill%>
                        },
                        function(data,status){
                            if (data=='valid'){
                                swal("Item successfully verified.");
                            }
                            else{
                                swal('Warning. Item not verified');
                            }
                        });
                    }

				}
				
					
				 
			});

