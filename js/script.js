String.prototype.isArabic = function () {
	let reg = /\S/,
		min = 1536,
		max = 2303;

	let charCode = this.charCodeAt(reg.exec(this).index);

	return charCode >= 1536 && charCode <= 2303 ? true : false;
};

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
		let link = `${this.#directory}/${content.permalink}`;
		client.open("GET", link);
		client.onreadystatechange = (e) => {
			if (client.readyState === 4 && client.status === 200) {
				let text = client.responseText;
				let html = this.#converter.makeHtml(text);
				this.container.innerHTML = html;
				this.currentContent = content;
				this.#preProcessing();
			}
		};
		client.send();
		return this;
	}

	#preProcessing() {
		this.container.querySelectorAll("*").forEach((e) => {
			if (e.tagName === "IMG") this.#imgProcessing(e);
			else if (e.tagName === "P") this.#pProcessing(e);
		});
		this.#embedClasses();
	}

	#imgProcessing(img) {
		let link = img.src.split("/").slice(3).join("/");
		img.src = `${this.#directory}/${link}`;

		let setMaxWidth = () => {
			let containerComputedStyle = window.getComputedStyle(
				this.container
			);
			let containerWidth =
				parseFloat(containerComputedStyle.width) -
				(parseFloat(containerComputedStyle.paddingLeft) +
					parseFloat(containerComputedStyle.paddingRight));

			img.style.maxWidth = containerWidth + "px";
		};

		setMaxWidth();
		window.addEventListener("orientationchange", () => {
			setTimeout(() => {
				setMaxWidth();
			}, 100);
		});
	}

	#pProcessing(p) {
		if (p.innerText) {
			if (p.innerText.isArabic()) {
				console.log(p.style);
				p.style.direction = "rtl";
			}
		}
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
	// img: ["w-100"],
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
