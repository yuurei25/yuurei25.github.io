class CoreContent {
	#converter;
	#directory;
	container;
	contentData;
	currentContent;

	get directory() {
		return this.#directory;
	}
	set directory(directory) {
		this.#directory = directory;
		this.#setContentData();
	}

	constructor(container, directory, opts) {
		this.#converter = new showdown.Converter();
		this.#directory = directory;
		this.container = container;
		if (opts) {
			if (opts.styles) this.styles = opts.styles;
		}
		this.#setContentData();
	}

	#setContentData() {
		let client = new XMLHttpRequest();
		let link = `${this.#directory}/data.json`;
		client.open("GET", link);
		client.onreadystatechange = (e) => {
			if (client.readyState === 4 && client.status === 200) {
				this.contentData = JSON.parse(client.responseText);
				this.setContent(this.contentData[0]);
			}
		};
		client.send();
	}

	setContent(content) {
		let client = new XMLHttpRequest();
		let link = `${this.#directory}/src/${content.permalink}`;
		client.open("GET", link);
		client.onreadystatechange = (e) => {
			if (client.readyState === 4 && client.status === 200) {
				let text = client.responseText;
				let html = this.#converter.makeHtml(text);
				this.container.innerHTML = html;
				this.#embedClasses();
				this.currentContent = content;
			}
		};
		client.send();
		return this;
	}

	#embedClasses() {
		this.container.querySelectorAll("*").forEach((e) => {
			let tagName = e.tagName.toLowerCase();
			if (Object.keys(this.styles).includes(tagName)) {
				coreStyle[tagName].forEach((e2, i) => e.classList.add(e2));
			}
		});
		return this;
	}
}

class NavigatedCoreContent extends CoreContent {
	setNavigator(nextButton, prevButton) {
		nextButton.addEventListener("click", (e) => {
			this.next();
		});

		prevButton.addEventListener("click", (e) => {
			this.previous();
		});
	}

	next() {
		let data = this.contentData;
		let current = this.currentContent;
		if (data[data.length - 1] === current) {
			this.setContent(data[0]);
		} else {
			this.setContent(data[data.findIndex((e) => e === current) + 1]);
		}
	}

	previous() {
		let data = this.contentData;
		let current = this.currentContent;
		if (data[0] === current) {
			this.setContent(data[data.length - 1]);
		} else {
			this.setContent(data[data.findIndex((e) => e === current) - 1]);
		}
	}
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// ---------------- SCRIPT ----------------

let core = document.querySelector("div.core");

let coreStyle = {
	h1: ["text-center", "p-2", "mb-3", "rounded", "text-light", "bg-dark"],
	p: [],
};

let coreContent = new NavigatedCoreContent(core, "articles", {
	styles: coreStyle,
});

setNavigator();
function setNavigator() {
	let nextBtn = document.querySelector(".content-switch-next");
	let prevBtn = document.querySelector(".content-switch-previous");
	coreContent.setNavigator(nextBtn, prevBtn);
}
