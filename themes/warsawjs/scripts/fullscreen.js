(function (root) {
    'use strict';

    // Alias for `window.document`.
    var document = root.document;

    // Catch reference to button.
    var link = document.querySelector('.badge-left');

    // Link must be available in DOM.
    if (!link) return;

    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API|MDN}
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    // Add listener for 'click'.
    link.addEventListener('click', function (evt) {
        evt.preventDefault();
        toggleFullscreen();
    });
}(this));
