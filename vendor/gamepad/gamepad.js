// # Gamepad
//
// ### _Service to handle Gamepad joysticks_.
//
// Example, how connect to *Gamepad API*.
// ```js
// Gamepad.on('joystick.left', function (params) {
//     console.log('move left joystick', params.direction);
// });
// ```
//
// ### _Connect your gamepad and go!_

/*jslint devel: true, plusplus: true, vars: true */
/*global window */

(function (window) {
    'use strict';

    // Handle game pad actions.
    var update;

    // Outer reference to use and observe about emit events.
    var Gamepad;

    // Get from GamepadList active pad.
    var getActive;

    // Analyze game pad axes, and emit event.
    var handleJoysticks;

    // Instance of interval, which scan about joysticks moves.
    var waiting;

    // Utilities.
    // ----------

    // Shorthand to use.
    var toString = Object.prototype.toString;

    // Shortcut to often use.
    var isArray = Array.isArray;

    // Useful fn to check if plain object.
    var isPlainObject = function (o) {
        return toString.call(o) === '[object Object]';
    };

    // Shortcut to often use.
    var has = function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Check that browser support game pads.
    var supportGamepad = has(window, 'GamepadEvent');

    // Method override first object, by values from next passed objects.
    var extend = function (orig, next) {
        var result = next;

        if (isArray(orig)) {
            /*jslint unparam: true */
            orig.forEach(function (key, index) {
                if (has(next, index)) {
                    orig[index] = next[index];
                }
            });
            /*jslint unparam: false */
            result = orig;
        } else if (isPlainObject(orig)) {
            Object.keys(next).forEach(function (prop) {
                orig[prop] = next[prop];
            });
            result = orig;
        }

        return result;
    };

    // Event manager.
    // --------------

    // Very friendly event manager.
    var EventManager = (function () {
        var listeners = [];

        return {
            on: function on(name, fn, ctx) {
                // Push to private lists of listeners.
                listeners.push({
                    name: name,
                    fn: fn,
                    // If the context is not passed, use `this`.
                    ctx: ctx || this
                });
            },

            off: function (name) {
                listeners.forEach(function (listener, index) {
                    if (listener.name === name) {
                        delete listeners[index];
                    }
                });
            },

            emit: function emit(name, params) {
                listeners.forEach(function (event) {
                    if (event.name === name) {
                        event.fn.call(event.ctx, params);
                    }
                });
            }
        };
    }());

    // Pure gamepads functions.
    // ------------------------

    update = function () {
        // Get information from browser, about connected game pads.
        var pads = window.navigator.getGamepads();
        // console.log('pads', pads);

        var active = getActive(pads);
        // console.log('active', active);

        if (active !== null) {
            handleJoysticks(active);
        }

        // Run as quick as browser can.
        // window.requestAnimationFrame(update, document.body);
        // window.requestAnimationFrame(update);
    };

    getActive = function (padlist) {
        var i;

        for (i = 0; i < Gamepad.MAX_PADS; ++i) {
            if (padlist[i] && padlist[i].connected) {
                return padlist[i];
            }
        }

        return null;
    };

    handleJoysticks = function (pad) {
        var leftStatuses = [];
        var rightStatuses = [];
        var len = pad.axes.length;

        // Warning!
        // Windows 8 (Chrome) - right joystick (up / down) is 6th value in array `pad.axes`
        // Mac OS X (Firefox) - right joystick (up / down) is 4th value.

        var left = {
            right: (pad.axes[0] === 1),
            left: (pad.axes[0] === -1),
            down: (pad.axes[1] === 1),
            up: (pad.axes[1] === -1)
        };
        var right = {
            right: (pad.axes[2] === 1),
            left: (pad.axes[2] === -1),
            down: (pad.axes[len - 1] === 1),
            up: (pad.axes[len - 1] === -1)
        };

        // Check activity of left joystick
        Object.keys(left).forEach(function (dir) {
            leftStatuses.push(left[dir]);
        });

        // If any direction was choose emit event.
        if (leftStatuses.indexOf(true) !== -1) {
            Gamepad.emit('joystick.left', {
                direction: left
            });
        }

        // Check activity of right joystick
        Object.keys(right).forEach(function (dir) {
            rightStatuses.push(right[dir]);
        });

        // If any direction was choose emit event.
        if (rightStatuses.indexOf(true) !== -1) {
            Gamepad.emit('joystick.right', {
                direction: right
            });
        }
    };

    // Global API object.
    Gamepad = {};

    // Maximum number of connected pads.
    Gamepad.MAX_PADS = 4;

    // Extend Gamepad by events.
    extend(Gamepad, EventManager);

    if (supportGamepad) {
        window.addEventListener('gamepadconnected', function (evt) {
            // console.info('Gamepad: Connected: ', evt);
            console.info('Gamepad: Connected: ' + evt.gamepad.id);
            // window.requestAnimationFrame(update, document.body);
            waiting = window.setInterval(update, 150);
        });

        window.addEventListener('gamepaddisconnected', function (evt) {
            // console.info('Gamepad: Disconnected: ', evt);
            console.info('Gamepad: Disconnected: ' + evt.gamepad.id);
            // window.cancelRequestAnimationFrame(update);
            window.clearInterval(waiting);
        });
    }

    // Export API `Gamepad`.
    // Use `window` because game pads only could using on browser environment,
    // because use `navigator` to get list of game pads.
    window.Gamepad = Gamepad;

    // Update as quick as browser can.
    // window.requestAnimationFrame(update, document.body);
    // window.requestAnimationFrame(update);

}(window));
