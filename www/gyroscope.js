/**
 * This class provides access to device gyroscope data.
 * @constructor
 */
var argscheck = require('cordova/argscheck'),
    utils = require("cordova/utils"),
    exec = require("cordova/exec"),
    Orientation = require('./Orientation');

// Is the gyro sensor running?
var running = false;

// Keeps reference to watchGyroscope calls.
var timers = {};

// Array of listeners; used to keep track of when we should call start and stop.
var listeners = [];

// Last returned orientation object from native
var orientation = null;

// Tells native to start.
function start() {
    exec(function(a) {
        var tempListeners = listeners.slice(0);
        orientation = new Orientation(a.alpha, a.beta, a.gamma, a.absolute);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].win(orientation);
        }
    }, function(e) {
        var tempListeners = listeners.slice(0);
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].fail(e);
        }
    }, "Gyroscope", "start", []);
    running = true;
}

// Tells native to stop.
function stop() {
    exec(null, null, "Gyroscope", "stop", []);
    running = false;
}

// Adds a callback pair to the listeners array
function createCallbackPair(win, fail) {
    return {win:win, fail:fail};
}

// Removes a win/fail listener pair from the listeners array
function removeListeners(l) {
    var idx = listeners.indexOf(l);
    if (idx > -1) {
        listeners.splice(idx, 1);
        if (listeners.length === 0) {
            stop();
        }
    }
}

var gyroscope = {
    /**
     * Asynchronously acquires the gyroscope orientation repeatedly at a given interval.
     *
     * @param {Function} successCallback    The function to call each time the orientation data is available
     * @param {Function} errorCallback      The function to call when there is an error getting the orientation data. (OPTIONAL)
     * @param {GyroscopeOptions} options    The options for getting the gyroscope data such as timeout. (OPTIONAL)
     * @return String                       The watch id that must be passed to #clearWatch to stop watching.
     */
    watchGyroscope: function(successCallback, errorCallback, options) {
        argscheck.checkArgs('fFO', 'gyroscope.watchGyroscope', arguments);
        // Default interval (0.5 sec)
        var frequency = (options && options.frequency && typeof options.frequency == 'number') ? options.frequency : 500;

        // Keep reference to watch id, and report gyro readings as often as defined in frequency
        var id = utils.createUUID();

        var p = createCallbackPair(function(){}, function(e) {
            removeListeners(p);
            errorCallback && errorCallback(e);
        });
        listeners.push(p);

        timers[id] = {
            timer:window.setInterval(function() {
                if (orientation) {
                    successCallback(orientation);
                }
            }, frequency),
            listeners:p
        };

        if (running) {
            // If we're already running then immediately invoke the success callback
            // but only if we have retrieved a value, sample code does not check for null ...
            if (orientation) {
                successCallback(orientation);
            }
        } else {
            start();
        }

        return id;
    },

    /**
     * Clears the specified gyroscope watch.
     *
     * @param {String} id       The id of the watch returned from #watchGyroscope.
     */
    clearWatch: function(id) {
        // Stop javascript timer & remove from timer list
        if (id && timers[id]) {
            window.clearInterval(timers[id].timer);
            removeListeners(timers[id].listeners);
            delete timers[id];
        }
    }
};
module.exports = gyroscope;
