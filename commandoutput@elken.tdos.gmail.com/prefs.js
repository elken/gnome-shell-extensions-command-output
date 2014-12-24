const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Extension.imports.convenience;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const SCHEMA_NAME = "org.gnome.shell.extensions.commandoutput";

const CommandOutputPrefs = new GObject.Class({
        Name: 'CommandOutput.Prefs',
        GTypeName: 'CommandOutputWidget',
        Extends: Gtk.Grid,

        _init: function(params) {
            this.parent(params);
            this.main = new Gtk.Grid({
                margin: 10,
                row_spacing: 10,
                column_spacing: 20,
                column_homogeneous: false,
                row_homogeneous: true
            });

            this.main.attach(new Gtk.Label({label: _("Refresh interval (in ms)"),
                                            hexpand: true,
                                            halign: Gtk.Align.START}), 1, 1, 1, 1);

            this.main.attach(new Gtk.Label({label: _("Command to output"),
                                            hexpand: true,
                                            halign: Gtk.Align.START}), 1, 2, 1, 1)

            this.rate = new Gtk.SpinButton({
                    adjustment: new Gtk.Adjustment({
                            lower: 0,
                            upper: 2147483647,
                            step_increment: 1000
                    }),
                    halign: Gtk.Align.END
            });

            this.command = new Gtk.Entry();

            this.main.attach(this.rate, 4, 1, 2, 1);
            this.main.attach(this.command, 4, 2, 2, 1);

            //this.settings = this._getSchema();
            this.settings = Convenience.getSettings();

            this.settings.bind('refresh-rate', this.rate,    'text',  Gio.SettingsBindFlags.DEFAULT);
            this.settings.bind('command',      this.command, 'value', Gio.SettingsBindFlags.DEFAULT);

            this.main.show_all();
        },

            /*
        _getSchema: function() {
             let schemaDir = Extension.dir.get_child('schemas').get_path();
             let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir, Gio.SettingsSchemaSource.get_default(), false);
             let schema = schemaSource.lookup(SCHEMA_NAME, false);
             return new Gio.Settings({ settings_schema: schema  });
        },
             */
});

function init() {

}

function buildPrefsWidget() {
    let prefs = new CommandOutputPrefs();

    return prefs.main;
}
