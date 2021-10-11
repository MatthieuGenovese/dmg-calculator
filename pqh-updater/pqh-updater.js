const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const readline = require('readline');
const webp = require('webp-converter');
const fse = require('fs-extra');

const python_tools = require('./python-tools/python-tools');
const config = require('./config.json');

const equipment_dictionary = config["equipment_dictionary"];
const quest_dictionary = config["quest_dictionary"];
const database_dir = config["database"]["directory"];
const extract_dir = config["database"]["download_directory"];
const css_path = path.join(config["system"]["output_directory"], 'css', 'data.css');

run();

function run() {
    /*update_database().then(() =>{
        extract_images2();
    });*/
    /*update_database().then(() => {
        console.log('SUCCESSFULLY UPDATED DATABASE');
        setup_files();
    });*/
}


function extract_images2() {

        // OPEN (LATEST CREATED) EQUIPMENT DATA AND TRANSLATE ME DOCUMENT
        const manifest_path = path.join(database_dir, 'manifest'),
        manifest = fs.readFileSync(manifest_path, 'utf8');
        let manifestArray = manifest.split('\n');

    return new Promise(async (resolve) => {
        const directory = config["database"]["download_directory"],
            encrypted_dir = path.join(directory, 'encrypted'),
            decrypted_dir = path.join(directory, 'decrypted');

        // CREATE DIRECTORIES
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        if (!fs.existsSync(encrypted_dir)) {
            fs.mkdirSync(encrypted_dir);
        }
        if (!fs.existsSync(decrypted_dir)) {
            fs.mkdirSync(decrypted_dir);
        }

        // FIND FILE HASH FROM MANIFEST
        let files = {};
        manifestArray.forEach((file_name) => {
            const file_index = manifest.indexOf(file_name),
                line_end = manifest.indexOf('\n', file_index),
                file_data = manifest.substring(file_index, line_end).split(',');
                //a/all_battleunit_109001.unity3d,f04a7b54abd5960b28f4a4e9efeecc2f,tutorial1,675783,
            files[file_name] = {
                "hash": file_data[1],
                "encrypted_path": path.join('.', extract_dir, 'encrypted', file_name + '.unity3d')
            };
        });

        // DOWNLOAD ENCRYPTED .unity3d FILES FROM CDN
        for (const file_name in files) {
            let fileNameFiltered = file_name.split(',')[0].substring(2,file_name.split(',')[0].length);
            await get_asset(fileNameFiltered, files[file_name]["hash"]);
            console.log('DOWNLOADED', fileNameFiltered , '; SAVED AS', fileNameFiltered);
            //await python_tools.deserialize(files[file_name]["encrypted_path"], files[file_name]["decrypted_path"]);
        }

        resolve(files);
    });

    function get_asset(output_path, hash) {
        return new Promise(async function(resolve) {
          //  const outPathfiltered = output_path.split(',')[0].substring(2,output_path.split(',')[1].length)
            const file = fs.createWriteStream(path.join('.', extract_dir, 'encrypted', output_path));
            http.get('http://prd-priconne-redive.akamaized.net/dl/pool/AssetBundles/' + hash.substr(0, 2) + '/' + hash, function(response) {
                const stream = response.pipe(file);
                stream.on('finish', () => {
                    resolve();
                });
            });
        });
    }
}


function download_manifest2() {
    return new Promise(async function(resolve) {
        let bundle = '';
        let current_version;
        const version_file = path.join(database_dir, 'version');
        const json = JSON.parse(fs.readFileSync(version_file, 'utf8'));
        current_version = {
            truth_version: json['truth_version'],
            hash: json['hash'],
        };
        let truth_version = parseInt(current_version['truth_version']);
        http.request({
            host: 'prd-priconne-redive.akamaized.net',
            path: '/dl/Resources/' + truth_version + '/Jpn/AssetBundles/Windows/manifest/icon_assetmanifest',
            method: 'GET',
        }, (res) => {
            res.on('data', function(chunk) {
                bundle += Buffer.from(chunk).toString();
            });
            res.on('end', () => {
                bundle += '\n';
                //all_manifest
                http.request({
                    host: 'prd-priconne-redive.akamaized.net',
                    path: '/dl/Resources/' + truth_version + '/Jpn/AssetBundles/Windows/manifest/unit_assetmanifest',
                    method: 'GET',
                }, (res) => {
                    res.on('data', function(chunk) {
                        bundle += Buffer.from(chunk).toString();
                    });
                    res.on('end',() => {
                        bundle += '\n';
                        http.request({
                            host: 'prd-priconne-redive.akamaized.net',
                            path: '/dl/Resources/' + truth_version + '/Jpn/AssetBundles/Windows/manifest/all_assetmanifest',
                            method: 'GET',
                        }, (res) => {
                            res.on('data', function(chunk) {
                                bundle += Buffer.from(chunk).toString();
                            });
                            res.on('end', () => {
                                const manifest_path = path.join(database_dir, 'manifest');
                                fs.writeFile(manifest_path, bundle, function (err) {
                                    if (err) throw err;
                                    console.log('DOWNLOADED ICON/UNIT MANIFEST ; SAVED AS', manifest_path);
                                    resolve();
                                });
                            });
                        }).end();
                    });
                }).end();
            });
        }).end();
    });
}

