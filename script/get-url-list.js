// document.addEventListener('DOMContentLoaded', () => {
	// console.log('ajax')
	let req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			let json = JSON.parse(this.responseText);
			let html = "";
			json.forEach((val) => {
				html += "<p>" + val.original_url + ": " + "<a href='/api/shorturl/" + val.short_url + "'>api/shorturl/" + val.short_url + "</a></p>";		
			})
			document.getElementById('url-list').innerHTML = html;
		}
	}
	req.open("GET", '/api/shorturl/list', true);
	req.send();
// })

// this below is able to runned successfully too
/*$.getJSON('http://localhost:5000/api/shorturl/list').done(function(data) {
  console.log(data);
  let html = "";
  data.forEach((val) => {
    html += "<p>" + val.original_url + ": " + "/api/shorturl/" + val.short_url + "</p>";    
  })
 document.getElementById('url-list').innerHTML = html; 
})*/