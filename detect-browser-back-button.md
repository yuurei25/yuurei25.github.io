# Detect Browser Back Button

(Note: As per Sharky's feedback, I've included code to detect backspaces)

So, I've seen these questions frequently on SO, and have recently run into the issue of controlling back button functionality myself. After a few days of searching for the best solution for my application (Single-Page with Hash Navigation), I've come up with a simple, cross-browser, library-less system for detecting the back button.

Most people recommend using:

```
window.onhashchange = function() {
 //blah blah blah
}
```

However, this function will also be called when a user uses on in-page element that changes the location hash. Not the best user experience when your user clicks and the page goes backwards or forwards.

To give you a general outline of my system, I'm filling up an array with previous hashes as my user moves through the interface. It looks something like this:

```
function updateHistory(curr) {
    window.location.lasthash.push(window.location.hash);
    window.location.hash = curr;
}
```

Pretty straight forward. I do this to ensure cross-browser support, as well as support for older browsers. Simply pass the new hash to the function, and it'll store it for you and then change the hash (which is then put into the browser's history).

I also utilise an in-page back button that moves the user between pages using the lasthash array. It looks like this:

```
function goBack() {
    window.location.hash = window.location.lasthash[window.location.lasthash.length-1];
    //blah blah blah
    window.location.lasthash.pop();
}
```

So this will move the user back to the last hash, and remove that last hash from the array (I have no forward button right now).

So. How do I detect whether or not a user has used my in-page back button, or the browser button?

At first I looked at window.onbeforeunload, but to no avail - that is only called if the user is going to change pages. This does not happen in a single-page-application using hash navigation.

So, after some more digging, I saw recommendations for trying to set a flag variable. The issue with this in my case, is that I would try to set it, but as everything is asynchronous, it wouldn't always be set in time for the if statement in the hash change. .onMouseDown wasn't always called in click, and adding it to an onclick wouldn't ever trigger it fast enough.

This is when I started to look at the difference between document, and window. My final solution was to set the flag using document.onmouseover, and disable it using document.onmouseleave.

What happens is that while the user's mouse is inside the document area (read: the rendered page, but excluding the browser frame), my boolean is set to true. As soon as the mouse leaves the document area, the boolean flips to false.

This way, I can change my window.onhashchange to:

```
window.onhashchange = function() {
    if (window.innerDocClick) {
        window.innerDocClick = false;
    } else {
        if (window.location.hash != '#undefined') {
            goBack();
        } else {
            history.pushState("", document.title, window.location.pathname);
            location.reload();
        }
    }
}
```

You'll note the check for #undefined. This is because if there is no history available in my array, it returns undefined. I use this to ask the user if they want to leave using a window.onbeforeunload event.

So, in short, and for people that aren't necessarily using an in-page back button or an array to store the history:

document.onmouseover = function() {
//User's mouse is inside the page.
window.innerDocClick = true;
}

```
document.onmouseover = function() {
    //User's mouse is inside the page.
    window.innerDocClick = true;
}

document.onmouseleave = function() {
    //User's mouse has left the page.
    window.innerDocClick = false;
}

window.onhashchange = function() {
    if (window.innerDocClick) {
        //Your own in-page mechanism triggered the hash change
    } else {
        //Browser back button was clicked
    }
}
```

And there you have it. a simple, three-part way to detect back button usage vs in-page elements with regards to hash navigation.

EDIT:

To ensure that the user doesn't use backspace to trigger the back event, you can also include the following (Thanks to @thetoolman on this Question):

```
$(function(){
    /*
     * this swallows backspace keys on any non-input element.
     * stops backspace -> back
     */
    var rx = /INPUT|SELECT|TEXTAREA/i;

    $(document).bind("keydown keypress", function(e){
        if( e.which == 8 ){ // 8 == backspace
            if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
                e.preventDefault();
            }
        }
    });
});
```
