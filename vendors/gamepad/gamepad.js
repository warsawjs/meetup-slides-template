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

(function (window) {
    'use strict';

    // Outer reference to use and observe about emit events.
    var Gamepad;

    // Instance of interval, which scan about joysticks moves.
    var waiting;

    // Utilities.
    // ----------

    // Shorthand to use.
    var toString = Object.prototype.toString;

    // Shortcut to often use.
    var isArray = Array.isArray;

    // Useful fn to check if plain object.
    function isPlainObject(o) {
        return toString.call(o) === '[object Object]';
    }

    // Shortcut to often use.
    function has(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    // Check that browser support game pads.
    var isSupportGamepad = has(window, 'GamepadEvent');

    // Method override first object, by values from next passed objects.
    function extend(orig, next) {
        var result = next;

        if (isArray(orig)) {
            orig.forEach(function (key, index) {
                if (has(next, index)) {
                    orig[index] = next[index];
                }
            });
            result = orig;
        } else if (isPlainObject(orig)) {
            Object.keys(next).forEach(function (prop) {
                orig[prop] = next[prop];
            });
            result = orig;
        }

        return result;
    }

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

    /**
     * Return from GamepadList active pad or null.
     *
     * @returns {Gamepad|null}
     */
    function getActivePad() {
        var i;
        // Get information from browser, about connected game pads.
        var padlist = window.navigator.getGamepads();

        for (i = 0; i < Gamepad.MAX_PADS; ++i) {
            if (padlist[i] && padlist[i].connected) {
                return padlist[i];
            }
        }

        return null;
    }

    /**
     * Support arrows: UP, RIGHT, DOWN, LEFT.
     *
     * @param {Gamepad} pad
     */
    function handleArrows(pad) {
        if (pad.buttons[4].pressed) {
            Gamepad.emit('arrow:up');
        }

        if (pad.buttons[5].pressed) {
            Gamepad.emit('arrow:right');
        }

        if (pad.buttons[6].pressed) {
            Gamepad.emit('arrow:down');
        }

        if (pad.buttons[7].pressed) {
            Gamepad.emit('arrow:left');
        }
    }

    /**
     * Handle shapes: Triangle, Circle, Cross, Square.
     *
     * @param {Gamepad} pad
     */
    function handleShapes(pad) {
        if (pad.buttons[12].pressed) {
            Gamepad.emit('shape:triangle');
        }

        if (pad.buttons[13].pressed) {
            Gamepad.emit('shape:circle');
        }

        if (pad.buttons[14].pressed) {
            Gamepad.emit('shape:cross');
        }

        if (pad.buttons[15].pressed) {
            Gamepad.emit('shape:square');
        }
    }

    /**
     * Handle special buttons: Select, Start, PS
     *
     * @param {Gamepad} pad
     */
    function handleSpecial(pad) {
        if (pad.buttons[0].pressed) {
            Gamepad.emit('special:select');
        }

        if (pad.buttons[3].pressed) {
            Gamepad.emit('special:start');
        }

        if (pad.buttons[16].pressed) {
            Gamepad.emit('special:ps');
        }
    }

    /**
     * Handle extras buttons: L1, L2, R1, R2
     *
     * @param {Gamepad} pad
     */
    function handleExtras(pad) {
        if (pad.buttons[10].pressed) {
            Gamepad.emit('extra:l1');
        }

        if (pad.buttons[8].pressed) {
            Gamepad.emit('extra:l2');
        }

        if (pad.buttons[11].pressed) {
            Gamepad.emit('extra:r1');
        }

        if (pad.buttons[9].pressed) {
            Gamepad.emit('extra:r2');
        }
    }

    /**
     * Analyze game pad axes, and emit event.
     *
     * @param {Gamepad} pad
     */
    function handleJoysticks(pad) {
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
            Gamepad.emit('joystick:left', left);
        }

        // Check activity of right joystick
        Object.keys(right).forEach(function (dir) {
            rightStatuses.push(right[dir]);
        });

        // If any direction was choose emit event.
        if (rightStatuses.indexOf(true) !== -1) {
            Gamepad.emit('joystick:right', right);
        }
    }

    // Handle game pad actions.
    function update() {
        // Get active pad.
        var activePad = getActivePad();

        // If any active do nothing.
        if (!activePad) {
            return;
        }

        handleJoysticks(activePad);
        handleArrows(activePad);
        handleShapes(activePad);
        handleSpecial(activePad);
        handleExtras(activePad);

        // Run as quick as browser can.
        // window.requestAnimationFrame(update, document.body);
        // window.requestAnimationFrame(update);
    }

    // Global API object.
    Gamepad = {};

    // Maximum number of connected pads.
    Gamepad.MAX_PADS = 4;

    // Extend Gamepad by events.
    extend(Gamepad, EventManager);

    if (isSupportGamepad) {
        window.addEventListener('gamepadconnected', function (evt) {
            // console.info('Gamepad: Connected: ', evt);
            console.info('Gamepad: Connected: ' + evt.gamepad.id);
            // window.requestAnimationFrame(update, document.body);
            waiting = window.setInterval(update, 180);
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
