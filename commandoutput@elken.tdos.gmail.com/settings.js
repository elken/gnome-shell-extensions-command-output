const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext;

const SCHEMA_NAME = "org.gnome.shell.extensions.commandoutput";

const Keys = {
    RATE: 'refresh-rate',
    COMMAND: 'command'
};

const POSITION = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
    PANEL: 3,
};

function getSchema(extension) {
    let schemaDir = extension.dir.get_child('schemas').get_path();

    let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir, Gio.SettingsSchemaSource.get_default(), false);
    let schema = schemaSource.lookup(SCHEMA_NAME, false);
    return new Gio.Settings({ settings_schema: schema  });
}
