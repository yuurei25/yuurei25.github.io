var converter = new showdown.Converter();
var core = document.querySelector("div.core");

let coreStyle = {
	h1: ["text-center", "p-2", "rounded", "text-light", "bg-dark"],
	p: [],
};

let data;
let currentContent;

(function () {
	let client = new XMLHttpRequest();
	client.open("GET", "data.json");
	client.onreadystatechange = (e) => {
		if (client.readyState === 4 && client.status === 200) {
			let response = client.responseText;
			console.log(response);
			data = JSON.parse(response);
			setCoreContent(data[0]);
		}
	};
	client.send();
})();

document.querySelector(".content-toggler").addEventListener("click", (e) => {
	if (data[data.length - 1] === currentContent) {
		setCoreContent(data[0]);
	} else {
		setCoreContent(data[data.findIndex((e) => e === currentContent) + 1]);
	}
});

function setCoreContent(content) {
	// core.innerHTML = "";
	let client = new XMLHttpRequest();
	client.open("GET", content.permalink);
	client.onreadystatechange = (e) => {
		if (client.readyState === 4 && client.status === 200) {
			let text = client.responseText;
			let html = converter.makeHtml(text);
			core.innerHTML = html;
			embedClasses();
			currentContent = content;
		}
	};
	client.send();
}

function embedClasses() {
	let core = document.querySelector("div.core");
	console.log(core.querySelectorAll("*"));
	core.querySelectorAll("*").forEach((e) => {
		let tagName = e.tagName.toLowerCase();
		if (Object.keys(coreStyle).includes(tagName)) {
			coreStyle[tagName].forEach((e2, i) => e.classList.add(e2));
		}
	});
}
