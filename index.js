const fs = require('fs');
const path = require('path');

const customDir = process.argv[2] ?? 'source';
const newCustomDir = process.argv[3] ?? 'new-source';
const deleteSource = process.argv[4] ?? true;

const base = path.join(__dirname, customDir);
const newBase = path.join(__dirname,  newCustomDir);

function readDirRecursively(base, level) {
    fs.readdir(base, (error, files) => {
        if (error) {
            console.log("This directory doesn't exist")
            throw error;
        }

        files.forEach(file => {
            const firstLetter = file[0].toUpperCase();

            fs.mkdir(path.join(newBase, firstLetter), {recursive: true}, (error) => {
                if (error) throw error;

                const futureLocation = path.join(newCustomDir, firstLetter, file)
                const currentLocation = path.join(base, file);

                fs.stat(currentLocation, (error, state) => {
                    if (error) throw error;

                    if (state.isDirectory()) {
                        readDirRecursively(currentLocation, level + 1)
                    } else {
                        fs.copyFile(currentLocation, futureLocation, (error) => {
                            if (error) throw error;

                            if (eval(deleteSource)) {
                                fs.unlink(currentLocation,() => {
                                    fs.rmdir(base, {recursive: true}, (err) => {
                                        if (err) throw err
                                    });
                                });
                            }
                        })
                    }
                });
            });
        })
    });
}

readDirRecursively(base, 0)

