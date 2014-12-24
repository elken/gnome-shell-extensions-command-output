/* TODO:
 * - Get anything working
 * :(
 */

const St = imports.gi.St;
const Shell = imports.gi.Shell
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Util = imports.misc.util;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const WIDTH = 50;
const COMMAND = "/usr/bin/echo It works! ";
const LOCALE = GLib.get_language_names()[1];

const INTERVAL = 500;

const POSITION = {
    CENTER: 0,
    LEFT: 1,
    RIGHT: 2,
    TRAY: 3
};

const CommandOutput = new Lang.Class({
        Name: 'CommandOutput.Extension',
        _button: null,

        enable: function() {
            iText = this._doCommand();
            this._button = new St.Bin({reactive: false, track_hover: false});
            let text = new St.Label({text: iText});
            this._button.set_child(text);

            Main.panel._rightBox.insert_child_at_index(this._button, 0);
        },

        disable: function() {
            Main.panel._rightBox.remove_child(this._button);
        },

        _init:  function() {
        },

        _doCommand: function() {
            [res,pid,fdin,fdout,fderr] = GLib.spawn_async_with_pipes(null, this._toUtfArray(COMMAND), null, 0, null);
            outstream = new Gio.UnixInputStream({fd:fdout,close_fd:true});
            stdout = new Gio.DataInputStream({base_stream: outstream});
            watch = GLib.child_watch_add(0, pid, function(pid, status) {
                    try {
                        GLib.source_remove(watch);
                        callback(pid, status, stdout);
                        stdout.close(null);
                        outstream.close(null);
                    } catch(err) {
                        Main.notify(err);
                    }
                }
            )

            let [out, size] = stdout.read_line(null);

            return out.toString();
        },

        _toUtfArray: function(str) {
            arr = str.split(" ");
            return arr;
        },
});

function init() {
    return new CommandOutput;
}
