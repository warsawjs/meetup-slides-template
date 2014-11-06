/*global Gamepad, shower */

(function () {
    'use strict';

    if (!Gamepad) {
        throw new ReferenceError('gamepad.js is required');
    }

    if (!shower) {
        throw new ReferenceError('shower.js is required');
    }

    Gamepad.on('joystick.left', function (evt) {
        var dirs = evt.direction;

        if (dirs.left) {
            shower.prev();
        } else if (dirs.right) {
            shower.next();
        }
    });

    Gamepad.on('joystick.right', function (evt) {
        var dirs = evt.direction;

        if (dirs.left) {
            shower.prev();
        } else if (dirs.right) {
            shower.next();
        }
    });
}());
