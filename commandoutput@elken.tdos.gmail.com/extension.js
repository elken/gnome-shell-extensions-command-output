const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Util = imports.misc.util;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Prefs = Extension.imports.prefs;

const LOCALE = GLib.get_language_names()[1];

const CommandOutput = new Lang.Class({
        Name: 'CommandOutput.Extension',

        enable: function() {
            this._output.set_child(this._outputLabel);
            this._update();
            this._output.connect('button-release-event', this._openSettings);
            Main.panel._rightBox.insert_child_at_index(this._output, 0);
        },

        disable: function() {
            this._save();
            Main.panel._rightBox.remove_child(this._output);
        },

        _init:  function() {
            this._settings = Settings.getSchema(Extension);
            this._load();
            this._outputLabel = new St.Label({text: "Starting up.."});
            this._output = new St.Bin({reactive: false, track_hover: false});
        },

        _doCommand: function() {
            [res,pid,fdin,fdout,fderr] = GLib.spawn_async_with_pipes(null, this._toUtfArray(this._command), null, GLib.SpawnFlags.SEARCH_PATH, null);
            let outstream = new Gio.UnixInputStream({fd:fdout,close_fd:true});
            let stdout = new Gio.DataInputStream({base_stream: outstream});

            let [out, size] = stdout.read_line(null);

            return out.toString();
        },

        _toUtfArray: function(str) {
            let arr = str.split(" ");
            return arr;
        },

        _update: function() {
            let iText = this._doCommand();
            this._outputLabel.set_text(iText);
            Mainloop.timeout_add_seconds(1, Lang.bind(this, this._update));
        },

        _load: function() {
            this._command = this._settings.get_string(Prefs.Keys.COMMAND);
            this._refreshRate = this._settings.get_int(Prefs.Keys.RATE);
        },

        _save: function() {
            this._settings.set_string(Prefs.Keys.COMMAND, this._command);
            this._settings.set_int(Prefs.Keys.RATE, this._refreshRate);
        },

        _openSettings: function () {
            Util.spawn(["gnome-shell-extension-prefs", Extension.uuid]);
        },
});

function init() {
    return new CommandOutput;
}
