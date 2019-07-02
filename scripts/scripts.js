var cards = $('.cards');
var updated_date = $('.updated_date');
var updated_date_text = localStorage.getItem('updated_date');
var sealed_pool = [];
var deck = [];

if(updated_date_text == null){
  updated_date_text = "";
}
updated_date.empty();

if( localStorage.length == 0 ){
	var cards_list = getCards();
}else{
  updated_date.append('Last updated: ' + updated_date_text.toString());
};
function rank(rarity){
  switch(rarity) {
		  				case 'common':
		  					return 1;
		  				break;
		  				case 'uncommon':
							return 2;
		  				break;
		  				case 'rare':
							return 3;
		  				break;
		  				default:
							return 4;
		  				}
}
function getCards(){
	var commons = new Array;
	var uncommons = new Array;
  var uncommonsPW = new Array;
	var rares = new Array;
  // var raresPW = new Array;
	var mythics = new Array;
  // var mythicsPW = new Array;
	var basic_lands = new Array;
  var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');

	localStorage.clear();
  // console.log('a');

  // Scryfall query parameters:
  // s:m20 (Core set 202)
  // -type:planeswalker (fetching the planeswalkers separately)
  // is:booster (Excludes promos, planeswalker deck cards, etc)
	$.getJSON("https://api.scryfall.com/cards/search?q=s%3Am20+is%3Abooster", function( data ){
		
		$.each( data, function( key, val ) {

			if(key == 'data'){
				val.forEach(function(card){
          var card_obj = {
              name: card.name,
              rarity: card.rarity,
              rarity_rank: rank(card.rarity),
              colors: card.color_identity.toString(),
              cmc: card.cmc,
              image: card.image_uris.normal
            }
		  			switch(card.rarity) {
		  		  	case 'common':
		  			  	if(card.mana_cost != ''){
		  			  		commons.push(card_obj);
		  			  	}
		  			    break;
		  			  case 'uncommon':
						    uncommons.push(card_obj);
		  			    break;
		  			  case 'rare':
					  	  rares.push(card_obj);
		  		  	  break;
		  			  default:
						    mythics.push(card_obj);
		  			}
		  		});
		  }
    });

  	localStorage.setItem('commons', JSON.stringify(commons));
  	localStorage.setItem('uncommons', JSON.stringify(uncommons));
  	localStorage.setItem('rares', JSON.stringify(rares));
  	localStorage.setItem('mythics', JSON.stringify(mythics));
  	
  });


    localStorage.setItem('updated_date', utc);
    updated_date.empty();
    updated_date.append('Last Updated: ' + localStorage.getItem('updated_date').toString());	

}

function randCard(rarity, pack_num, card_count){
	var random = Math.floor(Math.random() * rarity.length);
  var random_card = Object.assign({}, rarity[random]);
  var padded_card_num =  ("0" + card_count).slice(-2);
  var pack_order = pack_num.toString() + padded_card_num.toString();
  random_card['pack_order'] = pack_order
  sealed_pool.push(random_card);
	// cards.append('<img src = "' + rarity[random].image + '"/>');
}

function genPack(pack_num){
	var commons = JSON.parse(localStorage.getItem('commons'));
	var uncommons = JSON.parse(localStorage.getItem('uncommons'));
	var uncommonsPW = JSON.parse(localStorage.getItem('uncommonsPW'));
	var rares = JSON.parse(localStorage.getItem('rares'));
	var raresPW = JSON.parse(localStorage.getItem('raresPW'));
	var mythics = JSON.parse(localStorage.getItem('mythics'));
	var mythicsPW = JSON.parse(localStorage.getItem('mythicsPW'));
	var common_count = 1;
	var uncommon_count = 1;
  var card_count = 1;
  
	while(common_count <= 10){
		randCard(commons, pack_num, card_count);
		common_count++;
    card_count++;
	}

	  while(uncommon_count <= 3){
	  	randCard(uncommons, pack_num, card_count);
	  	uncommon_count++;
      card_count++;
	  }
	  if(Math.floor(Math.random() * 8) == 7){
	  	randCard(mythics, pack_num, card_count);
	  }else{
	  	randCard(rares, pack_num, card_count);
	  }
}

function generatePool(){
	var pack_count = 1;
  localStorage.setItem('sealed_pool', '');
  localStorage.setItem('deck', '[]');
	sealed_pool = [];
	cards.empty();
  $('.deck').empty();

	
	while(pack_count <= 6){
		genPack(pack_count);
		pack_count++;
	}
  localStorage.setItem('sealed_pool', JSON.stringify(sealed_pool));
  sealed_pool.forEach(function(card){
    cards.append('<img src = "' + card.image + '" onclick="addToDeck('+ card.pack_order +')" class="card"/>');
  });
}

$('.refresh_btn').click(function(){
  updated_date.empty();
  updated_date.append('Processing...');
	getCards();  
});

$('.gen_btn').click(function(){
  $('.sorting').val('pack_order');
	generatePool();
});

$('.sorting').change(function(){
  axis = $(this).val();
  sealed_pool = JSON.parse(localStorage.getItem('sealed_pool'));
  sealed_pool.sort(function(a, b) {
    if(axis == 'name' || axis == 'colors'){
          var comparison = 0;
    if (a[axis].toUpperCase() > b[axis].toUpperCase()) {
      comparison = 1;
    } else if (a[axis].toUpperCase() < b[axis].toUpperCase()) {
      comparison = -1;
    }
      return comparison
    }else{ 
    return a[axis] - b[axis];
    }
});
  localStorage.setItem('sealed_pool', JSON.stringify(sealed_pool));
  cards.empty();
    sealed_pool.forEach(function(card){
    cards.append('<img src = "' + card.image + '" onclick="addToDeck('+ card.pack_order +')" class="card"/>');
  });
});

function addToDeck(packorder){
      sealed_pool = JSON.parse(localStorage.getItem('sealed_pool'));
        deck = JSON.parse(localStorage.getItem('deck'));

  var card = sealed_pool.find(obj => obj.pack_order === packorder.toString());
  var new_pool = sealed_pool.filter(obj => obj.pack_order != packorder.toString());
  deck.push(card);
  $('.deck').empty();
    	localStorage.setItem('deck', JSON.stringify(deck));
  localStorage.setItem('sealed_pool', JSON.stringify(new_pool));
  deck.forEach(function(card){
    $('.deck').append('<img src = "' + card.image + '" onclick="removefromDeck('+ card.pack_order +')" class="card"/>');
  });
    cards.empty();
    new_pool.forEach(function(card){
    cards.append('<img src = "' + card.image + '" onclick="addToDeck('+ card.pack_order +')" class="card"/>');
  });
}

function removefromDeck(packorder){
      sealed_pool = JSON.parse(localStorage.getItem('sealed_pool'));
        deck = JSON.parse(localStorage.getItem('deck'));

  var card = deck.find(obj => obj.pack_order === packorder.toString());
  var new_deck = deck.filter(obj => obj.pack_order != packorder.toString());
  sealed_pool.push(card);
  $('.deck').empty();
    	localStorage.setItem('deck', JSON.stringify(new_deck));
  localStorage.setItem('sealed_pool', JSON.stringify(sealed_pool));
  new_deck.forEach(function(card){
    $('.deck').append('<img src = "' + card.image + '" onclick="removefromDeck('+ card.pack_order +')" class="card"/>');
  });
    cards.empty();
    sealed_pool.forEach(function(card){
    cards.append('<img src = "' + card.image + '" onclick="addToDeck('+ card.pack_order +')" class="card"/>');
  });
}