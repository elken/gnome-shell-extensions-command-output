const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;
const Prefs = Extension.imports.prefs;

const LOCALE = GLib.get_language_names()[1];

const CommandOutput = new Lang.Class({
        Name: 'CommandOutput.Extension',
        _outputLabel: new St.Label({text: "Starting up.."}),
        _output: new St.Bin({reactive: false, track_hover: false}),
        _settings: Settings.getSchema(Extension),
        _command: null,
        _refreshRate: null,
        _timeout: null,
        _changeTimeout: false,

        enable: function() {
            this._output.set_child(this._outputLabel);
            this._timeout = null;
            this._changeTimeout = true;
            this._update();
            //Mainloop.timeout_add(1000, Lang.bind(this, this._update));
            Main.panel._rightBox.insert_child_at_index(this._output, 0);
        },

        disable: function() {
            Main.panel._rightBox.remove_child(this._output);
        },

        _init:  function() {
            this._command = this._settings.get_string(Prefs.Keys.COMMAND);
            this._refreshRate = this._settings.get_int(Prefs.Keys.RATE);
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
            //this._removeTimeout();
            this._timeout = Mainloop.timeout_add_seconds(this._refreshRate, Lang.bind(this, this._update()));
        },

        _removeTimeout: function() {
            if(this._timeout) {
                Mainloop.source_remove(this._timeout);
                this._timeout = null;
            }
        }
});

function init() {
    return new CommandOutput;
}
