const fs = require('fs');
const path = require('path');

const yargs = require('yargs');

const argv = yargs
    .usage('Usage: node $0 [options]')
    .help('help')
    .alias('help', 'h')
    .version('0.0.1')
    .alias('version', 'v')
    .example('node $0 -e [path] -o [path] -D')
    .option('entry', {
        alias: 'e',
        describe: 'Путь к читаемой папке',
        demandOption: true
    })
    .option('output', {
        alias: 'o',
        describe: 'Путь к итоговой папке',
        default: './output'
    })
    .option('delete', {
        alias: 'D',
        describe: 'Удалить исходню директорию?',
        type: 'boolean',
        default: false
    })
    .epilog('application')
    .argv;

const paths = {
    src: path.normalize(path.resolve(__dirname, argv.entry)),
    dist: path.normalize(path.resolve(__dirname, argv.output))
}

const deleteSource = argv.delete;

function readDirRecursively(base, level) {
    fs.readdir(base, (error, files) => {
        if (error) {
            console.log("This directory doesn't exist")
            throw error;
        }

        files.forEach(file => {
            const currentLocation = path.join(base, file);

            fs.stat(currentLocation, (error, state) => {
                if (error) throw error;

                if (state.isDirectory()) {
                    readDirRecursively(currentLocation, level + 1)
                } else {
                    const firstLetter = file[0].toUpperCase();

                    fs.mkdir(path.join(paths.dist, firstLetter), {recursive: true}, (error) => {
                        if (error) throw error;

                        const futureLocation = path.join(paths.dist, firstLetter, file)

                        fs.copyFile(currentLocation, futureLocation, (error) => {
                            if (error) throw error;
                            if (deleteSource) {
                                fs.unlink(currentLocation,() => {
                                    fs.rmdir(base, {recursive: true}, (err) => {
                                        if (err) throw err
                                    });
                                });
                            }
                        })
                    });
                }
            });
        })
    });
}

readDirRecursively(paths.src, 0)
