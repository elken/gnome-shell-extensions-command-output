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
            this._outputLabel = new St.Label({style_class: "co-label"});
            this._output = new St.Bin({reactive: true, 
                track_hover: true
            });

            this._iText = "";
            this._stopped = false;
            this._loaded = false;
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
            Settings.initTranslations(Extension);
        },

        _doCommand: function() {
            [res,pid,fdin,fdout,fderr] = GLib.spawn_async_with_pipes(null, this._toUtfArray(this._command), null, GLib.SpawnFlags.SEARCH_PATH, null);
            let outstream = new Gio.UnixInputStream({fd:fdout,close_fd:true});
            let errstream = new Gio.UnixInputStream({fd:fderr,close_fd:true});
            let stdout = new Gio.DataInputStream({base_stream: outstream});
            let stderr = new Gio.DataInputStream({base_stream: errstream});

            let [out, o_size] = stdout.read_line(null);
            
            outstream.close(null);
            errstream.close(null);

            if(out == null) {
                let [err, er_size] = sderr.read_line(null);
                return err.toString();
            }
            else {
                let outS = out.toString();
                outS += " ";
                return outS;
            }
        },

        _doScroll: function(str) {
            var buf = str[0];
            var str2 = "";
            for(var i=1;i<str.length;i++) {
                str2 += str[i];
            }

            str2 += buf;
            return str2;
        },

        _doScroll: function(str) {
            var buf = str[0];
            var str2 = "";
            for(var i=1;i<str.length;i++) {
                str2 += str[i];
            }

            str2 += buf;
            return str2;
        },

        _isFound: function(str) {
            var f = false;
            for(var i=0; i < str.length;i++) {
                if(str[i] == "~") {
                    f = true;
                }
            }

            if(f) {
                let re = /~/gi;
                let s = str.replace(re, GLib.get_home_dir());
                return [f, s];
            }
            else {
                return [f,str];
            }
        },

        _toUtfArray: function(str) {
            let [f, s2] = this._isFound(str);
            let arr = s2.split(" ");

            return arr;
        },

        _refresh: function() {
            if(!this._loaded) {
                this._load();
                this._iText = this._doCommand();
                this._loaded = true;
            }
            do
            {
                this._iText = this._doScroll(this._iText);
                this._outputLabel.set_text(this._iText);
            }
            while(!this._isScroll);
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
            this._isScroll = this._settings.get_boolean(Settings.Keys.ISSCROLL);
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
