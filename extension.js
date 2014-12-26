const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Main = imports.ui.main;
const Util = imports.misc.util;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;

const Gettext = imports.gettext;

const _ = Gettext.gettext;

const CommandOutput = new Lang.Class({
        Name: 'CommandOutput.Extension',

        enable: function() {
            this._outputLabel = new St.Label();
            this._output = new St.Bin({reactive: true, 
                track_hover: true
            });

            this._stopped = false;
            this._settings = Settings.getSchema(Extension);
            this._load();
            this._output.set_child(this._outputLabel);
            this._outputID = this._output.connect('button-release-event', this._openSettings);

            this._update();
            Main.panel._rightBox.insert_child_at_index(this._output, 0);
        },

        disable: function() {
            this._save();
            Main.panel._rightBox.remove_child(this._output);
            this._stopped = true;
            this._output.disconnect(this._outputID);
        },

        _init:  function() {
        let localeDir = Extension.dir.get_child('po/locale');
        if (localeDir.query_exists(null))
            Gettext.bindtextdomain('commandoutput', localeDir.get_path());
        },

        _doCommand: function() {
            [res,pid,fdin,fdout,fderr] = GLib.spawn_async_with_pipes(null, this._toUtfArray(this._command), null, GLib.SpawnFlags.SEARCH_PATH, null);
            let outstream = new Gio.UnixInputStream({fd:fdout,close_fd:true});
            let stdout = new Gio.DataInputStream({base_stream: outstream});

            let [out, size] = stdout.read_line(null);

            if(out == null) {
                return _("Error executing command.");
            }
            else {
                return out.toString();
            }
        },

        _toUtfArray: function(str) {
            for(var i=0; i < str.length;i++) {
                if(str[i] == "~") {
                    let re = /~/gi;
                    var s = str.replace(re, GLib.get_home_dir());
                }
            }
            let arr = s.split(" ");
            return arr;
        },

        _refresh: function() {
            this._load();
            let iText = this._doCommand();
            this._outputLabel.set_text(iText);
        },

        _update: function() {
            this._refresh();
            if (this._stopped == false) {
                Mainloop.timeout_add_seconds(this._refreshRate, Lang.bind(this, this._update));
            }
        },

        _load: function() {
            this._command = this._settings.get_string(Settings.Keys.COMMAND);
            this._refreshRate = this._settings.get_int(Settings.Keys.RATE);
        },

        _save: function() {
            this._settings.set_string(Settings.Keys.COMMAND, this._command);
            this._settings.set_int(Settings.Keys.RATE, this._refreshRate);
        },

        _openSettings: function () {
            Util.spawn(["gnome-shell-extension-prefs", Extension.uuid]);
        },
});

function init() {
    return new CommandOutput;
}
