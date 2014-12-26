const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Extension.imports.settings;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const SCHEMA_NAME = "org.gnome.shell.extensions.commandoutput";

const CommandOutputPrefs = new GObject.Class({
        Name: 'CommandOutput.Prefs',
        GTypeName: 'CommandOutputWidget',
        Extends: Gtk.Grid,

        _init: function(params) {
            let localeDir = Extension.dir.get_child('po/locale');
            if (localeDir.query_exists(null))
                Gettext.bindtextdomain('commandoutput', localeDir.get_path());
            this.parent(params);
            this.main = new Gtk.Grid({
                margin: 10,
                row_spacing: 10,
                column_spacing: 20,
                column_homogeneous: false,
                row_homogeneous: true
            });

            this.main.attach(new Gtk.Label({label: _("Refresh interval (seconds)"),
                                            hexpand: true,
                                            halign: Gtk.Align.START}), 1, 1, 1, 1);

            this.main.attach(new Gtk.Label({label: _("Command to output"),
                                            hexpand: true,
                                            halign: Gtk.Align.START}), 1, 2, 1, 1)

            this.rate = new Gtk.SpinButton({
                    adjustment: new Gtk.Adjustment({
                            lower: 1,
                            upper: 2147483647,
                            step_increment: 1
                    }),
                    halign: Gtk.Align.END
            });

            this.command = new Gtk.Entry();

            this.main.attach(this.rate, 4, 1, 2, 1);
            this.main.attach(this.command, 4, 2, 2, 1);

            this._settings = Settings.getSchema(Extension);

            this._settings.bind(Settings.Keys.RATE,         this.rate,    'value',Gio.SettingsBindFlags.DEFAULT);
            this._settings.bind(Settings.Keys.COMMAND,      this.command, 'text', Gio.SettingsBindFlags.DEFAULT);

            this._commandID = this.command.connect('activate', Lang.bind(this, this._save));
            this._rateID = this.rate.connect('value-changed', Lang.bind(this, this._save));

            this.main.show_all();
        },

        _save: function() {
            this._settings.set_string(Settings.Keys.COMMAND, this.command.text);
            this._settings.set_int(Settings.Keys.RATE, this.rate.value);
        },
});

function init() {

}

function buildPrefsWidget() {
    let prefs = new CommandOutputPrefs();

    return prefs.main;
}