function update_database() {
    return new Promise(async function(resolve) {
        // CHECK IF DATABASE DIRECTORY EXISTS
        if (!fs.existsSync(database_dir)) {
            fs.mkdirSync(database_dir);
        }

        // READ CURRENT DATABASE VERSION
        let current_version;
        const version_file = path.join(database_dir, 'version');
        if (fs.existsSync(version_file)) {
            // DATABASE VERSION FILE EXISTS
            const json = JSON.parse(fs.readFileSync(version_file, 'utf8'));
            current_version = {
                truth_version: json['truth_version'],
                hash: json['hash'],
            };
            console.log('EXISTING VERSION FILE FOUND: CURRENT TRUTH VERSION =', current_version['truth_version']);
        }
        else {
            // DATABASE VERSION FILE DOES NOT EXIST, START FROM SCRATCH
            current_version = {
                truth_version: config["database"]["default_truth_version"],
                hash: ''
            };
            console.log('VERSION FILE NOT FOUND. USING TRUTH VERSION', current_version['truth_version']);
        }

        console.log('CHECKING FOR DATABASE UPDATES...');
        let truth_version = parseInt(current_version['truth_version']);
        (async () => {
            function request(guess) {
                return new Promise((resolve) => {
                    http.request({
                        host: 'prd-priconne-redive.akamaized.net',
                        path: '/dl/Resources/' + guess + '/Jpn/AssetBundles/iOS/manifest/manifest_assetmanifest',
                        method: 'GET',
                    }, (res) => {
                        resolve(res);
                    }).end();
                });
            }

            // FIND NEW TRUTH VERSION
            const max_test = config["database"]["max_test_amount"];
            const test_multiplier = config["database"]["test_multiplier"];
            for (let i = 1 ; i <= max_test ; i++) {
                const guess = truth_version + (i * test_multiplier);
                console.log('[GUESS]'.padEnd(10), guess);
                const res = await request(guess);
                if (res.statusCode === 200) {
                    console.log('[SUCCESS]'.padEnd(10), guess, ' RETURNED STATUS CODE 200 (VALID TRUTH VERSION)');

                    // RESET LOOP
                    truth_version = guess;
                    i = 0;
                }
            }
        })().then(() => {
            console.log('VERSION CHECK COMPLETE ; LATEST TRUTH VERSION =', truth_version);

            // CHECK IF LATEST TRUTH VERSION IS DIFFERENT FROM CURRENT
            if (truth_version === current_version['truth_version']) {
                console.log('NO UPDATE FOUND, MUST BE ON THE LATEST VERSION!');
            }

            let bundle = '';
            http.request({
                host: 'prd-priconne-redive.akamaized.net',
                path: '/dl/Resources/' + truth_version + '/Jpn/AssetBundles/Windows/manifest/masterdata_assetmanifest',
                method: 'GET',
            }, (res) => {
                res.on('data', function(chunk) {
                    bundle += Buffer.from(chunk).toString();
                });
                res.on('end', () => {
                    const b = bundle.split(',');
                    const hash = b[1];

                    // UPDATE VERSION FILE
                    current_version = {
                        truth_version: truth_version,
                        hash: hash,
                    };
                    fs.writeFile(version_file, JSON.stringify(current_version), function (err) {
                        if (err) throw err;
                    });

                    // DOWNLOAD FILES
                    download_CDB(hash).then(() => {
                        download_manifest2().then(() => {
                            // DATABASE UPDATE COMPLETE
                            resolve();
                        });
                    });
                });
            }).end();
        });

        function download_CDB(hash) {
            return new Promise(async function(resolve) {
                const cdb_path = path.join(database_dir, 'master.cdb');
                const db_path = path.join(database_dir, 'master.db');
                const file = fs.createWriteStream(cdb_path);
                http.get('http://prd-priconne-redive.akamaized.net/dl/pool/AssetBundles/' + hash.substr(0, 2) + '/' + hash, function(response) {
                    const stream = response.pipe(file);
                    stream.on('finish', () => {
                        // CONVERT CDB TO MDB/DB
                        exec('Coneshell_call.exe -cdb ' + cdb_path + ' ' + db_path, (error, stdout, stderr) => {
                            if (error) throw error;
                            if (stderr) throw stderr;
                            console.log('DOWNLOADED AND CONVERTED DATABASE [' + hash + '] ; SAVED AS ' + db_path);
                            resolve();
                        });
                    });
                });
            });
        }
    });
}