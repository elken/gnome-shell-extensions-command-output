#!/bin/sh
UUID=$(grep uuid metadata.json | cut -d "\"" -f4)
rm -f ../${UUID}.zip
zip -r ../${UUID}.zip *
