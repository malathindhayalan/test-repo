/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//region winning rules
function createAllPossibleFour() {
    var possibilities = [];
    var four;
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 6; row++) {

            if (col + 3 < 7) {
                //generate row
                four = [];
                for (let index = 0; index < 4; index++) {
                    four.push({ "row": row , "col": index });
                }
                possibilities.push(four);

                //generate right diagonal
                four = [];
                for (let index = 0; index < 4; index++) {
                    four.push({ "row": row + index, "col": col + index });
                }
                possibilities.push(four);
            }

            if (col - 3 >= 0) {
                //generate left diagonal
                four = [];
                for (let index = 0; index < 4; index++) {
                    four.push({ "row": row + index, "col": col - index });
                }
                possibilities.push(four);
            }

            //generate col
            if (row + 3 < 6) {
                four = [];
                for (let index = 0; index < 4; index++) {
                    four.push({ "row": row + index, "col": col });
                }
                possibilities.push(four);
            }
        }
    }
    
    return possibilities;
}

function createPossibilityBThread(i, p, color) {
    //announce yellow winner
    if (color==="yellow"){
        
    bp.registerBThread("yellowpossible_" + i+"_"+color, function () {
        
        var events = p.map(cell=> bp.Event("Coin", { "column": cell.col, "row": cell.row, "color": color }));    
        for (let index = 0; index < 4; index++) {
            bp.sync({ waitFor: events },100);
        }        
        
        bp.sync({ request: bp.Event("yellowWinner", { "color": color }), block: putEventSet });
        bp.sync({ block: putEventSet });
    });
    }
// announce red winner

    if (color==="red"){
    bp.registerBThread("redpossible_" + i+"_"+color, function () {
       
        var events = p.map(cell=> bp.Event("Coin", { "column": cell.col, "row": cell.row, "color": color }));    
        for (let index = 0; index < 4; index++) {
            bp.sync({ waitFor: events },100);
        }        
        
        bp.sync({ request: bp.Event("redWinner", { "color": color }), block: putEventSet });
        bp.sync({ block: putEventSet });
    });
    }
    
    //request  4th yellow
     if (color==="yellow"){
        
       bp.registerBThread("yellowwinpossibleblock_" + i+"_"+color, function () {
        
        var events = p.map(cell=> bp.Event("Coin", { "column": cell.col, "row": cell.row, "color": color}));   
      
        while(true){
            
            bp.sync({ waitFor: events});
            bp.sync({ waitFor: events });
            
         
            bp.sync({ request:p.map(cell=> bp.Event("Put", { "column": cell.col,"color": "yellow"}),1)});
           
            
            
        }        
    });
    }
    // block 4th red
    if (color==="red"){
        
    bp.registerBThread("redrowandcolumnpossibleblock_" + i+"_"+color, function () {
        
        var events = p.map(cell=> bp.Event("Coin", { "column": cell.col, "row": cell.row, "color": color}));   
      
        while(true){
            
            bp.sync({ waitFor: events});
            bp.sync({ waitFor: events });
            bp.sync({ waitFor: events });
            bp.sync({ request: p.map(cell=> bp.Event("Put", { "column": cell.col,"color": "yellow"}))},50);
           
        }        
    });
    }
    
    }
 // yellow winning strategies 

/* preference to put in center*/
bp.registerBThread( "put yellow center", function(){
    var events = [];
   var index=3;
        events.push(bp.Event("Put", {"column": index, "color":"yellow"}));
    
    while(true){ 
        bp.sync( {request: events},1);
    }
} );
// put yellow in odd columns
bp.registerBThread( "put yellow in odd columns", function(){
    var events = [];
   var index=1;
        events.push(bp.Event("Put", {"column": index, "color":"yellow"}));
    
    while(true){ 
        bp.sync( {request: events},1);
    }
} );
bp.registerBThread( "put yellow in odd columns", function(){
    var events = [];
   var index=5;
        events.push(bp.Event("Put", {"column": index, "color":"yellow"}));
    
    while(true){ 
        bp.sync( {request: events},1);
    }
} );
   





function createWinningBThreads() {
    var possibilities = createAllPossibleFour();
    for (let i = 0; i < possibilities.length; i++) {
        createPossibilityBThread(i, possibilities[i], "red");        
        createPossibilityBThread(i, possibilities[i], "yellow");        
    }
}


bp.registerBThread( "put red everywhere", function(){
    var events = [];
    for (let index = 0; index < 7; index++) {
        events.push(bp.Event("Put", {"column": index, "color":"red"}));
    }
    while(true){ 
        bp.sync( {request: events});
    }
    
} );

function putInColumn(i) {
    return bp.EventSet("",function(e) {
        return e.name.equals("Put") && e.data.column===i;
        
    }); 
}

function colorEvents(name, color) {
    return bp.EventSet("", function(e) {
        return e.name.equals(name) && e.data.color.equals(color);
        
    });
}

var putEventSet = bp.EventSet("",function(e) {
    return e.name.equals("Put");
});
var coinEventSet = bp.EventSet("",function(e) {
    return e.name.equals("Coin");
});
//#endregion event set

//region rules
bp.registerBThread( "external-to-internal", function(){
    while(true) {
        var e = bp.sync( {waitFor: bp.EventSet("", function(e) {
            return e.name.equals("Put-External");
        } )});
        bp.sync( {request: bp.Event("Put", {"column": parseInt(e.data.get("column")), "color":e.data.get("color")})});
    }
});



bp.registerBThread( "turns", function(){
    while(true) {
        bp.sync( {waitFor: colorEvents("Put", "yellow"), block: colorEvents("Put", "red")} );
        bp.sync( {waitFor: colorEvents("Put", "red"), block: colorEvents("Put", "yellow")} );
    }
});

bp.registerBThread( "put_coin_interleve", function(){
    while(true) {
        bp.sync( {waitFor: putEventSet, block: coinEventSet} );
        bp.sync( {block: putEventSet, waitFor: coinEventSet} );
    }
});

function columnBThreads(column) {
    bp.registerBThread( "PutToCoin_"+column, function(){
        var row = 0;
        while(true){ 
            var e = bp.sync( {waitFor: putInColumn(column)} );
            bp.log.info("put color:"+e.data.color+", column:"+e.data.column);
            bp.sync( {request: bp.Event("Coin", {"column":e.data.column, "row": row, "color": e.data.color})} );
            bp.log.info("coin color:"+e.data.color+", column:"+e.data.column+", row:"+row);
            row++;
        }
    } );

    
   bp.registerBThread( "boundPut_"+column, function(){
        for (let index = 0; index < 6; index++) {
            bp.sync( {waitFor: putInColumn(column)} );
        }
        bp.sync( {block: putInColumn(column)} );
    });
}

//endregion winning rules
bp.registerBThread( "put yellow everywhere", function(){
    var events = [];
    for (let index = 0; index < 7; index++) {
        events.push(bp.Event("Put", {"column": index, "color":"yellow"}));
    }
    while(true){ 
        bp.sync( {request: events});
    }
} );

/*bp.registerBThread( "block yellow in 3", function(){
    while(true){ 
        bp.sync( {block: bp.Event("Put", {"column": 3, "color":"yellow"})}
         );
    }
} ); */
 
function init() {
    for (let index = 0; index < 7; index++) {
        columnBThreads(index);
        //rowBThreads(index);
    }   
    
    createWinningBThreads();
    
    }

init();


